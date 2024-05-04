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
  
    function scanQRCode() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
  
      if (code) {
        console.log("QR Code: ", code.data);
  
        video.srcObject.getTracks().forEach(track => track.stop());
        myModal.hide();
  
        if (code.data.includes("nightout_puntos")) {
          alert("OK");
          let userID = code.data.replace("nightout_puntos", '');
  
          // Assuming 'points_to_transfer' and 'transaction_type' are predetermined or retrieved from somewhere
          let points_to_transfer = 10;  // Example value
          let transaction_type = 'usuario->establecimiento';  // Example transaction type
  
          // Posting data to the '/new_transaction' endpoint
          postTransaction(userID, establecimiento_id, transaction_type, points_to_transfer);
        } else {
          alert("El código QR No pertenece a NightOut");
        }
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
  
    async function postTransaction(origen_id, destino_id, transaction_type, points_to_transfer) {
      try {
        const response = await fetch('http://localhost:3000/new_transaction', {
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
          alert('Transaction successful!');
        } else {
          throw new Error(result.message || 'Transaction failed');
        }
      } catch (error) {
        console.error('Error in transaction:', error);
        alert('Error in transaction: ' + error.message);
      }
    }
  });
  