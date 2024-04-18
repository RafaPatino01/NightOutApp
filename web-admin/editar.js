// Get the current URL
const currentUrl = window.location.href;
let imageUrls = [];
let mapaUrl = "";

// Check if the URL contains "edit_usuario"
if (currentUrl.includes("edit_usuario")) {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('id');

    if (pId) {
        // Construct the URL with the ID as a query parameter
        const apiUrl = `https://nightout.com.mx/api/get_usuarios/?correo_electronico=${pId.toLowerCase()}`;

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
console.log("Editando establecimiento...");

const urlParams = new URLSearchParams(window.location.search);
const pId = urlParams.get('id');

if (pId) {
    // Construct the URL with the ID as a query parameter
    const apiUrl = `https://nightout.com.mx/api/get_establecimiento/${pId}`;

    // Make a GET request
    fetch(apiUrl)
        .then(response => {
            if (response.ok) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Failed to fetch data');
            }
        })
        // Inside the .then(data => { ... }) block
    .then(data => {
        // Populate the HTML form with the retrieved data
        const establecimientoData = data;

        console.log(establecimientoData);
        
        if (establecimientoData) {
            // Populate the form fields
            document.getElementById('nombre').value = establecimientoData.nombre;
            document.getElementById('fixed').checked = establecimientoData.fixed === 1;
            document.getElementById('email').value = establecimientoData.email;
            document.getElementById('ubicacion').value = establecimientoData.ubicacion;
            document.getElementById('capacidad_total').value = establecimientoData.capacidad_total;
            document.getElementById('num_mesas').value = establecimientoData.num_mesas;
            document.getElementById('capacidades_mesa').value = establecimientoData.capacidades_mesa;
            document.getElementById('tipo').value = establecimientoData.tipo;
            document.getElementById('descripcion').value = establecimientoData.descripcion;
            document.getElementById('horario').value = establecimientoData.horario;
            document.getElementById('horariocsv').value = establecimientoData.horariocsv;
            document.getElementById('restricciones').value = establecimientoData.restricciones;
            document.getElementById('tipo_de_pago').value = establecimientoData.tipo_de_pago;
            document.getElementById('precios').value = establecimientoData.precios;
            document.getElementById('redes_sociales').value = establecimientoData.redes_sociales;
            document.getElementById('link_google_maps').value = establecimientoData.link_google_maps;
            document.getElementById('link_menu').value = establecimientoData.link_menu;

            document.getElementById('ubicacion_general').value = establecimientoData.ubicacion_general;
            
            // Assuming you have an array of image URLs in the 'images' property of 'establecimientoData'
            imageUrls = establecimientoData.images; 
            mapaUrl = establecimientoData.imagen_mapa; 

            // Get the image container element
            const imageContainer = document.getElementById('image-container');
            const imageContainer2 = document.getElementById('image-container2');

            // Clear any existing images in the container
            imageContainer.innerHTML = '';
            imageContainer2.innerHTML = '';

            const mapa_fullImageUrl = `https://nightout.com.mx/api${mapaUrl.substring(1)}`;
            // Create a container for the image with the 'image-wrapper' class
            const mapa_imageWrapper = document.createElement('div');
            mapa_imageWrapper.className = 'image-wrapper';

            // Create the image element
            const mapa_imgElement = document.createElement('img');
            mapa_imgElement.src = mapa_fullImageUrl;
            mapa_imgElement.alt = 'Image';

            // Create the red X element
            const mapa_redX = document.createElement('span');
            mapa_redX.classList.add('red-x');
            mapa_redX.textContent = '❌'; // Unicode character for a red X
            mapa_redX.style.display = 'none'; // Initially hide the X

            // Append the image element to the container
            mapa_imageWrapper.appendChild(mapa_imgElement);

            // Append the red X element to the container
            mapa_imageWrapper.appendChild(mapa_redX);

            // Add hover effect to show the red X
            mapa_imageWrapper.addEventListener('mouseenter', () => {
                mapa_redX.style.display = 'block';
            });

            mapa_imageWrapper.addEventListener('mouseleave', () => {
                mapa_redX.style.display = 'none';
            });

            // Add click event to print the image source
            mapa_imageWrapper.addEventListener('click', () => {
                console.log(mapa_fullImageUrl);
                mapaUrl = ""
                renderImages()
            });

            // Append the container to the image container
            imageContainer2.appendChild(mapa_imageWrapper);


            // Loop through the image URLs and create image elements with full URLs
            for (const imageUrl of imageUrls) {
                // Remove the dot at the beginning of the URL and create a full URL
                const fullImageUrl = `https://nightout.com.mx/api${imageUrl.substring(1)}`;

                // Create a container for the image with the 'image-wrapper' class
                const imageWrapper = document.createElement('div');
                imageWrapper.className = 'image-wrapper';

                // Create the image element
                const imgElement = document.createElement('img');
                imgElement.src = fullImageUrl;
                imgElement.alt = 'Image';

                // Create the red X element
                const redX = document.createElement('span');
                redX.classList.add('red-x');
                redX.textContent = '❌'; // Unicode character for a red X
                redX.style.display = 'none'; // Initially hide the X

                // Append the image element to the container
                imageWrapper.appendChild(imgElement);

                // Append the red X element to the container
                imageWrapper.appendChild(redX);

                // Add hover effect to show the red X
                imageWrapper.addEventListener('mouseenter', () => {
                    redX.style.display = 'block';
                });

                imageWrapper.addEventListener('mouseleave', () => {
                    redX.style.display = 'none';
                });

                // Add click event to print the image source
                imageWrapper.addEventListener('click', () => {

                    console.log("previous array: " + imageUrls)


                    for(let i = 0; i<imageUrls.length; i++) {
                        if(fullImageUrl.includes(imageUrls[i].replace(/\./, ""))){
                            imageUrls.splice(i, 1);
                        }
                    }

                    console.log("updated array: " + imageUrls)

                    renderImages();

                });

                // Append the container to the image container
                imageContainer.appendChild(imageWrapper);
            }

            // Get the "Guardar Datos" button element by its ID
            const guardarDatosButton = document.querySelector('#guardar-datos-button');

            // Add a click event listener to the button
            guardarDatosButton.addEventListener('click', () => {
                // Get Establecimiento data from the form and send it to the backend
                updateEstablecimiento(establecimientoData.id); 
            });
        } else {
            console.log('Establecimiento data not found.');
        }
    })
    .catch(error => {
        console.error('Request failed:', error);
    });
} else {
    console.log('ID not found in the URL.');
}


}

// Function to send the user data to the backend for update
function updateUser(userId) {
    // Get user data from the form
    const userData = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        genero: document.querySelector('input[name="genero"]:checked').value,
        correo_electronico: document.getElementById('email').value,
        num_telefono: document.getElementById('numTelefono').value,
        admin: document.getElementById('toggleSwitch').checked ? 1 : 0, // Convert boolean to 0 or 1
    };

    // Send a PUT request to update the user data
    fetch(`https://nightout.com.mx/api/update_usuario/${userId}`, {
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


// Function to send the establecimiento data to the backend for update
function updateEstablecimiento(establecimientoId) {
    const formData = new FormData();
    
    // Append text fields to formData
    formData.append('email', document.getElementById('email').value);
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('fixed', document.getElementById('fixed').checked ? 1 : 0);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('horario', document.getElementById('horario').value);
    formData.append('horariocsv', document.getElementById('horariocsv').value);
    formData.append('tipo', document.getElementById('tipo').value);
    formData.append('num_mesas', document.getElementById('num_mesas').value);
    formData.append('capacidades_mesa', document.getElementById('capacidades_mesa').value);
    formData.append('capacidad_total', document.getElementById('capacidad_total').value);
    formData.append('ubicacion', document.getElementById('ubicacion').value);
    formData.append('ubicacion_general', document.getElementById('ubicacion_general').value);
    formData.append('link_google_maps', document.getElementById('link_google_maps').value);
    formData.append('link_menu', document.getElementById('link_menu').value);

    formData.append('restricciones', document.getElementById('restricciones').value);
    formData.append('tipo_de_pago', document.getElementById('tipo_de_pago').value);
    formData.append('precios', document.getElementById('precios').value);
    formData.append('redes_sociales', document.getElementById('redes_sociales').value);
    formData.append('imageUrls', JSON.stringify(imageUrls));

    // Append files for images and imagen_mapa
    const imageFiles = document.getElementById('images').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }
    const mapaFile = document.getElementById('imagen_mapa').files[0];
    if (mapaFile) {
        formData.append('imagen_mapa', mapaFile);
    }

    // Send a PUT request to update the establecimiento data
    fetch(`https://nightout.com.mx/api/update_establecimiento/${establecimientoId}`, {
        method: 'PUT',
        // Do not set 'Content-Type': 'application/json' here because we are sending FormData
        body: formData // Send the formData instead of JSON
    })
    .then(response => {
        if (response.ok) {
            // Handle success (e.g., show a success message)
            console.log('Establecimiento data updated successfully');
            alert("Los datos del establecimiento han sido actualizados.");
            window.location.href = "establecimientos.html";
        } else {
            // Handle errors (e.g., show an error message)
            console.error('Failed to update establecimiento data');
            response.text().then(text => console.error(text));
        }
    })
    .catch(error => {
        // Handle network errors
        console.error('Network error:', error);
    });
}


