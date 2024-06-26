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
        let allow_reservas_element = document.getElementById("allow_reservas_check");
allow_reservas_element.checked = establecimiento.allow_reservas === 1;
        allow_reservas_element.setAttribute('data-id', establecimiento.id);        //obtain reservas of current establecimiento
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

            let fechaReserva = new Date(reserva.fecha_hora);
            let hoy = new Date();
            hoy.setDate(hoy.getDate() - 1); // Ajustamos 'ayer' para que sea el día anterior

            // Ajustamos 'hoy' para que no tome en cuenta la hora
            hoy.setHours(0, 0, 0, 0);

            if (fechaReserva >= hoy) {

                getUsuario(reserva.usuario_id)
                .then(usuario => {
                let name = reserva.nombre === "nombreABC"
                ? `${usuario.nombre} ${usuario.apellido}`
                : `${reserva.nombre}`;

                let isApp = reserva.nombre === "nombreABC" ? true : false;

                if(isApp) {
                    document.getElementById("reservas_pendientes").innerHTML += `
                
                    <div class="container2 mt-3 px-4">
                        <div class="row bg-dark p-3 rounded">
                            <div class="col-12 col-md-6">
                                <p class="m-0 text-bold searchable_item">${name}</p>
                                <hr>
                                <p class="py-0 m-0 mb-3"> <span class="bg-secondary p-1 rounded">Identificador Mesa:</span> ${reserva.identificador_mesa}</p>

                                <p class="py-0 m-0 searchable_tipo"> <span class="bg-secondary p-1 rounded">Tipo de mesa:</span> ${reserva.tipo_de_mesa}</p>
                                ${generateDateTimeHTML(reserva.fecha_hora)}
                                <hr>
                                <i class="m-0 text-muted">Reserva creada el ${formatDate(reserva.created_at)}</i>
                                
                            </div>
    
                            <div class="col-12 col-md-6 px-0 py-4 m-0">
                                <div class="row p-0 mt-0 w-100 h-100">
    
                                    <div class="col-4 p-2 text-center" onclick="cancelarReserva(${reserva.id})">
                                    <div class="bg-danger rounded d-flex align-items-center p-4">
                                    <p class="w-100 text-center text-white text-truncate">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                                    <path d="M15 8a6.973 6.973 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8ZM2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Z"/>
                                    </svg>
                                    </p>
                                    </div>
                                    
                                    </div>
    
                                    <div class="col-4 p-2 text-center" onclick="leerQr(${reserva.id})">
                                        <div class="bg-primary rounded d-flex align-items-center p-4">
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
    
                                    <div class="col-4 p-2 text-center" onclick="updateReserva(${reserva.id})">
                                        <div class="bg-success rounded d-flex align-items-center p-4">
                                        <p class="w-100 text-center text-white">    
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                            </svg>
                                        </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    `;
            }
            else {
                document.getElementById("reservas_pendientes").innerHTML += `
                
                <div class="container2 mt-3 px-4">
                    <div class="row bg-dark p-3 rounded">
                        <div class="col-12 col-md-6">
                            <p class="m-0 text-bold searchable_item">${name}</p>
                            <hr>
                            <p class="py-0 m-0 mb-3"> <span class="bg-secondary p-1 rounded">RP:</span> ${reserva.nombre_rp}</p>
                            <p class="py-0 m-0 mb-3"> <span class="bg-secondary p-1 rounded">Identificador Mesa:</span> ${reserva.identificador_mesa}</p>

                            <p class="py-0 m-0 searchable_tipo"> <span class="bg-secondary p-1 rounded">Tipo de mesa:</span> ${reserva.tipo_de_mesa}</p>
                            ${generateDateTimeHTML(reserva.fecha_hora)}
                            <hr>
                            <i class="m-0 text-muted">Reserva creada el ${formatDate(reserva.created_at)}</i>
                            
                        </div>

                        <div class="col-12 col-md-6 px-0 py-4 m-0">
                            <div class="row p-0 mt-0 w-100 h-100">

                                <div class="col-4 p-2 text-center" onclick="cancelarReserva(${reserva.id})">
                                <div class="bg-danger rounded d-flex align-items-center p-4">
                                <p class="w-100 text-center text-white text-truncate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                                <path d="M15 8a6.973 6.973 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8ZM2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Z"/>
                                </svg>
                                </p>
                                </div>
                                
                                </div>

                                <div class="col-4 p-2 text-center" onclick="updateReservaManual(${reserva.id})">
                                    <div class="bg-primary rounded d-flex align-items-center p-4">
                                    <p class="w-100 text-center text-white">    
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                    </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                `;
                }
                
            });

            }
            
            
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

    console.log(String(dateTimeString))

    let year = dateTimeString.substring(0, 4);
    let month = dateTimeString.substring(5, 7);
    let day = dateTimeString.substring(8, 10);
    let hour = dateTimeString.substring(11, 16);

    // Generate the HTML string
    const htmlString = `
        <p class="py-0 mx-0 my-2 searchable_fecha"><span class="bg-secondary p-1 rounded">Fecha:</span> <span class="searchable_fecha">${day}/${month}/${year} <span></p>
        <p class="py-0 mx-0 my-2 searchable_horario"><span class="bg-secondary p-1 rounded">Horario:</span> ${hour}</p>
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


const updateReserva = async (reservaId) => {
    try {
        const url = `https://nightout.com.mx/api/asistencia_reserva/${reservaId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('Reserva actualizada con éxito:', data);
            window.location.reload();
            
        } else {
            throw new Error(data.error || 'Error al actualizar la reserva');
        }
    } catch (error) {
        console.error('Error al actualizar la reserva:', error);
        throw error; // Propaga el error para manejo externo
    }
};

const updateReservaManual = async (reservaId) => {
    try {
        const url = `https://nightout.com.mx/api/asistencia_reserva_manual/${reservaId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log('Reserva actualizada con éxito:', data);
            window.location.reload();
            
        } else {
            throw new Error(data.error || 'Error al actualizar la reserva');
        }
    } catch (error) {
        console.error('Error al actualizar la reserva:', error);
        throw error; // Propaga el error para manejo externo
    }
};

function filterReservas() {
    const nameQuery = document.getElementById('searchName').value.toLowerCase();
    const dateQuery = document.getElementById('searchDate').value.toLowerCase();
    const timeQuery = document.getElementById('searchTime').value.toLowerCase();
    const typeQuery = document.getElementById('searchType').value.toLowerCase();
    const reservas = document.querySelectorAll('#reservas_pendientes .container2');

    reservas.forEach(reserva => {
        const nameMatch = reserva.querySelector('.searchable_item').textContent.toLowerCase().includes(nameQuery);
        const dateMatch = reserva.querySelector('.searchable_fecha').textContent.toLowerCase().includes(dateQuery);
        const timeMatch = reserva.querySelector('.searchable_horario').textContent.toLowerCase().includes(timeQuery);
        const typeMatch = reserva.querySelector('.searchable_tipo').textContent.toLowerCase().includes(typeQuery);

        if (nameMatch && dateMatch && timeMatch && typeMatch) {
            reserva.style.display = '';
        } else {
            reserva.style.display = 'none';
        }
    });
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}
  