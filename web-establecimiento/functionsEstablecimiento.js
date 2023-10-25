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
  const url = `http://192.168.100.11:3000/get_establecimiento/${id}`;
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
    const url = `http://192.168.100.11:3000/get_reservas_by_id/${pId}`;

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
                        <div class="col-4 text-center bg-primary d-flex align-items-center rounded" onclick="leerQr(${reserva.id})">
                            <p class="w-100 text-center text-white">Aceptar</p>
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
    const url = `http://192.168.100.11:3000/get_usuario_by_id/${pId}`;

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
    myModal.show();
}
