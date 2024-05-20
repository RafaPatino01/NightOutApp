const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const https = require('https');  

const { Pool } = require('pg');
const multer = require('multer');
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');

const axios = require('axios');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();

app.use(express.json());

app.use(cors());

const port = 3000;

const pool = new Pool({
  user: 'root',
  host: '142.93.116.94',
  database: 'night_out_db',
  password: 'asdb4klgh5B#c',
  port: 5432,
});

pool.on('error', (err, client) => {
  console.error('Error in PostgreSQL connection:', err);
});

// Add this event listener to print a message when a connection is established
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL');
});

app.get('/', (req, res) => {
  res.send('Hello World! This is Night Out Backend');
});

app.get('/search_establecimientos', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener las variables de consulta de la solicitud
    const { price, searchQuery, selectedLocation, selectedType } = req.query;

    // Construir la consulta SQL con filtrado
    let sqlQuery = 'SELECT * FROM establecimientos WHERE 1 = 1'; // La condición inicial es siempre verdadera

    // Agregar condiciones de filtrado según las variables proporcionadas
    if (price) {
      if(price != "Todos"){
        sqlQuery += ` AND precios = '${price}'`;
      }
    }
    if (searchQuery) {
      sqlQuery += ` OR nombre ILIKE '%${searchQuery}%'`; // Filtrar por nombre que contenga la búsqueda
    }
    if (selectedLocation) {
      sqlQuery += ` AND ubicacion_general = '${selectedLocation}'`;
    }
    if (selectedType) {
      sqlQuery += ` AND tipo = '${selectedType}'`;
    }

    const result = await client.query(sqlQuery);
    const items = result.rows;

    client.release();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items from PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Create a GET request to fetch data from the PostgreSQL database
app.get('/get_establecimientos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM establecimientos'); // Replace with your table name
    const items = result.rows;
    client.release();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items from PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a GET request to fetch an "establecimiento" by its id
app.get('/get_establecimiento/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM establecimientos WHERE id = $1';
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      // If no "establecimiento" with the provided id is found, return a 404 Not Found status
      res.status(404).json({ error: 'Establecimiento not found' });
    } else {
      // If found, return the "establecimiento" as JSON
      const establecimiento = result.rows[0];
      res.json(establecimiento);
    }

    client.release();
  } catch (error) {
    console.error('Error fetching "establecimiento" from PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.delete('/delete_establecimiento/:id', async (req, res) => {
  try {
    const establecimientoId = req.params.id;

    const client = await pool.connect();

    // Construct the SQL DELETE statement
    const queryString = 'DELETE FROM public.establecimientos WHERE id = $1';

    // Execute the SQL statement with the provided user ID
    const result = await client.query(queryString, [establecimientoId]);

    client.release();

    res.json({ message: 'Establecimiento deleted successfully' });
  } catch (error) {
    console.error('Error deleting establecimiento:', error);
    res.status(500).json({ error: 'Error deleting establecimientoId' });
  }
});


app.put('/update_establecimiento/:id', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'imagen_mapa', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;

  try {
    const client = await pool.connect();

    // Start transaction
    await client.query('BEGIN');

    const keptImageUrls = req.body.imageUrls ? JSON.parse(req.body.imageUrls) : [];
    delete req.body.imageUrls; // Remove 'imageUrls' from textFields to avoid SQL errors

    // Process and update text fields
    const textFields = req.body;
    // Construct the SET part of the SQL update statement dynamically
    const setFields = Object.keys(textFields)
      .map((field, index) => `"${field}" = $${index + 1}`)
      .join(', ');
    const textValues = Object.values(textFields);

    if (setFields) {
      await client.query(`UPDATE establecimientos SET ${setFields} WHERE id = $${textValues.length + 1}`, [...textValues, id]);
    }

    await client.query(`UPDATE establecimientos SET images = $1 WHERE id = $2`, [keptImageUrls, id]);

    // Process and update images if any
    if (req.files.images) {
      // Similar process as add_establecimiento for each image
      for (const file of req.files.images) {
        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(__dirname, 'uploads', filename);

        // Use sharp to compress and save the image
        await sharp(file.buffer).resize(800).jpeg({ quality: 80 }).toFile(filepath);

        // Update your database here as per your schema
        await client.query(`UPDATE establecimientos SET images = array_append(images, $1) WHERE id = $2`, ["./uploads/"+filename, id]);
      }
    }

    if (req.files.imagen_mapa && req.files.imagen_mapa[0]) {
      const file = req.files.imagen_mapa[0];
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(__dirname, 'uploads', filename);

      await sharp(file.buffer).resize(800).jpeg({ quality: 80 }).toFile(filepath);

      // Update your database here for the map image
      // Assuming your database schema allows for a single map image per establecimiento
      await client.query(`UPDATE establecimientos SET imagen_mapa = $1 WHERE id = $2`, ["./uploads/"+filename, id]);
    }

    // Commit transaction
    await client.query('COMMIT');
    
    client.release();
    res.status(200).send('Establecimiento updated successfully');
  } catch (error) {
    console.error('Failed to update establecimiento:', error);
    res.status(500).send('Error updating establecimiento');
  }
});

app.get('/login', async (req, res) => {
  try {
    // Connect to the database
    const client = await pool.connect();

    // Get the values of correo_electronico and contrasena from the request parameters
    const { correo_electronico, contrasena } = req.query;

    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(contrasena).digest('hex');
    
    // Use parameterized queries to safely pass values to the SQL query
    const query = 'SELECT * FROM usuarios WHERE correo_electronico = $1 AND contrasena = $2';
    const result = await client.query(query, [correo_electronico, hashedPassword]);

    // Release the connection
    client.release();

    // Check if there are results in the query
    if (result.rows.length === 0) {
      // No matches found, respond with "NOT OK"
      res.status(400).json({ res: "NOT OK" });
    } else {
      // Matches found, respond with "OK" and the user data
      res.json({ res: "OK", user: result.rows[0] });
    }

  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/login_establecimiento', async (req, res) => {
  try {
    // Connect to the database
    const client = await pool.connect();

    // Get the values of correo_electronico and contrasena from the request parameters
    const { correo_electronico, contrasena } = req.query;

    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(contrasena).digest('hex');
    
    // Use parameterized queries to safely pass values to the SQL query
    const query = 'SELECT * FROM establecimientos WHERE email = $1 AND contrasena = $2';
    const result = await client.query(query, [correo_electronico, hashedPassword]);

    // Release the connection
    client.release();

    // Check if there are results in the query
    if (result.rows.length === 0) {
      // No matches found, respond with "NOT OK"
      res.status(400).json({ res: "NOT OK" });
    } else {
      // Matches found, respond with "OK" and the user data
      res.json({ res: "OK", user: result.rows[0] });
    }

  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Ruta para obtener usuarios por correo electrónico (si se proporciona)
app.get('/get_usuarios', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "correo_electronico" de la consulta
    const correoElectronico = req.query.correo_electronico;

    let queryString = 'SELECT * FROM usuarios';

    // Verificar si se proporcionó el parámetro "correo_electronico"
    if (correoElectronico) {
      queryString += ' WHERE correo_electronico = $1';
    }

    const result = await client.query(queryString, [correoElectronico]);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener un usuario por su id
app.get('/get_usuario_by_id/:id', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "id" de la ruta
    const { id } = req.params;

    // Query para buscar el usuario con el id dado
    const queryString = 'SELECT * FROM usuarios WHERE id = $1';

    const result = await client.query(queryString, [id]);

    client.release();

    if (result.rows.length === 0) {
      // If no "usuario" with the provided id is found, return a 404 Not Found status
      res.status(404).json({ error: 'Usuario not found' });
    } else {
      // If found, return the "usuario" as JSON
      res.json(result.rows[0]);
    }

  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



// Ruta para obtener usuarios por correo electrónico (si se proporciona)
app.get('/get_all_usuarios', async (req, res) => {
  try {
    const client = await pool.connect();

    let queryString = 'SELECT * FROM usuarios';

    const result = await client.query(queryString);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/update_usuario/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body; // Assuming you send user data in the request body

    const client = await pool.connect();
    const fieldUpdates = [];
    const queryValues = [];

    // Construct the SQL UPDATE statement based on the provided user data
    let queryIndex = 1; // Start with the first parameter index

    // Check if each field is included in the request body and add it to the update statement
    if (userData.nombre !== undefined) {
      fieldUpdates.push(`nombre = $${queryIndex}`);
      queryValues.push(userData.nombre);
      queryIndex++;
    }

    if (userData.apellido !== undefined) {
      fieldUpdates.push(`apellido = $${queryIndex}`);
      queryValues.push(userData.apellido);
      queryIndex++;
    }

    if (userData.genero !== undefined) {
      fieldUpdates.push(`genero = $${queryIndex}`);
      queryValues.push(userData.genero);
      queryIndex++;
    }

    if (userData.fecha_nacimiento !== undefined) {
      fieldUpdates.push(`fecha_nacimiento = $${queryIndex}`);
      queryValues.push(userData.fecha_nacimiento);
      queryIndex++;
    }

    if (userData.correo_electronico !== undefined) {
      fieldUpdates.push(`correo_electronico = $${queryIndex}`);
      queryValues.push(userData.correo_electronico);
      queryIndex++;
    }

    if (userData.redes_sociales !== undefined) {
      fieldUpdates.push(`redes_sociales = $${queryIndex}`);
      queryValues.push(userData.redes_sociales);
      queryIndex++;
    }

    if (userData.contrasena !== undefined) {
      fieldUpdates.push(`contrasena = $${queryIndex}`);
      queryValues.push(userData.contrasena);
      queryIndex++;
    }

    if (userData.reservas_activas !== undefined) {
      fieldUpdates.push(`reservas_activas = $${queryIndex}`);
      queryValues.push(userData.reservas_activas);
      queryIndex++;
    }

    if (userData.reservas_previas !== undefined) {
      fieldUpdates.push(`reservas_previas = $${queryIndex}`);
      queryValues.push(userData.reservas_previas);
      queryIndex++;
    }

    if (userData.num_telefono !== undefined) {
      fieldUpdates.push(`num_telefono = $${queryIndex}`);
      queryValues.push(userData.num_telefono);
      queryIndex++;
    }

    if (userData.admin !== undefined) {
      fieldUpdates.push(`"admin" = $${queryIndex}`);
      queryValues.push(userData.admin);
      queryIndex++;
    }

    // Create the final query string
    const queryString = `
      UPDATE public.usuarios 
      SET 
        ${fieldUpdates.join(', ')}
      WHERE id = $${queryIndex}
    `;

    queryValues.push(userId);

    // Execute the SQL statement with the provided data
    const result = await client.query(queryString, queryValues);

    client.release();

    res.json({ message: 'User data updated successfully' });
    console.log("UPDATED USER")

  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Error updating user data' });
  }
});

app.delete('/delete_usuario/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const client = await pool.connect();

    // Construct the SQL DELETE statement
    const queryString = 'DELETE FROM public.usuarios WHERE id = $1';

    // Execute the SQL statement with the provided user ID
    const result = await client.query(queryString, [userId]);

    client.release();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

app.delete('/delete_reserva/:id', async (req, res) => {
  try {
    const reservaId = req.params.id;

    const client = await pool.connect();

    // Construct the SQL DELETE statement
    const queryString = 'DELETE FROM public.reservas WHERE id = $1';

    // Execute the SQL statement with the provided reservaId
    const result = await client.query(queryString, [reservaId]);

    client.release();

    res.json({ message: 'Reserva deleted successfully' });
  } catch (error) {
    console.error('Error deleting Reserva:', error);
    res.status(500).json({ error: 'Error deleting Reserva' });
  }
});


// Ruta para obtener reservas por establecimiento_id o usuario_id
app.get('/get_reservas', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "establecimiento_id" o "usuario_id" de la consulta
    const establecimientoId = req.query.establecimiento_id;
    const usuarioId = req.query.usuario_id;

    let queryString = 'SELECT * FROM reservas WHERE';
    const queryParams = [];

    // Verificar si se proporcionó el parámetro "establecimiento_id"
    if (establecimientoId) {
      queryString += ` establecimiento_id = $1 AND`;
      queryParams.push(establecimientoId);
    }
    // Verificar si se proporcionó el parámetro "usuario_id"
    else if (usuarioId) {
      queryString += ` usuario_id = $1 AND`;
      queryParams.push(usuarioId);
    }

    // Añadir la condición de rango de fecha
    queryString += ` fecha_hora BETWEEN CURRENT_DATE - INTERVAL '1 month' AND CURRENT_DATE + INTERVAL '1 month'`;

    const result = await client.query(queryString, queryParams);

    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener reservas por establecimiento_id o usuario_id
app.get('/get_all_reservas', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "establecimiento_id" o "usuario_id" de la consulta
    const establecimientoId = req.query.establecimiento_id;

    let queryString = 'SELECT * FROM reservas WHERE';
    const queryParams = [];

    // Verificar si se proporcionó el parámetro "establecimiento_id"
    if (establecimientoId) {
      queryString += ` establecimiento_id = $1`;
      queryParams.push(establecimientoId);
    }

    const result = await client.query(queryString, queryParams);

    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Ruta para obtener una reserva por su id
app.get('/get_reservas_by_id/:id', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "id" de la ruta
    const { id } = req.params;

    // Query para buscar la reserva con el id dado
    const queryString = 'SELECT * FROM reservas WHERE establecimiento_id = $1 AND fecha_hora >= CURRENT_DATE - INTERVAL \'1 day\' AND confirmado = 0;';

    const result = await client.query(queryString, [id]);

    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Reserva not found' });
    } else {
      res.json(result.rows);
    }

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Ruta para obtener una reserva por su id
app.get('/get_reservas_by_id2/:id', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "id" de la ruta
    const { id } = req.params;

    // Query para buscar la reserva con el id dado
    const queryString = `SELECT * FROM reservas WHERE establecimiento_id = $1 AND confirmado = 1 AND asistencia = 0;`;

    const result = await client.query(queryString, [id]);

    client.release();

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Reserva not found' });
    } else {
      res.json(result.rows);
    }

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/asistencia_reserva_manual/:id', async (req, res) => {
  try {
    const reservaId = req.params.id;

    const client = await pool.connect();

    // Construct the SQL UPDATE statement
    const queryString = 'UPDATE public.reservas SET asistencia = 1 WHERE id = $1';

    // Execute the SQL statement with the provided reserva ID
    const result = await client.query(queryString, [reservaId]);

    client.release();

    res.json({ message: 'Reserva updated successfully' });
  } catch (error) {
    console.error('Error updating reserva:', error);
    res.status(500).json({ error: 'Error updating reserva' });
  }
});

app.get('/asistencia_reserva/:id', async (req, res) => {
  const reservaId = req.params.id;
  try {
    const client = await pool.connect();

    // Start transaction
    await client.query('BEGIN');

    // Update the asistencia status for the reserva
    const updateReservaQuery = 'UPDATE public.reservas SET asistencia = 1 WHERE id = $1 RETURNING usuario_id';
    const updateReservaResult = await client.query(updateReservaQuery, [reservaId]);
    if (updateReservaResult.rows.length === 0) {
      throw new Error('Reserva not found');
    }

    // Retrieve user_id from the updated reserva
    const userId = updateReservaResult.rows[0].usuario_id;

    // Define points to add (example: 50 points for attending)
    const pointsToAdd = 50;

    // Update user points
    const updatePointsQuery = `
      UPDATE usuarios
      SET total_puntos = total_puntos + $1
      WHERE id = $2
    `;
    await client.query(updatePointsQuery, [pointsToAdd, userId]);

    // Retrieve user phone number from correo_electronico column
    const userQuery = 'SELECT nombre, correo_electronico FROM public.usuarios WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const { nombre: userName, correo_electronico: userPhone } = userResult.rows[0];

    // Commit transaction
    await client.query('COMMIT');
    client.release();

    // Construct WhatsApp message data for notificacion_asistencia template
    const url = 'https://graph.facebook.com/v18.0/290794877447729/messages';
    const data = {
      messaging_product: "whatsapp",
      to: "52" + userPhone,
      type: "template",
      template: {
        name: "notificacion_asistencia",
        language: {
          code: "es_MX"
        },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: String(pointsToAdd) }
          ]
        }]
      }
    };

    // Send WhatsApp message
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': 'Bearer EAAUkJ9HTVVsBO73zGkDV8wG0p7ZBocaBBv2itwoyjpusg68wDQn5NjJOabBZAx8PLGMpnnumYxWOr3OWJzHFTyeYdSdIkRkU3sW2q1ylhvkYBPczO0dmDdSfPPm4Vx6rJioZAw3yKwp3jJmJmLqWJ2KMZB0f3HHlkeEqHNc7Fqf6lLGcm2sgTz5eeZCZB4Ngnk',
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ message: 'Reserva updated, points added, and WhatsApp notification sent successfully', whatsapp_response: response.data });

  } catch (error) {
    console.error('Transaction error:', error);
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    res.status(500).json({ error: 'Error updating reserva, adding points, and sending notification' });
  }
});


app.post('/confirmar_reserva/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const reservaId = req.params.id;
    const { identificador_mesa } = req.body;

    // Begin transaction
    await client.query('BEGIN');

    // Update the reservation to confirmed and set identificador_mesa
    const updateQuery = 'UPDATE public.reservas SET confirmado = 1, identificador_mesa = $2 WHERE id = $1';
    await client.query(updateQuery, [reservaId, identificador_mesa]);

    // Retrieve user ID and establishment ID from the reservation
    const reservaQuery = 'SELECT usuario_id, establecimiento_id FROM public.reservas WHERE id = $1';
    const reservaResult = await client.query(reservaQuery, [reservaId]);

    if (reservaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const { usuario_id, establecimiento_id } = reservaResult.rows[0];

    // Retrieve user name and phone number from correo_electronico column
    const userQuery = 'SELECT nombre, correo_electronico FROM public.usuarios WHERE id = $1';
    const userResult = await client.query(userQuery, [usuario_id]);

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const { nombre: userName, correo_electronico: userPhone } = userResult.rows[0];

    // Retrieve establishment name
    const establecimientoQuery = 'SELECT nombre FROM public.establecimientos WHERE id = $1';
    const establecimientoResult = await client.query(establecimientoQuery, [establecimiento_id]);

    if (establecimientoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Establishment not found' });
    }

    const { nombre: establecimientoName } = establecimientoResult.rows[0];

    // Commit transaction
    await client.query('COMMIT');
    client.release();

    // Construct WhatsApp message data
    const url = 'https://graph.facebook.com/v18.0/290794877447729/messages';
    const data = {
      messaging_product: "whatsapp",
      to: "52" + userPhone,
      type: "template",
      template: {
        name: "notificacion_confirmada",
        language: {
          code: "es_MX"
        },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: userName },
            { type: "text", text: establecimientoName }
          ]
        }]
      }
    };

    // Send WhatsApp message
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': 'Bearer EAAUkJ9HTVVsBO73zGkDV8wG0p7ZBocaBBv2itwoyjpusg68wDQn5NjJOabBZAx8PLGMpnnumYxWOr3OWJzHFTyeYdSdIkRkU3sW2q1ylhvkYBPczO0dmDdSfPPm4Vx6rJioZAw3yKwp3jJmJmLqWJ2KMZB0f3HHlkeEqHNc7Fqf6lLGcm2sgTz5eeZCZB4Ngnk',
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ message: 'Reserva updated successfully', whatsapp_response: response.data });

  } catch (error) {
    console.error('Error confirming reservation:', error);
    if (client) {
      await client.query('ROLLBACK');
      client.release();
    }
    res.status(500).json({ error: 'Error confirming reservation' });
  }
});

app.get('/cancelar_reserva/:id', async (req, res) => {
  try {
    const reservaId = req.params.id;

    const client = await pool.connect();

    // Construct the SQL UPDATE statement
    const queryString = 'UPDATE public.reservas SET confirmado = 0 WHERE id = $1';

    // Execute the SQL statement with the provided reserva ID
    const result = await client.query(queryString, [reservaId]);

    client.release();

    res.json({ message: 'Reserva updated successfully' });
  } catch (error) {
    console.error('Error updating reserva:', error);
    res.status(500).json({ error: 'Error updating reserva' });
  }
});



// Ruta para obtener todos las resenas
app.get('/get_resenas', async (req, res) => {
  try {
    // Conecta a la base de datos
    const client = await pool.connect();

    // Ejecuta una consulta SQL para obtener todos los usuarios
    const result = await client.query('SELECT * FROM resenas');

    // Libera la conexión
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener resenas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/update_allow_reservas', async (req, res) => {
  const { establecimiento_id, allow_reservas } = req.body;

  if (allow_reservas !== 0 && allow_reservas !== 1) {
    return res.status(400).json({ error: 'Invalid allow_reservas value' });
  }

  try {
    const client = await pool.connect();

    const queryString = `
      UPDATE public.establecimientos
      SET allow_reservas = $1
      WHERE id = $2
    `;

    const values = [allow_reservas, establecimiento_id];

    const result = await client.query(queryString, values);
    client.release();

    if (result.rowCount === 0) {
      // No rows were updated, which means the establecimiento does not exist
      return res.status(404).json({ message: 'Establecimiento not found' });
    }

    console.log('Establecimiento updated successfully');
    res.status(200).json({ message: 'Establecimiento updated successfully' });
  } catch (error) {
    console.error('Error updating Establecimiento in PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/send_reset_password', async (req, res) => {
  const phoneNumber = req.body.phone_number;
  
  // Inicia conexión a la base de datos y realiza la consulta
  const client = await pool.connect();
  try {
      const query = 'SELECT id FROM public.usuarios WHERE correo_electronico = $1';
      const queryResult = await client.query(query, [phoneNumber]);
      client.release(); // Libera el cliente al pool de conexiones

      if (queryResult.rows.length === 0) {
          return res.status(404).send({ message: 'No user found with this phone number.' });
      }

      const userId = queryResult.rows[0].id;
      const encodedUserId = Buffer.from(String(userId)).toString('base64');
      const resetLink = `https://nightout.com.mx/web-admin/reset_password.html?userId=${encodedUserId}`;

      // Configuración de datos para el envío del mensaje de WhatsApp
      const url = 'https://graph.facebook.com/v18.0/290794877447729/messages';
      const data = {
          messaging_product: "whatsapp",
          to: "52"+phoneNumber,
          type: "template",
          template: {
              name: "reset_password",
              language: {
                  code: "es_MX"
              },
              components: [{
                  type: "body",
                  parameters: [{
                      type: "text", 
                      text: resetLink
                  }]
              }]
          }
      };

      // Envío del mensaje de WhatsApp
      const response = await axios.post(url, data, {
          headers: {
            'Authorization': 'Bearer EAAUkJ9HTVVsBO73zGkDV8wG0p7ZBocaBBv2itwoyjpusg68wDQn5NjJOabBZAx8PLGMpnnumYxWOr3OWJzHFTyeYdSdIkRkU3sW2q1ylhvkYBPczO0dmDdSfPPm4Vx6rJioZAw3yKwp3jJmJmLqWJ2KMZB0f3HHlkeEqHNc7Fqf6lLGcm2sgTz5eeZCZB4Ngnk',
            'Content-Type': 'application/json'
          }
      });
      res.status(200).send(response.data);

  } catch (error) {
      console.error('Error:', error);
      client.release(); // Asegúrate de liberar el cliente en caso de error también
      res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});


app.post('/change_password', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const client = await pool.connect();

    // Check if the user exists
    const userExistsQuery = 'SELECT id FROM public.usuarios WHERE id = $1';
    const userExistsResult = await client.query(userExistsQuery, [userId]);

    if (userExistsResult.rows.length === 0) {
      // User does not exist, respond with an error message
      client.release();
      return res.json({ res: 'User does not exist' });
    }

    // Hash the new password using SHA-256
    const sha256 = crypto.createHash('sha256');
    const hashedNewPassword = sha256.update(newPassword).digest('hex');

    // Update the user's password in the database
    const updateUserPasswordQuery = `
      UPDATE public.usuarios
      SET contrasena = $2
      WHERE id = $1
    `;

    await client.query(updateUserPasswordQuery, [userId, hashedNewPassword]);
    client.release();
    console.log('Password updated successfully');

    res.json({ res: "OK" });
  } catch (error) {
    console.error('Error updating user password in PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to handle the POST request
app.post('/add_usuario', async (req, res) => {
  const {
    nombre,
    apellido,
    genero,
    fechaNacimiento,
    correoElectronico,
    redesSociales,
    contrasena, // This is the plain text password from the request
    reservasActivas,
    reservasPrevias,
    numTelefono,
  } = req.body;

  try {
    const client = await pool.connect();

    // Check if a user with the same email already exists
    const existingUserQuery = 'SELECT correo_electronico FROM public.usuarios WHERE correo_electronico = $1';
    const existingUserResult = await client.query(existingUserQuery, [correoElectronico]);

    if (existingUserResult.rows.length > 0) {
      // User with the same email already exists, respond with an error message
      client.release();
      return res.json({ res: 'User with this email already exists' });
    }

    // Hash the password using SHA-256
    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(contrasena).digest('hex');

    const insertUserQuery = `
      INSERT INTO public.usuarios (
        nombre,
        apellido,
        genero,
        fecha_nacimiento,
        correo_electronico,
        redes_sociales,
        contrasena,
        reservas_activas,
        reservas_previas,
        num_telefono
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      nombre,
      apellido,
      genero,
      fechaNacimiento,
      correoElectronico,
      redesSociales,
      hashedPassword, // Use the hashed password here
      reservasActivas,
      reservasPrevias,
      numTelefono,
    ];

    await client.query(insertUserQuery, values);
    client.release();
    console.log('User inserted successfully');

    res.json({ res: "OK" });
  } catch (error) {
    console.error('Error inserting user into PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/remove_points_usuario', async (req, res) => {
  const {
    user_id,
    points_to_remove
  } = req.body;

  try {
    const client = await pool.connect();

    const updatePointsQuery = `
      UPDATE usuarios
      SET total_puntos = total_puntos - $1
      WHERE id = $2 AND total_puntos >= $1
    `;

    const values = [points_to_remove, user_id];

    const result = await client.query(updatePointsQuery, values);
    client.release();

    if (result.rowCount === 0) {
      console.log('No points removed, possibly due to insufficient balance');
      res.status(400).json({ message: 'No points removed, possibly due to insufficient balance' });
    } else {
      console.log('User points updated successfully');
      res.status(200).json({ message: 'User points updated successfully' });
    }
  } catch (error) {
    console.error('Error updating user points in PostgreSQL:', error);
    client.release();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/remove_points_establecimiento', async (req, res) => {
  const {
    establecimiento_id,
    points_to_remove
  } = req.body;

  try {
    const client = await pool.connect();

    const updatePointsQuery = `
      UPDATE establecimientos
      SET total_puntos = total_puntos - $1
      WHERE id = $2 AND total_puntos >= $1
    `;

    const values = [points_to_remove, establecimiento_id];

    const result = await client.query(updatePointsQuery, values);
    client.release();

    if (result.rowCount === 0) {
      console.log('No points removed, possibly due to insufficient balance');
      res.status(400).json({ message: 'No points removed, possibly due to insufficient balance' });
    } else {
      console.log('Establishment points updated successfully');
      res.status(200).json({ message: 'Establishment points updated successfully' });
    }
  } catch (error) {
    console.error('Error updating establishment points in PostgreSQL:', error);
    client.release();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/add_points_establecimiento', async (req, res) => {
  const {
    establecimiento_id,
    points_to_add
  } = req.body;

  try {
    const client = await pool.connect();

    const updatePointsQuery = `
      UPDATE establecimientos
      SET total_puntos = total_puntos + $1
      WHERE id = $2
    `;

    const values = [points_to_add, establecimiento_id];

    await client.query(updatePointsQuery, values);
    client.release();
    console.log('Establishment points updated successfully');

    res.status(200).json({ message: 'Establishment points updated successfully' });
  } catch (error) {
    console.error('Error updating establishment points in PostgreSQL:', error);
    client.release();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/add_points_usuario', async (req, res) => {
  const {
    user_id,
    points_to_add
  } = req.body;

  try {
    const client = await pool.connect();

    const updatePointsQuery = `
      UPDATE usuarios
      SET total_puntos = total_puntos + $1
      WHERE id = $2
    `;

    const values = [points_to_add, user_id];

    await client.query(updatePointsQuery, values);
    client.release();
    console.log('Points updated successfully');

    res.status(200).json({ message: 'Points updated successfully' });
  } catch (error) {
    console.error('Error updating points in PostgreSQL:', error);
    client.release();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get_transactions', async (req, res) => {
  const { origen, destino, startDate, endDate } = req.query;

  let query = `
    SELECT t.*, u.nombre AS usuario_nombre, u.apellido AS usuario_apellido FROM transactions t
    JOIN usuarios u ON t.origen = u.id WHERE 1=1
  `; // Enhanced to include apellido (last name)

  const queryParams = [];

  if (origen) {
    query += ' AND t.origen = $' + (queryParams.length + 1);
    queryParams.push(origen);
  }

  if (destino) {
    query += ' AND t.destino = $' + (queryParams.length + 1);
    queryParams.push(destino);
  }

  if (startDate) {
    query += ' AND t.fecha >= $' + (queryParams.length + 1);
    queryParams.push(startDate);
  }

  if (endDate) {
    query += ' AND t.fecha <= $' + (queryParams.length + 1);
    queryParams.push(endDate);
  }

  // Add order by clause to sort by fecha descending
  query += ' ORDER BY t.fecha DESC';

  try {
    const client = await pool.connect();
    const result = await client.query(query, queryParams);
    res.json(result.rows);
    client.release();
  } catch (error) {
    console.error('Error querying transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.post('/new_transaction', async (req, res) => {
  const {
    origen_id,
    destino_id,
    transaction_type,
    points_to_transfer
  } = req.body;

  try {
    const client = await pool.connect();
    let checkBalanceQuery, updateOrigenQuery, updateDestinoQuery, insertTransactionQuery;

    // Define the query to insert the transaction record
    insertTransactionQuery = `
      INSERT INTO transactions (fecha, origen, destino, monto)
      VALUES (NOW(), $1, $2, $3)
    `;

    if (transaction_type === 'establecimiento->usuario') {
      // Check if the establishment has enough points
      checkBalanceQuery = `
        SELECT total_puntos FROM establecimientos WHERE id = $1
      `;

      const checkResult = await client.query(checkBalanceQuery, [origen_id]);
      if (checkResult.rows.length === 0 || checkResult.rows[0].total_puntos < points_to_transfer) {
        res.status(400).json({ message: 'Insufficient points in the establishment' });
        client.release();
        return;
      }

      // Update queries for the transaction
      updateOrigenQuery = `
        UPDATE establecimientos
        SET total_puntos = total_puntos - $1
        WHERE id = $2
      `;

      updateDestinoQuery = `
        UPDATE usuarios
        SET total_puntos = total_puntos + $1
        WHERE id = $2
      `;
    } else if (transaction_type === 'usuario->establecimiento') {
      // Check if the user has enough points
      checkBalanceQuery = `
        SELECT total_puntos FROM usuarios WHERE id = $1
      `;

      const checkResult = await client.query(checkBalanceQuery, [origen_id]);
      if (checkResult.rows.length === 0 || checkResult.rows[0].total_puntos < points_to_transfer) {
        res.status(400).json({ message: 'Insufficient points in user account' });
        client.release();
        return;
      }

      // Update queries for the transaction
      updateOrigenQuery = `
        UPDATE usuarios
        SET total_puntos = total_puntos - $1
        WHERE id = $2
      `;

      updateDestinoQuery = `
        UPDATE establecimientos
        SET total_puntos = total_puntos + $1
        WHERE id = $2
      `;
    } else {
      res.status(400).json({ message: 'Invalid transaction type' });
      client.release();
      return;
    }

    // Perform the updates
    await client.query(updateOrigenQuery, [points_to_transfer, origen_id]);
    await client.query(updateDestinoQuery, [points_to_transfer, destino_id]);
    
    // Record the transaction
    await client.query(insertTransactionQuery, [origen_id, destino_id, points_to_transfer]);

    console.log('Transaction completed successfully');
    res.status(200).json({ message: 'Transaction completed successfully' });

    client.release();

  } catch (error) {
    console.error('Error handling transaction:', error);
    client.release();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Define a route to handle the POST request
app.post('/add_resena', async (req, res) => {
  const {
    fecha_hora,
    usuario_id,
    establecimiento_id,
    calificacion,
    texto_resena
  } = req.body;

  try {
    const client = await pool.connect();

    const queryString = `
      INSERT INTO public.resenas (
        fecha_hora,
        usuario_id,
        establecimiento_id,
        calificacion,
        texto_resena
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    const values = [
      fecha_hora,
      usuario_id,
      establecimiento_id,
      calificacion,
      texto_resena
    ];

    await client.query(queryString, values);
    client.release();
    console.log('Resena inserted successfully');

    res.status(201).json({ message: 'Resena inserted successfully' });
  } catch (error) {
    console.error('Error inserting Resena into PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/add_reserva', async (req, res) => {
  const {
    fecha_hora,
    usuario_id,
    establecimiento_id,
    numero_personas,
    confirmado,
    asistencia,
    tipo_mesa
  } = req.body;

  try {
    const client = await pool.connect();

    // Insert the reservation
    const insertQuery = `
      INSERT INTO public.reservas (
        fecha_hora,
        usuario_id,
        establecimiento_id,
        numero_personas,
        confirmado,
        asistencia,
        tipo_de_mesa
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const insertValues = [
      fecha_hora,
      usuario_id,
      establecimiento_id,
      numero_personas,
      confirmado,
      asistencia,
      tipo_mesa
    ];

    await client.query(insertQuery, insertValues);
    console.log('Reserva inserted successfully');

    // Fetch the telefono from establecimientos and nombre from usuarios
    const fetchDetailsQuery = `
      SELECT e.telefono, u.nombre 
      FROM establecimientos e
      JOIN usuarios u ON u.id = $1
      WHERE e.id = $2
    `;

    const fetchValues = [usuario_id, establecimiento_id];
    const result = await client.query(fetchDetailsQuery, fetchValues);
    const { telefono, nombre } = result.rows[0];

    client.release();

    // Send WhatsApp message
    const url = 'https://graph.facebook.com/v18.0/290794877447729/messages';
    const data = {
      messaging_product: "whatsapp",
      to: "52" + telefono, // establecimiento phone 
      type: "template",
      template: {
        name: "notificacion_reserva",
        language: {
          code: "es_MX"
        },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: nombre }, // Nombre usuario
            { type: "text", text: tipo_mesa }, // Tipo de mesa
            { type: "text", text: fecha_hora } // Fecha
          ]
        }]
      }
    };

    await axios.post(url, data, {
      headers: {
        'Authorization': 'Bearer EAAUkJ9HTVVsBO73zGkDV8wG0p7ZBocaBBv2itwoyjpusg68wDQn5NjJOabBZAx8PLGMpnnumYxWOr3OWJzHFTyeYdSdIkRkU3sW2q1ylhvkYBPczO0dmDdSfPPm4Vx6rJioZAw3yKwp3jJmJmLqWJ2KMZB0f3HHlkeEqHNc7Fqf6lLGcm2sgTz5eeZCZB4Ngnk',
        'Content-Type': 'application/json'
      }
    });

    res.status(201).json({ message: 'Reserva inserted and notification sent successfully' });
  } catch (error) {
    console.error('Error inserting Reserva into PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/add_reserva_generica', async (req, res) => {
  const {
    fecha_hora,
    usuario_id,
    establecimiento_id,
    numero_personas,
    confirmado,
    asistencia,
    tipo_mesa,
    nombre,
    nombre_rp,
    identificador_mesa
  } = req.body;

  try {
    const client = await pool.connect();

    const queryString = `
      INSERT INTO public.reservas (
        fecha_hora,
        usuario_id,
        establecimiento_id,
        numero_personas,
        confirmado,
        asistencia,
        tipo_de_mesa,
        nombre,
        nombre_rp,
        identificador_mesa
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      fecha_hora,
      usuario_id,
      establecimiento_id,
      numero_personas,
      confirmado,
      asistencia,
      tipo_mesa,
      nombre,
      nombre_rp,
      identificador_mesa
    ];

    await client.query(queryString, values);
    client.release();
    console.log('Reserva inserted successfully');

    res.status(201).json({ message: 'Reserva inserted successfully' });
  } catch (error) {
    console.error('Error inserting Reserva into PostgreSQL:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// ADD ESTABLECIMIENTO ---------------------------------------------------------------------------------------

app.post('/add_establecimiento', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'imagen_mapa', maxCount: 1 }]), async (req, res) => {
  const {
    email,
    contrasena,
    nombre,
    descripcion,
    horario,
    horariocsv,
    tipo,
    num_mesas,
    capacidades_mesa,
    capacidad_total,
    ubicacion,
    ubicacion_general,
    link_google_maps,
    restricciones,
    tipo_de_pago,
    precios,
    redes_sociales
  } = req.body;

  try {
    const client = await pool.connect();

    // Access the uploaded files from Multer
    const images = req.files['images']; // Use the field name as a key to access the files

    // Define the directory where you want to save the converted images
    const saveDirectory = './uploads'; // You can change this to your desired directory

    // Define an array to store the image paths
    const imagePaths = [];

    // Loop through the uploaded images, compress them, and save them
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageName = `${Date.now()}_${i}.png`; // Create a unique name for each image
      const imagePath = `${saveDirectory}/${imageName}`; // Construct the image path

      // Use Sharp to compress the image (adjust settings as needed)
      await sharp(image.buffer)
        .jpeg({ quality: 80 }) // Adjust quality as needed (e.g., 80 for JPEG)
        .toFile(imagePath);

      // Add the image path to the array
      imagePaths.push(imagePath);
    }

    // Access the uploaded map image 
    const mapaImage = req.files['imagen_mapa']; 
    const imagePaths2 = [];
    for (let i = 0; i < mapaImage.length; i++) {
      const image = mapaImage[i];
      const imageName = `${Date.now()}_${i}.png`; 
      const imagePath = `${saveDirectory}/${imageName}`; 

      // Use Sharp to compress the map image (adjust settings as needed)
      await sharp(image.buffer)
        .jpeg({ quality: 80 }) // Adjust quality as needed (e.g., 80 for JPEG)
        .toFile(imagePath);

      // Add the map image path to the array
      imagePaths2.push(imagePath);
    }
    
    // Insert the compressed image paths into your database
    // Adjusted query string to correctly align with the provided values
    const queryString = `
    INSERT INTO public.establecimientos (
      capacidad_actual, resenas_calificacion, nombre, ubicacion, capacidad_total, num_mesas, email, contrasena, tipo, descripcion, horario, horariocsv,
      restricciones, tipo_de_pago, precios, redes_sociales, link_google_maps, ubicacion_general, images, imagen_mapa, capacidades_mesa
    )
    VALUES (0,5,$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    `;




    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(contrasena).digest('hex');

    // Ensure values align with your adjusted query placeholders
    const values = [
      nombre, ubicacion, capacidad_total, num_mesas, email, hashedPassword, tipo, descripcion, horario, horariocsv,
      restricciones, tipo_de_pago, precios, redes_sociales, link_google_maps, ubicacion_general, imagePaths,
      imagePaths2[0], capacidades_mesa // Assuming imagePaths2[0] is the path for imagen_mapa
    ];

    await client.query(queryString, values);

    client.release();
    console.log('Data inserted into the database successfully');

    res.status(201).json({ message: 'Data inserted into the database successfully' });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// SERVE IMAGES FROM UPLOADS -----------------------------------------------------------

// Define la ruta donde se encuentran las imágenes estáticas (uploads/ en este caso)
const staticImagesPath = 'uploads';

// Configura el middleware para servir archivos estáticos desde la carpeta uploads/
app.use('/uploads', express.static(staticImagesPath));


app.listen(3000, '0.0.0.0', () => {
  console.log(`NightOut backend running on port 3000`);
});

