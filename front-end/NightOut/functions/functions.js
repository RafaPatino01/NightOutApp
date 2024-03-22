import axios from 'axios';
const ip = 'nightout.com.mx/api';

export const handleLogin = async (email, password) => {

  try {
    // Construct the URL with parameters
    const apiUrl = `https://${ip}/login?correo_electronico=${email}&contrasena=${password}`;

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
    const apiUrl = `https://${ip}/add_usuario`;

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
    const response = await axios.get(`https://${ip}/get_establecimientos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};

// Define a function to fetch the data
export const fetchReservasByUserId = async (usuarioId) => {
  try {
    const response = await axios.get(`https://${ip}/get_reservas/?usuario_id=${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};

export const fetchUserById = async (usuarioId) => {
  try {
    const response = await axios.get(`https://${ip}/get_usuario_by_id/${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const deleteReservaById = async (reservaId) => {
  try {
    // Construye la URL del endpoint, incluyendo el ID de la reservación en la ruta
    const apiUrl = `https://${ip}/delete_reserva/${reservaId}`;

    // Realiza la petición DELETE
    const response = await axios.delete(apiUrl);

    // Verifica si la respuesta es exitosa
    if (response.status === 200) {
      console.log('Reserva eliminada con éxito:', response.data);
      // Opcionalmente, puedes retornar un valor booleano o el mensaje de éxito
      return true;
    } else {
      // Maneja códigos de estado HTTP diferentes a 200
      console.error('Error al eliminar la reservación. Código de estado:', response.status);
      alert('Error al eliminar la reservación. Por favor, inténtalo de nuevo.');
      return false;
    }
  } catch (error) {
    // Maneja errores en la petición
    console.error('Error al eliminar la reservación:', error);
    alert('Error al eliminar la reservación. Por favor, inténtalo de nuevo.');
    return false;
  }
};

export const fetchEstablecimientoById = async (id) => {
  try {
    const response = await axios.get(`https://${ip}/get_establecimiento/${id}`);
    // Check if the response was successful
    if (response.status === 200) {
      // If successful, return the fetched establecimiento
      return response.data;
    } else {
      // Handle responses with status codes other than 200
      console.error('Failed to fetch establecimiento. Status:', response.status);
      alert('Failed to fetch establecimiento. Please try again.');
      return null; // Return null or appropriate error handling
    }
  } catch (error) {
    // Handle errors in making the request
    console.error('Error fetching establecimiento:', error);
    alert('Error fetching establecimiento. Please try again.');
    return null; // Return null or appropriate error handling
  }
};
