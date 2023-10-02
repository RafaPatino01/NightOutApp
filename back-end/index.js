const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Import the Pool class from the 'pg' library
const multer = require('multer');

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

app.get('/login', async (req, res) => {
  try {
    // Conecta a la base de datos
    const client = await pool.connect();

    // Obtén los valores de correo_electronico y contrasena desde los parámetros de la solicitud
    const { correo_electronico, contrasena } = req.query;

    // Ejecuta una consulta SQL para obtener el usuario que coincide con el correo_electronico y contrasena
    const query = 'SELECT * FROM usuarios WHERE correo_electronico = $1 AND contrasena = $2';
    const result = await client.query(query, [correo_electronico, contrasena]);

    // Libera la conexión
    client.release();

    // Verifica si se encontraron resultados en la consulta
    if (result.rows.length === 0) {
      // No se encontraron coincidencias, respondemos con "NOT OK"
      res.status(400).json({ res: "NOT OK" });
    } else {
      // Se encontraron coincidencias, respondemos con "OK" y los datos del usuario
      res.json({ res: "OK", user: result.rows[0] });
    }

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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


// Define a route to handle the POST request for inserting data into "establecimientos"
app.post('/add_establecimiento', upload.array('imagenes', 5), async (req, res) => {
  const {
    nombre,
    ubicacion,
    capacidad_total,
    capacidad_actual,
    num_mesas,
    imagen_mapa,
    capacidades_mesa,
    email,
    contrasena,
    tipo,
    descripcion,
    horario,
    restricciones,
    tipo_de_pago,
    precios,
    resenas_calificacion,
    redes_sociales,
    link_google_maps,
    ubicacion_general,
  } = req.body;

  try {
    // Accede a los archivos cargados desde Multer (req.files)
    const imagenes = req.files.map((file) => file.buffer); // Almacena datos de imagen como un array de buffers

    // Conéctate a la base de datos
    const client = await pool.connect();

    // Ejecuta la consulta SQL para insertar datos en la tabla "ESTABLECIMIENTOS"
    const queryString = `
      INSERT INTO public.establecimientos (
        nombre,
        ubicacion,
        capacidad_total,
        imagenes,
        capacidad_actual,
        num_mesas,
        imagen_mapa,
        capacidades_mesa,
        email,
        contrasena,
        tipo,
        descripcion,
        horario,
        restricciones,
        tipo_de_pago,
        precios,
        resenas_calificacion,
        redes_sociales,
        link_google_maps,
        ubicacion_general
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `;

    const values = [
      nombre,
      ubicacion,
      capacidad_total,
      imagenes,
      capacidad_actual,
      num_mesas,
      imagen_mapa,
      capacidades_mesa,
      email,
      contrasena,
      tipo,
      descripcion,
      horario,
      restricciones,
      tipo_de_pago,
      precios,
      resenas_calificacion,
      redes_sociales,
      link_google_maps,
      ubicacion_general,
    ];

    await client.query(queryString, values);
    client.release();
    console.log('Establecimiento insertado exitosamente');

    res.status(201).json({ message: 'Establecimiento insertado exitosamente' });
  } catch (error) {
    console.error('Error al insertar establecimiento en PostgreSQL:', error);
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
    contrasena,
    reservasActivas,
    reservasPrevias,
    numTelefono,
  } = req.body;

  try {
    const client = await pool.connect();

    const queryString = `
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
      contrasena,
      reservasActivas,
      reservasPrevias,
      numTelefono,
    ];

    await client.query(queryString, values);
    client.release();
    console.log('User inserted successfully');

    res.status(201).json({ message: 'User inserted successfully' });
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

app.listen(3000, '0.0.0.0', () => {
  console.log(`NightOut backend running on port 3000`);
});

