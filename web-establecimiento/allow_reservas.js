let allow_reservas_element = document.getElementById("allow_reservas_check");

allow_reservas_element.addEventListener('change', function() {
    let establecimientoId = this.getAttribute('data-id');
    let allowReservas = this.checked ? 1 : 0; // Convert boolean checked state to 1 or 0

    // Prepare the data to send in the POST request
    let data = {
        establecimiento_id: establecimientoId,
        allow_reservas: allowReservas
    };

    // Use fetch API to send the POST request to the server
    fetch('https://nightout.com.mx/api/update_allow_reservas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            // Handle server errors or invalid responses
            throw new Error('Something went wrong on API server!');
        }
    })
    .then(responseData => {
        // Handle success response
        console.log(responseData.message);
    })
    .catch(error => {
        // Handle errors in fetching or server-side issues
        console.error(error);
    });

    if (this.checked) {
        console.log("Toggle on");
    } else {
        console.log("Toggle off");
    }
});
