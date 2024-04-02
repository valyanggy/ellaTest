document.addEventListener("DOMContentLoaded", function() {
    var percentage = 0;
    var loader = document.getElementById('loader-percentage');
    var loaderWrapper = document.getElementById('loader-wrapper');
    var interval = setInterval(function() {
      if (percentage >= 100) {
        clearInterval(interval);
        setTimeout(function() {
          loaderWrapper.style.opacity = '0';
          loaderWrapper.style.transition = 'opacity 1s ease-out';
          setTimeout(function() {
            loaderWrapper.style.display = 'none';
          }, 1000);
        }, 500); // Wait half a second before starting the fade-out
      } else {
        percentage++;
        loader.textContent = percentage + '%';
      }
    }, 20); // Adjust time for faster or slower increments
  });
  