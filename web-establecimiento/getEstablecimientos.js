// Hacer una solicitud GET a la URL
fetch("http://192.168.100.11:3000/get_establecimientos")
  .then(response => {
    // Verificar si la respuesta es exitosa (código de estado 200)
    if (response.status === 200) {
      // Parsear la respuesta como JSON
      return response.json();
    } else {
      console.error("Error al obtener establecimientos. Código de estado:", response.status);
    }
  })
  .then(data => {
    if (data) {
      // Imprimir los establecimientos en la consola
      console.log("establecimientos obtenidos correctamente.");

      
      data.forEach(element => {
        document.getElementById("container").innerHTML += ` <div class="row">
        <div class="col-3 border py-2"><p class="text-break filtro_base">${element["nombre"]}</p></div>
        <div class="col-3 border py-2"><p class="text-break">${element["email"]}</p></div>
        <div class="col-3 border py-2"><p class="text-break">${element["tipo"]}</p></div>
        <div class="col-3 border py-2">
            <div class="row">
                <div class="col-6"><button type="button" class="btn btn-info" onclick="edit('${element["id"]}')">✏️ Editar</button></div>
                <div class="col-6"><button type="button" class="btn btn-danger" onclick="remove('${element["id"]}')">Eliminar</button></div>
            </div>
        </div>
        </div>`;
      });

    }
  })
  .catch(error => {
    console.error("Error al realizar la solicitud:", error);
  });


function edit(pId){
    console.log("editar " + pId)
    // Construct the URL with the ID as a query parameter
    const url = `edit_establecimiento.html?id=${pId}`;

    // Navigate to the new URL
    window.location.href = url;
}

function remove(pId){
    $('#deleteUserModal').modal('show');
    establecimientoId = pId;
}

// Function to delete a user by ID
function deleteEstablecimiento(establecimientoId) {
    // Send a DELETE request to delete the user

    fetch(`http://192.168.100.11:3000/delete_establecimiento/${establecimientoId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            // Handle success (e.g., show a success message)
            console.log('User deleted successfully');
            // Optionally, you can redirect to a different page or update the UI here.
        } else {
            // Handle errors (e.g., show an error message)
            console.error('Failed to delete user');
        }
    })
    .catch(error => {
        // Handle network errors
        console.error('Network error:', error);
    });
}