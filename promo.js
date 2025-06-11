document.getElementById('customDownload').addEventListener('click', function(e) {
  e.preventDefault();
  const url = 'videos/cymonzi-video.mp4';
  const fileName = 'CymonZi-Promo.mp4';
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('downloadProgress');
  const progressText = document.getElementById('progressText');

  progressContainer.style.display = 'block';
  progressBar.value = 0;
  progressText.textContent = 'Starting...';

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      const contentLength = response.headers.get('content-length');
      if (!contentLength) {
        // No content-length: fallback to no progress
        return response.blob().then(blob => ({blob, noProgress: true}));
      }
      const total = parseInt(contentLength, 10);
      let loaded = 0;
      return new Response(
        new ReadableStream({
          start(controller) {
            const reader = response.body.getReader();
            function read() {
              reader.read().then(({done, value}) => {
                if (done) {
                  controller.close();
                  progressText.textContent = 'Download complete!';
                  setTimeout(() => progressContainer.style.display = 'none', 1200);
                  return;
                }
                loaded += value.byteLength;
                progressBar.value = Math.round((loaded / total) * 100);
                progressText.textContent = `${progressBar.value}%`;
                controller.enqueue(value);
                read();
              });
            }
            read();
          }
        })
      ).blob().then(blob => ({blob, noProgress: false}));
    })
    .then(({blob, noProgress}) => {
      if (noProgress) {
        progressBar.value = 100;
        progressText.textContent = 'Download complete!';
        setTimeout(() => progressContainer.style.display = 'none', 1200);
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => {
      progressText.textContent = 'Download failed';
      setTimeout(() => progressContainer.style.display = 'none', 2000);
    });
});