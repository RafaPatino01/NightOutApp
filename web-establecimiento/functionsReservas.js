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
        allow_reservas_element.setAttribute('data-id', establecimiento.id);        
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
        <p class="py-0 m-0 searchable_fecha">${day}/${month}/${year}</p>
        <p class="py-0 m-0 searchable_horario">${hour}</p>
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

async function getAllReservas(pId){
    const url = `https://nightout.com.mx/api/get_all_reservas/?establecimiento_id=${pId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
        const reservas = await response.json();
        console.log('Received reservas:', reservas);

        let htmlContent = "";
        for (const reserva of reservas) {
            const usuario = await getUsuario(reserva.usuario_id);
            htmlContent += createReservaHTML(reserva, usuario);
        }

        document.getElementById("reservas_historial").innerHTML = htmlContent;
        addEventListenersToReservas(reservas);

    } catch (error) {
        console.error('Error fetching reservas:', error);
    }
}

function createReservaHTML(reserva, usuario) {
    let name = reserva.nombre === "nombreABC"
        ? `<div class='bg-custom p-2 rounded small searchable'>Reserva App</div><p class='mt-2 text-bold small searchable'>${usuario.nombre} ${usuario.apellido}</p>`
        : `<div class='bg-secondary p-2 rounded small searchable'>Reserva Establecimiento</div><p class='mt-2 text-bold small searchable'>${reserva.nombre}</p>`;

        
    let status = "🟡 Solicitada";

    if(reserva.asistencia == 1){
        status = "✅ Asistió";
    }
    else if(reserva.confirmado == 1 && reserva.asistencia == 0){
        status = "🔵 Confirmado";
    }

    return `
        <div class="container2 mt-3 px-4" id="modal_activate${reserva.id}">
            <div class="row bg-dark p-3 rounded">
                <div class="col-lg-1 col-2 d-flex justify-content-center align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-calendar-minus" viewBox="0 0 16 16">
                    <path d="M5.5 9.5A.5.5 0 0 1 6 9h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5"/>
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
                    </svg>
                </div>
                <div class="col-lg-2 col-5 align-items-center border-end searchable_item">
                    ${name}
                </div>
                <div class="col-lg-2 col-5 ps-3">
                    <p class="py-0 m-0 searchable_identificador_mesa">Número Mesa: ${reserva.identificador_mesa}</p>
                    <p class="py-0 m-0 searchable_nombre_rp">RP: ${reserva.nombre_rp}</p>
                    <p class="py-0 m-0 searchable_status">Status: ${status}</p>
                    <p class="py-0 m-0 searchable_tipo">Tipo: ${reserva.tipo_de_mesa}</p>
                    ${generateDateTimeHTML(reserva.fecha_hora)}
                </div>
            </div>
        </div>
    `;
}

function addEventListenersToReservas(reservas) {
    reservas.forEach(reserva => {
        
        const element = document.getElementById("modal_activate" + reserva.id);
        element.addEventListener("click", () => {
            // Load the modal content here (replace with your modal content)
            const modalContent = `
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Información Reserva</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ID de Reserva: ${reserva.id}
            </div>
            <div class="modal-footer">
            <!--
                <button type="button" class="btn btn-danger" onclick="deleteReserva(${reserva.id})">Borrar Reserva</button>
                -->
            </div>
          `;
      
          // Set the modal content
          const modal = document.querySelector("#myModal .modal-content");
          modal.innerHTML = modalContent;
      
          // Open the modal
          const myModal = new bootstrap.Modal(document.getElementById("myModal"));
          myModal.show();
        });
    });
}

function filterReservas() {
    const nameQuery = document.getElementById('searchName').value.toLowerCase();
    const dateQuery = document.getElementById('searchDate').value.toLowerCase();
    const timeQuery = document.getElementById('searchTime').value.toLowerCase();
    const typeQuery = document.getElementById('searchType').value.toLowerCase();
    const statusQuery = document.getElementById('searchStatus').value.toLowerCase();
    
    const identificador_mesaQuery = document.getElementById('search_identificador_mesa').value.toLowerCase();
    const nombre_rpQuery = document.getElementById('search_nombre_rp').value.toLowerCase();


    const reservas = document.querySelectorAll('#reservas_historial .container2');

    reservas.forEach(reserva => {
        const nameMatch = reserva.querySelector('.searchable_item').textContent.toLowerCase().includes(nameQuery);
        const dateMatch = reserva.querySelector('.searchable_fecha').textContent.toLowerCase().includes(dateQuery);
        const timeMatch = reserva.querySelector('.searchable_horario').textContent.toLowerCase().includes(timeQuery);
        const typeMatch = reserva.querySelector('.searchable_tipo').textContent.toLowerCase().includes(typeQuery);
        const statusMatch = reserva.querySelector('.searchable_status').textContent.toLowerCase().includes(statusQuery);
        const identificador_mesaMatch = reserva.querySelector('.searchable_identificador_mesa').textContent.toLowerCase().includes(identificador_mesaQuery);
        const nombre_rpMatch = reserva.querySelector('.searchable_nombre_rp').textContent.toLowerCase().includes(nombre_rpQuery);

        if (nameMatch && dateMatch && timeMatch && typeMatch && statusMatch && identificador_mesaMatch && nombre_rpMatch) {
            reserva.style.display = '';
        } else {
            reserva.style.display = 'none';
        }
    });
}

function deleteReserva(pReservaID){
    console.log("Eliminando: " + String(pReservaID));
    const url = `https://nightout.com.mx/api/delete_reserva/${pReservaID}`;

    fetch(url, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        location.reload();
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Ha ocurrido un error");
    });
}

document.getElementById('reservaForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        fecha_hora: document.getElementById('fecha_reserva').value,
        usuario_id: 999,
        establecimiento_id: id,
        numero_personas: document.getElementById('n_personas_reserva').value,
        confirmado: 1,
        asistencia: 0,
        tipo_mesa: document.getElementById('tipo_mesa_reserva').value,
        nombre: document.getElementById('nombre_reserva').value,
        nombre_rp: document.getElementById('nombre_rp').value,
        identificador_mesa: document.getElementById('identificador_mesa').value,
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
        alert('Reserva se ha agregado correctamente!');
        // Set the value of the specified elements to empty string
        document.getElementById('fecha_reserva').value = '';
        document.getElementById('n_personas_reserva').value = '';
        document.getElementById('tipo_mesa_reserva').value = '';
        document.getElementById('nombre_reserva').value = '';
        document.getElementById('identificador_mesa').value = '';
        document.getElementById('nombre_rp').value = '';

    })
    .catch((error) => {
        console.error('Error:', error);
        alert('[Error] al agregar reserva.');

        // Set the value of the specified elements to empty string
        document.getElementById('fecha_reserva').value = '';
        document.getElementById('n_personas_reserva').value = '';
        document.getElementById('tipo_mesa_reserva').value = '';
        document.getElementById('nombre_reserva').value = '';
        document.getElementById('identificador_mesa').value = '';
        document.getElementById('nombre_rp').value = '';
    });
});
