const myModal = new bootstrap.Modal(document.getElementById("myModal"));

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