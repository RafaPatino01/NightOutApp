const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const https = require('https');  

const { Pool } = require('pg');
const multer = require('multer');
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');

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



app.put('/update_establecimiento/:id', async (req, res) => {
  try {
    const establecimientoId = req.params.id;
    const establecimientoData = req.body; // Assuming you send establecimiento data in the request body

    const client = await pool.connect();
    const fieldUpdates = [];
    const queryValues = [];

    // Construct the SQL UPDATE statement based on the provided establecimiento data
    let queryIndex = 1; // Start with the first parameter index

    // Check if each field is included in the request body and add it to the update statement
    if (establecimientoData.nombre !== undefined) {
      fieldUpdates.push(`nombre = $${queryIndex}`);
      queryValues.push(establecimientoData.nombre);
      queryIndex++;
    }

    if (establecimientoData.ubicacion !== undefined) {
      fieldUpdates.push(`ubicacion = $${queryIndex}`);
      queryValues.push(establecimientoData.ubicacion);
      queryIndex++;
    }

    if (establecimientoData.capacidad_total !== undefined) {
      fieldUpdates.push(`capacidad_total = $${queryIndex}`);
      queryValues.push(establecimientoData.capacidad_total);
      queryIndex++;
    }

    if (establecimientoData.capacidad_actual !== undefined) {
      fieldUpdates.push(`capacidad_actual = $${queryIndex}`);
      queryValues.push(establecimientoData.capacidad_actual);
      queryIndex++;
    }

    if (establecimientoData.num_mesas !== undefined) {
      fieldUpdates.push(`num_mesas = $${queryIndex}`);
      queryValues.push(establecimientoData.num_mesas);
      queryIndex++;
    }

    if (establecimientoData.imagen_mapa !== undefined) {
      fieldUpdates.push(`imagen_mapa = $${queryIndex}`);
      queryValues.push(establecimientoData.imagen_mapa);
      queryIndex++;
    }

    if (establecimientoData.capacidades_mesa !== undefined) {
      fieldUpdates.push(`capacidades_mesa = $${queryIndex}`);
      queryValues.push(establecimientoData.capacidades_mesa);
      queryIndex++;
    }

    if (establecimientoData.email !== undefined) {
      fieldUpdates.push(`email = $${queryIndex}`);
      queryValues.push(establecimientoData.email);
      queryIndex++;
    }

    if (establecimientoData.contrasena !== undefined) {
      fieldUpdates.push(`contrasena = $${queryIndex}`);
      queryValues.push(establecimientoData.contrasena);
      queryIndex++;
    }

    if (establecimientoData.tipo !== undefined) {
      fieldUpdates.push(`tipo = $${queryIndex}`);
      queryValues.push(establecimientoData.tipo);
      queryIndex++;
    }

    if (establecimientoData.descripcion !== undefined) {
      fieldUpdates.push(`descripcion = $${queryIndex}`);
      queryValues.push(establecimientoData.descripcion);
      queryIndex++;
    }

    if (establecimientoData.horario !== undefined) {
      fieldUpdates.push(`horario = $${queryIndex}`);
      queryValues.push(establecimientoData.horario);
      queryIndex++;
    }

    if (establecimientoData.restricciones !== undefined) {
      fieldUpdates.push(`restricciones = $${queryIndex}`);
      queryValues.push(establecimientoData.restricciones);
      queryIndex++;
    }

    if (establecimientoData.tipo_de_pago !== undefined) {
      fieldUpdates.push(`tipo_de_pago = $${queryIndex}`);
      queryValues.push(establecimientoData.tipo_de_pago);
      queryIndex++;
    }

    if (establecimientoData.precios !== undefined) {
      fieldUpdates.push(`precios = $${queryIndex}`);
      queryValues.push(establecimientoData.precios);
      queryIndex++;
    }

    if (establecimientoData.resenas_calificacion !== undefined) {
      fieldUpdates.push(`resenas_calificacion = $${queryIndex}`);
      queryValues.push(establecimientoData.resenas_calificacion);
      queryIndex++;
    }

    if (establecimientoData.redes_sociales !== undefined) {
      fieldUpdates.push(`redes_sociales = $${queryIndex}`);
      queryValues.push(establecimientoData.redes_sociales);
      queryIndex++;
    }

    if (establecimientoData.link_google_maps !== undefined) {
      fieldUpdates.push(`link_google_maps = $${queryIndex}`);
      queryValues.push(establecimientoData.link_google_maps);
      queryIndex++;
    }

    if (establecimientoData.ubicacion_general !== undefined) {
      fieldUpdates.push(`ubicacion_general = $${queryIndex}`);
      queryValues.push(establecimientoData.ubicacion_general);
      queryIndex++;
    }

    if (establecimientoData.images !== undefined) {
      fieldUpdates.push(`images = $${queryIndex}`);
      queryValues.push(establecimientoData.images);
      queryIndex++;
    }

    // Create the final query string
    const queryString = `
      UPDATE public.establecimientos
      SET 
        ${fieldUpdates.join(', ')}
      WHERE id = $${queryIndex}
    `;

    queryValues.push(establecimientoId);

    // Execute the SQL statement with the provided data
    const result = await client.query(queryString, queryValues);

    client.release();

    res.json({ message: 'Establecimiento data updated successfully' });
  } catch (error) {
    console.error('Error updating establecimiento data:', error);
    res.status(500).json({ error: 'Error updating establecimiento data' });
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


// Ruta para obtener reservas por establecimiento_id o usuario_id
app.get('/get_reservas', async (req, res) => {
  try {
    const client = await pool.connect();

    // Obtener el valor del parámetro "establecimiento_id" o "usuario_id" de la consulta
    const establecimientoId = req.query.establecimiento_id;
    const usuarioId = req.query.usuario_id;

    let queryString = 'SELECT * FROM reservas';

    // Verificar si se proporcionó el parámetro "establecimiento_id"
    if (establecimientoId) {
      queryString += ` WHERE establecimiento_id = $1`;
    }
    // Verificar si se proporcionó el parámetro "usuario_id"
    else if (usuarioId) {
      queryString += ` WHERE usuario_id = $1 AND fecha_hora > CURRENT_TIMESTAMP`;
    }

    const result = await client.query(queryString, [establecimientoId || usuarioId]);

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
    const queryString = 'SELECT * FROM reservas WHERE establecimiento_id = $1 AND fecha_hora > CURRENT_TIMESTAMP AND confirmado = 0;';

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
    const queryString = 'SELECT * FROM reservas WHERE establecimiento_id = $1 AND fecha_hora > CURRENT_TIMESTAMP AND confirmado = 1 AND asistencia = 0;';

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

app.get('/asistencia_reserva/:id', async (req, res) => {
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

app.get('/confirmar_reserva/:id', async (req, res) => {
  try {
    const reservaId = req.params.id;

    const client = await pool.connect();

    // Construct the SQL UPDATE statement
    const queryString = 'UPDATE public.reservas SET confirmado = 1 WHERE id = $1';

    // Execute the SQL statement with the provided reserva ID
    const result = await client.query(queryString, [reservaId]);

    client.release();

    res.json({ message: 'Reserva updated successfully' });
  } catch (error) {
    console.error('Error updating reserva:', error);
    res.status(500).json({ error: 'Error updating reserva' });
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

    const queryString = `
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

    const values = [
      fecha_hora,
      usuario_id,
      establecimiento_id,
      numero_personas,
      confirmado,
      asistencia,
      tipo_mesa
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
    const queryString = `
      INSERT INTO public.establecimientos (
        nombre, ubicacion, capacidad_total, capacidad_actual, num_mesas, imagen_mapa, capacidades_mesa,
        email, contrasena, tipo, descripcion, horario, restricciones, tipo_de_pago, precios,
        resenas_calificacion, redes_sociales, link_google_maps, ubicacion_general, images
      )
      VALUES ($1, $2, $3, 0, $4, $17, $18, $5, $6, $7, $8, $9, $10, $11, $12, 0, $13, $14, $15, $16)
    `;

    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(contrasena).digest('hex');

    const values = [
      nombre, ubicacion, capacidad_total, num_mesas, email, hashedPassword, tipo, descripcion, horario,
      restricciones, tipo_de_pago, precios, redes_sociales, link_google_maps, ubicacion_general, imagePaths,
      imagePaths2[0], capacidades_mesa
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

