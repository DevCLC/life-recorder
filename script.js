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

  try {
    // Запрашиваем доступ к экрану для записи
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30, width: 1920, height: 1080 }, // Высокое качество записи
      audio: true
    });

    // Создаем объект MediaRecorder для записи
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    // Обработка данных при записи
    recorder.ondataavailable = e => chunks.push(e.data);

    // Обработка окончания записи
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const videoURL = URL.createObjectURL(blob);
      downloadLink.href = videoURL;
      downloadLink.style.display = "block";

      // Удаление ссылки через 2 минуты
      setTimeout(() => {
        URL.revokeObjectURL(videoURL);
        downloadLink.href = "#";
        downloadLink.style.display = "none";
      }, 2 * 60 * 1000);

      // Останавливаем поток
      stream.getTracks().forEach(track => track.stop());
    };

    // Старт записи
    recorder.start();
    startBtn.disabled = true;
    downloadLink.style.display = "none";
    progressBar.style.width = "0%";

    // Прогресс записи: динамическое определение длительности записи
    let progress = 0;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const duration = Math.floor(elapsed / 1000); // Время записи в секундах
      progress = (duration / 1000) * 100; // Преобразуем в проценты

      progressBar.style.width = `${progress}%`;

      // Когда запись заканчивается (например, через 2 часа или по клику на кнопку)
      if (progress >= 100) {
        clearInterval(interval);
        recorder.stop();
        startBtn.disabled = false;
      }
    }, 1000); // обновление каждую секунду

  } catch (error) {
    console.error("Ошибка:", error);
    alert("Не удалось начать запись. Возможно, доступ к экрану запрещён.");
  }
});

