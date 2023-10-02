// auth.js
const ip = '192.168.100.54';

export const handleLogin = async (email, password, navigation) => {
  console.log('Email:', email);
  console.log('Password:', password);

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

        // You can add your navigation logic here
        navigation.navigate('Home');
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
