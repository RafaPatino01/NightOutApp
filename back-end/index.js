const express = require('express');
const cors = require('cors');
const sharp = require('sharp');

const { Pool } = require('pg');
const multer = require('multer');
const crypto = require('crypto');

// Middleware para manejar la carga de archivos usando Multer
const storage = multer.memoryStorage(); // Almacena el archivo cargado en la memoria
const upload = multer({ storage: storage });

const app = express();

app.use(express.json()); // Parse JSON request bodies

// Enable CORS middleware
app.use(cors());  

const port = 3000;

// Create a PostgreSQL database connection pool
const pool = new Pool({
  user: 'root',
  host: '142.93.116.94', // Replace with your database host
  database: 'night_out_db',
  password: 'asdb4klgh5B#c',
  port: 5432, // Replace with your database port
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

// Create a GET request to fetch an "establecimiento" by its "nombre"
app.get('/get_establecimiento/:nombre', async (req, res) => {
  const { nombre } = req.params;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM establecimientos WHERE nombre = $1';
    const result = await client.query(query, [nombre]);

    if (result.rows.length === 0) {
      // If no "establecimiento" with the provided "nombre" is found, return a 404 Not Found status
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



// Ruta para obtener todos los usuarios
app.get('/get_usuarios', async (req, res) => {
  try {
    // Conecta a la base de datos
    const client = await pool.connect();

    // Ejecuta una consulta SQL para obtener todos los usuarios
    const result = await client.query('SELECT * FROM usuarios');

    // Libera la conexión
    client.release();

    // Envía la lista de usuarios como respuesta
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos las reservas
app.get('/get_reservas', async (req, res) => {
  try {
    // Conecta a la base de datos
    const client = await pool.connect();

    // Ejecuta una consulta SQL para obtener todos los usuarios
    const result = await client.query('SELECT * FROM reservas');

    // Libera la conexión
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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

    // Loop through the uploaded images, convert them to PNG, and save them
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageName = `${Date.now()}_${i}.png`; // Create a unique name for each image
      const imagePath = `${saveDirectory}/${imageName}`; // Construct the image path

      await sharp(image.buffer)
        .toFormat('png') // Convert to PNG format
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
      await sharp(image.buffer)
        .toFormat('png') 
        .toFile(imagePath);
      imagePaths2.push(imagePath);
    }
    
    // Insert the image paths into your database
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

