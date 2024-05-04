const myModal = new bootstrap.Modal(document.getElementById("myModal"));

let qr_read = false;

document.addEventListener("DOMContentLoaded", function() {
      const video = document.getElementById("cameraFeed");
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");

      function scanQRCode() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            console.log("QR Code: ", code.data);
            
            // Stop the camera once QR code is read
            video.srcObject.getTracks().forEach(track => track.stop());
            // Close the modal
            myModal.hide();

            qr_read = true;
            setTimeout(async function() {  // Added async
              if(qr_read){
                if(code.data == currentReservaId){
                  alert("OK");
            
                  // Inline updateReserva function using fetch API
                  try {
                    //const url = `https://nightout.com.mx/api/asistencia_reserva/${currentReservaId}`;
                    const url = `http://localhost:3000/asistencia_reserva/${currentReservaId}`;
                    
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
                } else {
                  alert("El código QR no coincide con el ID de la reserva.");
                }
              }

              qr_read = false;
            }, 600);
            
            
        } else {
            requestAnimationFrame(scanQRCode);
        }
      }
      
      myModal._element.addEventListener('shown.bs.modal', function() {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", function() {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              scanQRCode();
            });
          });
      });

      myModal._element.addEventListener('hidden.bs.modal', function() {
        video.srcObject.getTracks().forEach(track => track.stop());
      });
    });