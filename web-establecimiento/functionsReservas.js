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

        getAllReservas(id);

    })
    .catch(error => {
      console.error('Error fetching establecimiento:', error);
    });

    
} else {
  console.error("NightOut_Establecimiento cookie not found or id is missing");
}

function generateDateTimeHTML(dateTimeString) {

    console.log(String(dateTimeString))

    let year = dateTimeString.substring(0, 4);
    let month = dateTimeString.substring(5, 7);
    let day = dateTimeString.substring(8, 10);
    let hour = dateTimeString.substring(11, 16);

    // Generate the HTML string
    const htmlString = `
        <p class="py-0 m-0">${day}/${month}/${year}</p>
        <p class="py-0 m-0">${hour}</p>
    `;

    return htmlString;
}


function getUsuario(pId) {
    // Build the URL for the GET request
    const url = `https://nightout.com.mx/api/get_usuario_by_id/${pId}`;

    // Execute the fetch request and return a Promise
    return fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(errorData => {
                throw new Error(errorData.error);
            });
        }
    });
}

function getAllReservas(pId){
    const url = `https://nightout.com.mx/api/get_all_reservas/?establecimiento_id=${pId}`;

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
    .then(reservas => {
        console.log('Received reservas:', reservas);

        document.getElementById("reservas_historial").innerHTML = "";

        reservas.forEach(reserva => {
            //if(reserva.asistencia == 0){
                getUsuario(reserva.usuario_id)
                .then(usuario => {
    
    
    
                    document.getElementById("reservas_historial").innerHTML += `
                    
                    <div class="container2 mt-3 px-4">
                        <div class="row bg-dark p-3 rounded">
                            <div class="col-lg-1 col-2 d-flex justify-content-center align-items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-calendar-minus" viewBox="0 0 16 16">
                                <path d="M5.5 9.5A.5.5 0 0 1 6 9h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                                </svg>
                            </div>
                            <div class="col-lg-2 col-4 d-flex align-items-center border-end">
                                <p class="m-0 text-bold">${usuario.nombre} ${usuario.apellido}</p>
                            </div>
                            <div class="col-lg-2 col-4 ps-3">
                                <p class="py-0 m-0">${reserva.tipo_de_mesa}</p>
                                ${generateDateTimeHTML(reserva.fecha_hora)}
                            </div>
                        </div>
                    </div>
                    `;
                });
            //}

        });

    })
    .catch(error => {
        console.error('Error fetching reservas:', error);
    });

}

function filterReservas() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const reservas = document.querySelectorAll('#reservas_historial .container2');

    reservas.forEach(reserva => {
        const name = reserva.querySelector('.text-bold').textContent.toLowerCase();
        if (name.includes(searchQuery)) {
            reserva.style.display = ''; // Show the reserva if the name matches
        } else {
            reserva.style.display = 'none'; // Hide the reserva if the name does not match
        }
    });
}

document.getElementById('reservaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        fecha_hora: document.getElementById('fecha_reserva').value,
        usuario_id: 999,
        establecimiento_id: id,
        numero_personas: document.getElementById('n_personas_reserva').value,
        confirmado: 0,
        asistencia: 0,
        tipo_mesa: document.getElementById('tipo_mesa_reserva').value,
        nombre: document.getElementById('nombre_reserva').value,
    };

    fetch('https://nightout.com.mx/api/add_reserva_generica', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Reserva added successfully!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error adding reserva');
    });
});
