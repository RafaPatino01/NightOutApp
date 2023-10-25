// Hacer una solicitud GET a la URL
fetch("http://192.168.100.11:3000/get_all_usuarios")
.then(response => {
  // Verificar si la respuesta es exitosa (código de estado 200)
  if (response.status === 200) {
    // Parsear la respuesta como JSON
    return response.json();
  } else {
    console.error("Error al obtener usuarios. Código de estado:", response.status);
  }
})
.then(data => {
  if (data) {
    // Imprimir los usuarios en la consola
    console.log("Usuarios obtenidos correctamente.");

    
    data.forEach(element => {
      document.getElementById("container").innerHTML += ` <div class="row">
      <div class="col-3 border py-2"><p class="text-break">${element["nombre"]}</p></div>
      <div class="col-3 border py-2"><p class="text-break">${element["apellido"]}</p></div>
      <div class="col-3 border py-2"><p class="text-break">${element["correo_electronico"]}</p></div>
      <div class="col-3 border py-2">
          <div class="row">
              <div class="col-6"><button type="button" class="btn btn-info" onclick="edit('${element["correo_electronico"]}')">✏️ Editar</button></div>
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