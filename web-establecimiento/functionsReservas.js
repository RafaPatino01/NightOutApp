// Function to get the value of a specific cookie by its name
const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null; // Return null if the cookie is not found
};

// Get id
const id = getCookie("NightOut_Establecimiento");
if (id) {
  const url = `https://nightout.com.mx/api/get_establecimiento/${id}`;
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(errorData => {
          throw new Error(errorData.error);
        });
      }
    })
    .then(establecimiento => {
      // Handle the received "establecimiento" object
        console.log('Received establecimiento:', establecimiento);
        document.getElementById("usuario").innerHTML += establecimiento.nombre;
        //obtain reservas of current establecimiento
        getReservas(establecimiento.id)

    })
    .catch(error => {
      console.error('Error fetching establecimiento:', error);
    });
} else {
  console.error("NightOut_Establecimiento cookie not found or id is missing");
}