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

document.addEventListener("DOMContentLoaded", function() {
  const video = document.getElementById("cameraFeed");
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  const myModal = new bootstrap.Modal(document.getElementById("myModal"));
  const establecimiento_id = getCookie("NightOut_Establecimiento");
  let isScanningActive = true; // Flag to control the scan state

  function scanQRCode() {
    if (!isScanningActive) return; // Exit if scanning is currently disabled
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
  
    if (code) {
      console.log("QR Code: ", code.data);
      isScanningActive = false; // Disable further scanning until processing is complete
      video.srcObject.getTracks().forEach(track => track.stop());
      myModal.hide();
  
      if (code.data.includes("nightout_puntos")) {
        let userID = code.data.replace("nightout_puntos", '');
        let points_to_transfer = parseInt(document.getElementById('input-puntos').value, 10);
        let transaction_type = 'usuario->establecimiento';
  
        postTransaction(userID, establecimiento_id, transaction_type, points_to_transfer)
          .finally(() => {
            // Re-enable scanning here if necessary, or leave it disabled
            isScanningActive = true; // Uncomment this to allow new scans after processing
          });
        
      } else {
        alert("El código QR No pertenece a NightOut");
        location.reload();
      }
    } else {
      requestAnimationFrame(scanQRCode); // Continue scanning if no QR code found
    }
  }    
  
  myModal._element.addEventListener('shown.bs.modal', function() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", function() {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          scanQRCode(); // Start scanning only after the video stream is ready
        });
      });
  });

  myModal._element.addEventListener('hidden.bs.modal', function() {
    video.srcObject.getTracks().forEach(track => track.stop());
    isScanningActive = false; // Disable scanning when modal is closed
  });
});



async function postTransaction(origen_id, destino_id, transaction_type, points_to_transfer) {
  try {
    const response = await fetch('https://nightout.com.mx/api/new_transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origen_id: origen_id,
        destino_id: destino_id,
        transaction_type: transaction_type,
        points_to_transfer: points_to_transfer
      })
    });
    const result = await response.json();
    if (response.ok) {
      console.log('Transaction successful:', result);
      alert("Se han cobrado " + points_to_transfer + " puntos");
      location.reload();
    } else {
      throw new Error(result.message || 'Transaction failed');
    }
  } catch (error) {
    console.error('Error in transaction:', error);
    alert('Error in transaction: ' + error.message);
    location.reload();
  }
}
  