  const startBtn = document.getElementById("startBtn");
    const urlInput = document.getElementById("urlInput");
    const progressBar = document.getElementById("progressBar");
    const downloadLink = document.getElementById("downloadLink");

    startBtn.addEventListener("click", async () => {
      const url = urlInput.value.trim();
      if (!url) {
        alert("Пожалуйста, вставьте ссылку на видео.");
        return;
      }

      // Открываем видео в новом окне для записи
      const videoWindow = window.open(url, "_blank", "width=1280,height=720");

      // Ждём немного, чтобы страница прогрузилась
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: true
        });

        const recorder = new MediaRecorder(stream);
        const chunks = [];

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        downloadLink.href = videoURL;
        downloadLink.style.display = "block";

        // ⏳ Удаление ссылки через 2 минуты
        setTimeout(() => {
          URL.revokeObjectURL(videoURL);
          downloadLink.href = "#";
          downloadLink.style.display = "none";
        }, 2 * 60 * 1000);

        if (videoWindow && !videoWindow.closed) {
          videoWindow.close();
        }
      };


        recorder.start();
        startBtn.disabled = true;
        downloadLink.style.display = "none";
        progressBar.style.width = "0%";

        // Прогресс
        let progress = 0;
        const duration = 15; // секунд записи
        const interval = setInterval(() => {
          progress += 100 / duration;
          progressBar.style.width = `${progress}%`;
          if (progress >= 100) {
            clearInterval(interval);
            recorder.stop();
            stream.getTracks().forEach(track => track.stop());
            startBtn.disabled = false;
          }
        }, 1000);
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Не удалось начать запись. Возможно, доступ к экрану запрещён.");
      }
    });