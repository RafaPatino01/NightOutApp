let currentReservaId = "";

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

function getReservas(pId){
    const url = `https://nightout.com.mx/api/get_reservas_by_id2/${pId}`;

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


        

        document.getElementById("reservas_pendientes").innerHTML = "";

        reservas.forEach(reserva => {
            getUsuario(reserva.usuario_id)
            .then(usuario => {
                document.getElementById("reservas_pendientes").innerHTML += `
                
                <div class="container2 mt-3 px-4">
                    <div class="row bg-dark p-3 rounded">
                        <div class="col-8">
                            <p class="m-0 text-bold">${usuario.nombre} ${usuario.apellido}</p>
                            <hr>
                            <p class="py-0 m-0">${reserva.tipo_de_mesa}</p>
                            ${generateDateTimeHTML(reserva.fecha_hora)}
                        </div>

                        <div class="col-4 p-0 m-0">
                            <div class="row p-0 m-0 w-100 h-100">
                                <div class="col-1 p-0 m-0"></div>

                                <div class="col-5 text-center bg-danger d-flex align-items-center rounded" onclick="cancelarReserva(${reserva.id})">
                                <p class="w-100 text-center text-white text-truncate">
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                                <path d="M15 8a6.973 6.973 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8ZM2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Z"/>
                                </svg>
                                </p>
                                </div>

                                <div class="col-1 p-0 m-0"></div>

                                <div class="col-5 text-center bg-primary d-flex align-items-center rounded" onclick="leerQr(${reserva.id})">
                                    <p class="w-100 text-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-qr-code-scan" viewBox="0 0 16 16">
                                    <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0v-3Zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5ZM.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5Zm15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5ZM4 4h1v1H4V4Z"/>
                                    <path d="M7 2H2v5h5V2ZM3 3h3v3H3V3Zm2 8H4v1h1v-1Z"/>
                                    <path d="M7 9H2v5h5V9Zm-4 1h3v3H3v-3Zm8-6h1v1h-1V4Z"/>
                                    <path d="M9 2h5v5H9V2Zm1 1v3h3V3h-3ZM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8H8Zm2 2H9V9h1v1Zm4 2h-1v1h-2v1h3v-2Zm-4 2v-1H8v1h2Z"/>
                                    <path d="M12 9h2V8h-2v1Z"/>
                                    </svg>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                `;
            })
            
        });


    })
    .catch(error => {
        console.error('Error fetching reservas:', error);
    });

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

function generateDateTimeHTML(dateTimeString) {
    // Parse the input string into a JavaScript Date object
    const dateTime = new Date(dateTimeString);

    // Function to format the date in the "DD/MM/YYYY" format
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Function to format the time in the "h:mmam/pm" format
    function formatTime(date) {
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes}${ampm}`;
    }

    // Format the date and time
    const formattedDate = formatDate(dateTime);
    const formattedTime = formatTime(dateTime);

    // Generate the HTML string
    const htmlString = `
        <p class="py-0 m-0">${formattedDate}</p>
        <p class="py-0 m-0">${formattedTime}</p>
    `;

    return htmlString;
}

function leerQr(reserva_id) {
    currentReservaId = reserva_id.toString();
    myModal.show();
}

async function confirmarReserva(reserva_id) {
    try {
        const url = `https://nightout.com.mx/api/confirmar_reserva/${reserva_id}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
        console.log('Reserva updated successfully:', data);
        } else {
        throw new Error(data.error || 'Failed to update reserva');
        }
    } catch (error) {
        console.error('Error updating reserva:', error);
    }

    window.location.reload();
    
}

async function cancelarReserva(reserva_id) {
    try {
        const url = `https://nightout.com.mx/api/cancelar_reserva/${reserva_id}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
        console.log('Reserva updated successfully:', data);
        } else {
        throw new Error(data.error || 'Failed to update reserva');
        }
    } catch (error) {
        console.error('Error updating reserva:', error);
    }

    window.location.reload();
    
}