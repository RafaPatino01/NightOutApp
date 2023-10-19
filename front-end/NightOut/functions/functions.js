import axios from 'axios';
const ip = '192.168.100.11';

export const handleLogin = async (email, password) => {

  try {
    // Construct the URL with parameters
    const apiUrl = `http://${ip}:3000/login?correo_electronico=${email}&contrasena=${password}`;

    // Perform the GET request
    const response = await fetch(apiUrl);

    // Check if the response is successful (status code 200)
    if (response.status === 200) {
      // Parse the response as JSON
      const data = await response.json();

      // Check if the response contains "res" equal to "OK" to determine if login was successful
      if (data.res === "OK") {
        // Successful login, log the user data
        console.log('Login Result:', data.user);

        return true
      } else {
        // Login failed, show an alert to the user
        console.error('Login failed. Server response:', data.res);
        alert('Login failed. Please check your credentials.');
      }
    } else {
      // Handle non-200 status codes (e.g., server error)
      console.error('Login failed. Status code:', response.status);
      alert('Login failed. Please try again later.');
      // Handle the error or show an error message to the user
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('Login failed. Please try again later.');
    // Handle the error or show an error message to the user
  }
};

export const registerUser = async (userData) => {
  try {
    const apiUrl = `http://${ip}:3000/add_usuario`;

    const response = await axios.post(apiUrl, userData);

    
    if (response.status === 200) {
      const data = response.data;
      if (data.res === "OK") {
        console.log('Usuario registrado:', data.user);
        alert('Te has registrado correctamente. ✅');
      }
      else {
        console.log('Usuario repetido:', data.user);
        alert('Este usuario ya ha sido registrado anteriormente. ❌');
      }

    } else {
      console.error('Error al registrar el usuario. Código de estado:', response.status);
      alert('Error al registrar el usuario. Por favor, inténtalo de nuevo. ❌');
    }
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    alert('Error al registrar el usuario. Por favor, inténtalo de nuevo. ❌');
  }
};

// Define a function to fetch the data
export const fetchEstablecimientos = async () => {
  try {
    const response = await axios.get(`http://${ip}:3000/get_establecimientos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};

// Define a function to fetch the data
export const fetchReservasByUserId = async (usuarioId) => {
  try {
    const response = await axios.get(`http://${ip}:3000/get_reservas/?usuario_id=${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};

