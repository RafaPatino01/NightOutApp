// Get the current URL
const currentUrl = window.location.href;

// Check if the URL contains "edit_usuario"
if (currentUrl.includes("edit_usuario")) {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('id');

    if (pId) {
        // Construct the URL with the ID as a query parameter
        const apiUrl = `http://192.168.1.70:3000/get_usuarios/?correo_electronico=${pId.toLowerCase()}`;

        // Make a GET request
        fetch(apiUrl)
            .then(response => {
                if (response.ok) {
                    return response.json(); // Parse the JSON response
                } else {
                    throw new Error('Failed to fetch data');
                }
            })
            .then(data => {
                // Populate the HTML form with the retrieved data
                const userData = data[0]; // Assuming you expect a single user's data
                if (userData) {
                    document.getElementById('nombre').value = userData.nombre;
                    document.getElementById('apellido').value = userData.apellido;
                    document.querySelector(`input[name="genero"][value="${userData.genero}"]`).checked = true;
                    document.getElementById('email').value = userData.correo_electronico;
                    document.getElementById('numTelefono').value = userData.num_telefono;

                    // Handle the "Admin" toggle
                    const adminToggle = document.getElementById('toggleSwitch');
                    adminToggle.checked = userData.admin;

                    // Get the "Guardar Datos" button element by its ID
                    const guardarDatosButton = document.querySelector('#guardar-datos-button');

                    // Add a click event listener to the button
                    guardarDatosButton.addEventListener('click', () => {
                        // Get user data from the form and send it to the backend
                        updateUser(userData.id); // Pass the user ID to the function
                    });
                } else {
                    console.log('User data not found.');
                }
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
    } else {
        console.log('ID not found in the URL.');
    }
} else {
    // URL does not contain "edit_usuario"
    console.log("URL does not contain 'edit_usuario'");
    // Add code for other cases here
}

// Function to send the user data to the backend for update
function updateUser(userId) {
    // Get user data from the form
    const userData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        genero: document.querySelector('input[name="genero"]:checked').value,
        email: document.getElementById('email').value,
        numTelefono: document.getElementById('numTelefono').value,
        admin: document.getElementById('toggleSwitch').checked ? 1 : 0, // Convert boolean to 0 or 1
    };

    // Send a PUT request to update the user data
    fetch(`http://192.168.1.70:3000/update_usuario/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (response.ok) {
                // Handle success (e.g., show a success message)
                console.log('User data updated successfully');
                alert("Los datos del usuario han sido actualizados.");
                window.location.href = "usuarios.html";
            } else {
                // Handle errors (e.g., show an error message)
                console.error('Failed to update user data');
            }
        })
        .catch(error => {
            // Handle network errors
            console.error('Network error:', error);
        });
}
