/* ============================================================
   CHÚC MỪNG SINH NHẬT - JAVASCRIPT ĐÃ TINH CHỈNH GỌN GÀNG & CẢM XÚC
   - Pháo hoa Canvas rực rỡ & Bóng bay bay lơ lửng
   - Ảnh mèo nữ cute xuất hiện nổi bồng bềnh
   - Tiện ích dí tay vào màn hình 2 giây mở quà
   - Bức thư ấm áp & Bánh gato nến pháo bông rực lửa
   - Tự động phát nhạc sau 2s (hỗ trợ song.mp3 / fallback hộp nhạc)
   ============================================================ */

(() => {
  // --- Biến tham chiếu DOM ---
  const fireworksCanvas = document.getElementById("fireworksCanvas");
  const fwCtx = fireworksCanvas.getContext("2d");
  const sparklerCanvas = document.getElementById("sparklerCanvas");
  const sparkCtx = sparklerCanvas ? sparklerCanvas.getContext("2d") : null;
  const balloonsContainer = document.getElementById("balloonsContainer");
  const catsContainer = document.getElementById("catsContainer");

  const introScreen = document.getElementById("introScreen");
  const giftScreen = document.getElementById("giftScreen");

  const touchArea = document.getElementById("touchArea");
  const progressFill = document.getElementById("progressFill");
  const timerCountdown = document.getElementById("timerCountdown");
  const touchPrompt = document.getElementById("touchPrompt");

  const bgMusic = document.getElementById("bgMusic");
  const sparkCore = document.getElementById("sparkCore");

  // Chu vi vòng tròn tiến trình (2 * PI * 72 ≈ 452.389)
  const RING_CIRCUMFERENCE = 452.389;

  const LETTER_PARAGRAPHS = [
    "Nay là sinh nhật của cậu, tớ chúc cậu luôn hạnh phúc, vui vẻ, xinh đẹp, có sức khỏe để làm những điều mình thích, bớt lo âu suy nghĩ và luôn tích cực bên gia đình nha.",
    "Sau thời gian chia tay, tớ đã nghiêm túc nhìn lại quãng thời gian mình bên nhau. Tớ nhận ra những vấn đề giữa 2 người chưa thực sự được giải quyết, và tớ đã không hiểu hết được những tổn thương, đau đớn và sự kiệt sức mà cậu đã trải qua. Tớ bỏ qua cảm xúc của cậu, nóng nảy, vội vàng, thiếu kiên nhẫn, tạo ra áp lực trong mối quan hệ. Tớ cũng hiểu rằng có những lời xin lỗi hay lời hứa không thể lập tức lấy lại niềm tin đã mất.",
    "Tớ cũng đang cố gắng từng ngày, chăm chỉ hơn trong học tập, tập gym, ăn uống điều độ hơn và học cách yêu thương, trân trọng những người xung quanh, biết lắng nghe, biết tôn trọng và quan tâm hơn. Tớ cũng học cách kiểm soát cơn giận, bình tĩnh hơn khi có mâu thuẫn và giải quyết vấn đề một cách trưởng thành thay vì để cảm xúc làm tổn thương những người mình yêu thương.",
    "Tớ rất trân trọng những điều ở cậu, từ những sở thích, mindset luôn muốn đi lên và sự hiểu chuyện mà cậu đã dành cho tớ.",
    "Thật lòng thì tớ vẫn còn tình cảm với cậu, và nếu một ngày nào đó cậu cũng muốn cho hai đứa một cơ hội, tớ vẫn mong mình có thể bắt đầu lại bằng một cách tốt đẹp hơn, bằng hành động chứ không chỉ bằng lời nói. Nhưng tớ hiểu hiện tại cậu muốn có không gian riêng, và tớ tôn trọng điều đó.",
    "Hôm nay tớ chỉ mong cậu có một sinh nhật thật vui vẻ, được làm những điều mình thích và ở bên những người khiến cậu cảm thấy bình yên.",
    "Chúc mừng sinh nhật cậu nhé ✨",
  ];

  function fillLetterContent() {
    const letterContent = document.getElementById("letterContent");
    if (!letterContent || letterContent.childElementCount > 0) return;

    LETTER_PARAGRAPHS.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      letterContent.appendChild(paragraph);
    });
  }

  function notifyTelegram(eventLabel, storageKey) {
    const token = String(TELEGRAM_BOT_TOKEN || "").trim();
    const chatId = String(TELEGRAM_CHAT_ID || "").trim();
    if (!token || !chatId) return;
    if (storageKey && sessionStorage.getItem(storageKey)) return;
    if (storageKey) sessionStorage.setItem(storageKey, "1");

    const now = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    const isPhone = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const source = document.referrer ? document.referrer : "mở trực tiếp";
    const text = [
      eventLabel,
      `⏰ ${now}`,
      `📱 ${isPhone ? "Điện thoại" : "Máy tính"}`,
      `🔗 ${source}`,
    ].join("\n");

    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${encodeURIComponent(chatId)}&text=${encodeURIComponent(text)}`;
    try {
      fetch(url, { method: "GET", mode: "no-cors", keepalive: true }).catch(
        () => {},
      );
    } catch (e) {
      const beacon = new Image();
      beacon.src = url;
    }
  }

  // --- Trạng thái hệ thống ---
  let isHolding = false;
  let holdStartTime = 0;
  let holdAnimFrame = null;
  let hasUnlocked = false;
  let isCandleLit = true;
  let webAudioCtx = null;
  let webAudioTimer = null;
  let lastVibrateTick = 0;

  // Kích thước màn hình & canvas
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;

  function resizeCanvases() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    fireworksCanvas.width = screenWidth;
    fireworksCanvas.height = screenHeight;

    if (sparklerCanvas) {
      const rect = sparklerCanvas.parentElement.getBoundingClientRect();
      sparklerCanvas.width = rect.width;
      sparklerCanvas.height = rect.height;
    }
  }
  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();

  // Khởi động trước Audio Context khi người dùng chạm
  function warmUpAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !webAudioCtx) {
        webAudioCtx = new AudioContext();
      }
      if (webAudioCtx && webAudioCtx.state === "suspended") {
        webAudioCtx.resume();
      }
    } catch (e) {}
  }

  // ============================================================
  // 1. ENGINE PHÁO HOA NỀN RỰC RỠ
  // ============================================================
  const fwParticles = [];
  const fwColors = [
    "#ff2d60",
    "#ff8da7",
    "#ffd166",
    "#06d6a0",
    "#118ab2",
    "#ff5470",
    "#ffffff",
    "#e0aaff",
    "#ff9f1c",
  ];

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.2 + 1.8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.012;
      this.radius = Math.random() * 3 + 1.8;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.045;
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function launchFirework(x, y, count = 48) {
    const color = fwColors[Math.floor(Math.random() * fwColors.length)];
    for (let i = 0; i < count; i++) {
      fwParticles.push(new FireworkParticle(x, y, color));
    }
  }

  let lastFwTime = 0;
  function updateFireworks(timestamp) {
    if (timestamp - lastFwTime > (hasUnlocked ? 750 : 1500)) {
      const rx = Math.random() * (screenWidth * 0.82) + screenWidth * 0.09;
      const ry = Math.random() * (screenHeight * 0.45) + 60;
      launchFirework(rx, ry, hasUnlocked ? 55 : 36);
      lastFwTime = timestamp;
    }

    fwCtx.clearRect(0, 0, screenWidth, screenHeight);

    for (let i = fwParticles.length - 1; i >= 0; i--) {
      const p = fwParticles[i];
      p.update();
      p.draw(fwCtx);
      if (p.alpha <= 0) {
        fwParticles.splice(i, 1);
      }
    }
    requestAnimationFrame(updateFireworks);
  }
  requestAnimationFrame(updateFireworks);

  // ============================================================
  // 2. BÓNG BAY LƠ LỬNG NHIỀU MÀU SẮC
  // ============================================================
  const balloonColors = [
    "linear-gradient(135deg, #ff758f, #ff4d6d)",
    "linear-gradient(135deg, #ffd166, #ff9f1c)",
    "linear-gradient(135deg, #c77dff, #9d4edd)",
    "linear-gradient(135deg, #a0c4ff, #4361ee)",
    "linear-gradient(135deg, #b9fbc0, #57cc99)",
    "linear-gradient(135deg, #ffb3c6, #ff5c8a)",
  ];

  function spawnBalloon() {
    if (!balloonsContainer) return;
    const balloon = document.createElement("div");
    balloon.className = "balloon";
    const leftPos = Math.random() * 92;
    const dur = Math.random() * 5 + 10;
    const scale = Math.random() * 0.35 + 0.85;
    const color =
      balloonColors[Math.floor(Math.random() * balloonColors.length)];

    balloon.style.left = `${leftPos}%`;
    balloon.style.background = color;
    balloon.style.animationDuration = `${dur}s`;
    balloon.style.transform = `scale(${scale})`;

    balloonsContainer.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, dur * 1000);
  }

  for (let i = 0; i < 7; i++) {
    setTimeout(spawnBalloon, i * 1400);
  }
  setInterval(spawnBalloon, 2000);

  // ============================================================
  // 3. ẢNH MÈO NỮ CUTE NỔI LÊN (CHỈ HIỆN ẢNH, KHÔNG CÓ CHỮ)
  // ============================================================
  const cuteFeminineCatPhotos = [
    // Bé mèo trắng mắt biếc dịu dàng
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=260&auto=format&fit=crop&q=80",
    // Bé mèo xinh bên hoa cỏ
    "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=260&auto=format&fit=crop&q=80",
    // Bé mèo cuộn tròn đáng yêu
    "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=260&auto=format&fit=crop&q=80",
    // Mèo công chúa lông xù ngây thơ
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=260&auto=format&fit=crop&q=80",
    // Bé mèo vàng mắt long lanh
    "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=260&auto=format&fit=crop&q=80",
    // Bé mèo mũi hồng siêu cưng
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=260&auto=format&fit=crop&q=80",
  ];

  function playCuteMeowSound() {
    warmUpAudio();
    if (!webAudioCtx) return;
    try {
      const osc = webAudioCtx.createOscillator();
      const gain = webAudioCtx.createGain();

      osc.type = "sine";
      const now = webAudioCtx.currentTime;
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(1150, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.38);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(webAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  function spawnCuteCat() {
    if (!catsContainer) return;
    const catEl = document.createElement("div");
    catEl.className = "floating-cat";

    // Vị trí ngẫu nhiên ở 2 bên màn hình
    const posX =
      Math.random() > 0.5
        ? Math.random() * 25 + 3 // Bên trái (3% - 28%)
        : Math.random() * 25 + 68; // Bên phải (68% - 93%)
    const posY = Math.random() * 65 + 16; // Chiều cao (16% - 81%)

    catEl.style.left = `${posX}%`;
    catEl.style.top = `${posY}%`;

    const imgUrl =
      cuteFeminineCatPhotos[
        Math.floor(Math.random() * cuteFeminineCatPhotos.length)
      ];
    // CHỈ HIỆN ẢNH MÈO CUTE THUẦN TÚY, KHÔNG HIỆN CHỮ
    catEl.innerHTML = `
      <div class="cat-avatar-wrap">
        <img src="${imgUrl}" alt="Cute Cat" class="cat-avatar-img" draggable="false">
      </div>
    `;

    // Chạm vào mèo: kêu meow, bắn tim và rung
    const onCatTap = (e) => {
      e.stopPropagation();
      createHeartPop(catEl);
      playCuteMeowSound();
      if (navigator.vibrate) navigator.vibrate(35);
    };

    catEl.addEventListener("pointerdown", onCatTap);
    catsContainer.appendChild(catEl);

    // Tự xoá sau 6.5s
    setTimeout(() => {
      catEl.remove();
    }, 6500);
  }

  function createHeartPop(parent) {
    const heart = document.createElement("div");
    heart.className = "cat-heart-pop";
    const hearts = ["💖", "💕", "🐾", "✨", "😻", "🌸"];
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    parent.appendChild(heart);
    setTimeout(() => heart.remove(), 1400);
  }

  setTimeout(spawnCuteCat, 1000);
  setInterval(spawnCuteCat, 3800);

  // ============================================================
  // 4. TIỆN ÍCH DÍ TAY VÀO MÀN HÌNH ĐIỆN THOẠI 2 GIÂY MỞ RA
  // ============================================================
  const HOLD_DURATION = 2000; // 2 giây

  function startHold(e) {
    if (hasUnlocked) return;
    if (e.cancelable) e.preventDefault();
    warmUpAudio();

    if (bgMusic) {
      bgMusic.load();
    }

    isHolding = true;
    holdStartTime = performance.now();
    touchArea.classList.add("holding");

    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    lastVibrateTick = holdStartTime;

    cancelAnimationFrame(holdAnimFrame);
    holdAnimFrame = requestAnimationFrame(checkHoldProgress);
  }

  function checkHoldProgress(now) {
    if (!isHolding || hasUnlocked) return;
    const elapsed = now - holdStartTime;
    const progress = Math.min(1, elapsed / HOLD_DURATION);

    // Cập nhật vòng tròn tiến trình SVG
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    progressFill.style.strokeDashoffset = offset;

    // Rung nhẹ mỗi 400ms tạo cảm giác nạp năng lượng chân thực
    if (now - lastVibrateTick > 400) {
      if (navigator.vibrate) navigator.vibrate(25);
      lastVibrateTick = now;
    }

    const remainingSec = Math.max(0, (HOLD_DURATION - elapsed) / 1000).toFixed(
      1,
    );
    if (progress < 1) {
      timerCountdown.textContent = `Dí yên ngón tay: ${remainingSec}s ✨`;
      touchPrompt.textContent = "Đang cảm nhận năng lượng... 💖";
      holdAnimFrame = requestAnimationFrame(checkHoldProgress);
    } else {
      // ĐÃ ĐỦ 2 GIÂY: MỞ RA ĐIỀU BẤT NGỜ!
      triggerUnlockMagic();
    }
  }

  function endHold(e) {
    if (hasUnlocked) return;
    if (isHolding) {
      isHolding = false;
      touchArea.classList.remove("holding");
      cancelAnimationFrame(holdAnimFrame);

      progressFill.style.strokeDashoffset = RING_CIRCUMFERENCE;
      timerCountdown.textContent = "Giữ yên trong 2 giây nhé";
      touchPrompt.textContent = "Hãy đặt tay cậu vào đây";

      const elapsed = performance.now() - holdStartTime;
      if (elapsed < HOLD_DURATION) {
        timerCountdown.style.color = "#ff1744";
        timerCountdown.textContent = "Hãy giữ đủ 2 giây để mở quà nhé! 💖";
        setTimeout(() => {
          timerCountdown.style.color = "";
          timerCountdown.textContent = "Giữ yên trong 2 giây nhé";
        }, 1500);
      }
    }
  }

  touchArea.addEventListener("touchstart", startHold, { passive: false });
  touchArea.addEventListener(
    "touchmove",
    (e) => {
      if (isHolding && e.cancelable) e.preventDefault();
    },
    { passive: false },
  );
  touchArea.addEventListener("touchend", endHold);
  touchArea.addEventListener("touchcancel", endHold);

  touchArea.addEventListener("mousedown", startHold);
  touchArea.addEventListener("mouseup", endHold);
  touchArea.addEventListener("mouseleave", endHold);

  // ============================================================
  // 5. HIỆU ỨNG MỞ QUÀ BÙNG NỔ (REVEAL MAGIC)
  // ============================================================
  function triggerUnlockMagic() {
    hasUnlocked = true;
    isHolding = false;
    notifyTelegram(
      "🎁 Có người đã dí tay 2 giây và mở quà",
      "hpbdc_tg_unlocked",
    );
    touchArea.classList.remove("holding");
    progressFill.style.strokeDashoffset = 0;

    if (navigator.vibrate) navigator.vibrate([80, 40, 120, 40, 200]);

    // Chớp sáng màn hình
    const flash = document.createElement("div");
    flash.className = "screen-flash flash-active";
    document.body.appendChild(flash);

    // Nổ loạt pháo hoa lớn
    for (let i = 0; i < 9; i++) {
      setTimeout(() => {
        launchFirework(
          Math.random() * screenWidth,
          Math.random() * (screenHeight * 0.6) + 40,
          75,
        );
      }, i * 180);
    }

    // TỰ ĐỘNG PHÁT BÀI HÁT SINH NHẬT SAU 2 GIÂY DÍ TAY
    playBirthdayMusic();

    // Chuyển màn hình từ Màn 1 sang Màn 2
    setTimeout(() => {
      introScreen.classList.remove("active");
      introScreen.classList.add("hidden");

      fillLetterContent();
      giftScreen.classList.remove("hidden");
      giftScreen.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });

      // Nến pháo hoa bắn tia lửa rực rỡ
      startSparklerCandle();

      // Mở phong bì thư
      setTimeout(() => {
        const envelope = document.getElementById("envelope");
        if (envelope) envelope.classList.add("opened");
      }, 400);

      // Tắt flash
      flash.classList.remove("flash-active");
      setTimeout(() => flash.remove(), 600);
    }, 450);
  }

  // ============================================================
  // 6. NẾN PHÁO HOA BÁNH GATO BẮN TIA LỬA RỰC RỠ LIÊN TỤC
  // ============================================================
  const sparklerParticles = [];
  const sparkColors = [
    "#ffffff",
    "#fff7b2",
    "#ffe066",
    "#ffd166",
    "#ff9f1c",
    "#ff3838",
  ];

  class SparklerParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.6 + 1.2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 1.4;
      this.alpha = 1;
      this.decay = Math.random() * 0.035 + 0.02;
      this.color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.09;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.random() * 1.8 + 1.2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 1.6, this.y - this.vy * 1.6);
      ctx.stroke();
      ctx.restore();
    }
  }

  function startSparklerCandle() {
    if (!sparkCtx || !sparklerCanvas) return;
    resizeCanvases();
    isCandleLit = true;
  }

  function animateSparkler() {
    if (sparkCtx && sparklerCanvas) {
      sparkCtx.clearRect(0, 0, sparklerCanvas.width, sparklerCanvas.height);

      if (isCandleLit && sparkCore) {
        const cakeStage = document.getElementById("cakeStage");
        if (cakeStage) {
          const stageRect = cakeStage.getBoundingClientRect();
          const coreRect = sparkCore.getBoundingClientRect();
          const originX = coreRect.left - stageRect.left + coreRect.width / 2;
          const originY = coreRect.top - stageRect.top + coreRect.height / 2;

          for (let i = 0; i < 5; i++) {
            sparklerParticles.push(new SparklerParticle(originX, originY));
          }
        }
      }

      for (let i = sparklerParticles.length - 1; i >= 0; i--) {
        const p = sparklerParticles[i];
        p.update();
        p.draw(sparkCtx);
        if (p.alpha <= 0) {
          sparklerParticles.splice(i, 1);
        }
      }
    }
    requestAnimationFrame(animateSparkler);
  }
  requestAnimationFrame(animateSparkler);

  // ============================================================
  // 7. ÂM NHẠC SINH NHẬT TỰ ĐỘNG PHÁT SAU 2 GIÂY DÍ TAY
  // ============================================================
  function playBirthdayMusic() {
    if (!bgMusic) return;

    // Tự động phát bài hát "toidaidot" của GREY D từ câu "Ngày hôm ấy đã quá ngốc..."
    bgMusic.currentTime = 0;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(
            "Đang phát toidaidot (GREY D) từ câu: Ngày hôm ấy đã quá ngốc...",
          );
        })
        .catch((err) => {
          console.warn("Lỗi autoplay audio, kích hoạt fallback:", err);
          startWebAudioBirthdayTune();
        });
    }
  }

  // Giai điệu Happy Birthday êm dịu dự phòng (Web Audio API)
  const HAPPY_BIRTHDAY_NOTES = [
    { note: 261.63, dur: 0.35 }, // C4
    { note: 261.63, dur: 0.2 }, // C4
    { note: 293.66, dur: 0.5 }, // D4
    { note: 261.63, dur: 0.5 }, // C4
    { note: 349.23, dur: 0.5 }, // F4
    { note: 329.63, dur: 0.9 }, // E4
    { note: 0, dur: 0.2 }, // Nghỉ

    { note: 261.63, dur: 0.35 }, // C4
    { note: 261.63, dur: 0.2 }, // C4
    { note: 293.66, dur: 0.5 }, // D4
    { note: 261.63, dur: 0.5 }, // C4
    { note: 392.0, dur: 0.5 }, // G4
    { note: 349.23, dur: 0.9 }, // F4
    { note: 0, dur: 0.2 }, // Nghỉ

    { note: 261.63, dur: 0.35 }, // C4
    { note: 261.63, dur: 0.2 }, // C4
    { note: 523.25, dur: 0.5 }, // C5
    { note: 440.0, dur: 0.5 }, // A4
    { note: 349.23, dur: 0.5 }, // F4
    { note: 329.63, dur: 0.5 }, // E4
    { note: 293.66, dur: 0.8 }, // D4
    { note: 0, dur: 0.2 }, // Nghỉ

    { note: 466.16, dur: 0.35 }, // Bb4
    { note: 466.16, dur: 0.2 }, // Bb4
    { note: 440.0, dur: 0.5 }, // A4
    { note: 349.23, dur: 0.5 }, // F4
    { note: 392.0, dur: 0.5 }, // G4
    { note: 349.23, dur: 1.1 }, // F4
    { note: 0, dur: 0.8 }, // Nghỉ lặp lại
  ];

  function startWebAudioBirthdayTune() {
    try {
      warmUpAudio();
      if (!webAudioCtx) return;

      let noteIdx = 0;
      function playNextNote() {
        if (hasUnlocked) {
          const item = HAPPY_BIRTHDAY_NOTES[noteIdx];
          if (item.note > 0) {
            playChime(item.note, item.dur);
          }
          noteIdx = (noteIdx + 1) % HAPPY_BIRTHDAY_NOTES.length;
          webAudioTimer = setTimeout(playNextNote, item.dur * 850);
        }
      }
      playNextNote();
    } catch (e) {
      console.warn("Web Audio error:", e);
    }
  }

  function playChime(freq, duration) {
    if (!webAudioCtx) return;
    const osc = webAudioCtx.createOscillator();
    const gain = webAudioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, webAudioCtx.currentTime);

    gain.gain.setValueAtTime(0.01, webAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.22,
      webAudioCtx.currentTime + 0.05,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      webAudioCtx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(webAudioCtx.destination);

    osc.start();
    osc.stop(webAudioCtx.currentTime + duration);
  }

  notifyTelegram("🎂 Có người vừa mở link quà sinh nhật", "hpbdc_tg_opened");
})();
