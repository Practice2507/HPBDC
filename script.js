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
  const giftContentGrid = document.getElementById("giftContentGrid");

  const touchArea = document.getElementById("touchArea");
  const progressFill = document.getElementById("progressFill");
  const timerCountdown = document.getElementById("timerCountdown");
  const touchPrompt = document.getElementById("touchPrompt");

  const letterRevealBox = document.getElementById("letterRevealBox");
  const revealLetterBtn = document.getElementById("revealLetterBtn");
  const wishEnvelopeWrapper = document.getElementById("wishEnvelopeWrapper");
  const wishEnvelope = document.getElementById("wishEnvelope");
  const storyEnvelopeWrapper = document.getElementById("storyEnvelopeWrapper");
  const storyEnvelope = document.getElementById("storyEnvelope");

  const bgMusic = document.getElementById("bgMusic");
  const musicToggleBtn = document.getElementById("musicToggleBtn");
  const sparkCore = document.getElementById("sparkCore");

  // Chu vi vòng tròn tiến trình (2 * PI * 72 ≈ 452.389)
  const RING_CIRCUMFERENCE = 452.389;

  // ============================================================
  // 👉 1. NỘI DUNG THƯ CHÚC SINH NHẬT (Hiện ngay khi mở màn hình):
  // ============================================================
  const WISH_PARAGRAPHS = [
    "Nay là sinh nhật của cậu, tớ chúc cậu luôn hạnh phúc, vui vẻ, có sức khỏe để làm những điều mình thích, bớt lo âu suy nghĩ và luôn tích cực bên gia đình nha.",
    "Chúc mừng sinh nhật cậu nhé ✨",
  ];

  // ============================================================
  // 👉 2. NỘI DUNG BỨC THƯ TỰ GHI (Hiện khi bấm nút dưới thư chúc):
  // ============================================================
  const STORY_PARAGRAPHS = [
    "Sau thời gian qua, tớ đã nghiêm túc nhìn lại và tớ muốn xin lỗi cậu cho đàng hoàng.",
    "Tớ không kiểm soát được cảm xúc: khi nóng giận, tớ nói những điều làm cậu thấy mình không được coi trọng.",
    "Những lần cãi nhau trước, tớ không giải quyết nên mọi thứ cứ lặp lại, khiến cậu kiệt sức. Tớ cũng đã bỏ qua cảm xúc và không chịu lắng nghe cậu. Tớ hứa nhưng chỉ nói mà không làm được nên cậu thấy mệt và thất vọng.",
    "Tớ xin lỗi vì sự thiếu chín chắn của mình. Tớ biết lời xin lỗi không lập tức lấy lại được niềm tin đã mất. Tớ đang học cách bình tĩnh, biết lắng nghe, biết quan tâm hơn và chịu trách nhiệm cho lời nói của mình.",
    "Một ngày nào đó nếu cậu muốn nghe một lời giải thích đàng hoàng, tớ sẵn sàng giải thích và bù đắp bằng hành động.",
    "Tớ trân trọng sở thích, tính cách và sự hiểu chuyện của cậu. Cảm ơn cậu vì đã ở bên tớ những lúc tớ bết bát, áp lực và khó khăn nhất. Tớ biết điều đó không dễ, và tớ sẽ luôn nhớ.",
    "Chúc mừng sinh nhật cậu nhé ✨",
  ];

  function fillWishLetterContent() {
    const el = document.getElementById("wishLetterContent");
    if (!el || el.children.length > 0 || el.textContent.trim().length > 0) return;
    WISH_PARAGRAPHS.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      el.appendChild(p);
    });
  }

  function fillStoryLetterContent() {
    const el = document.getElementById("storyLetterContent");
    if (!el || el.children.length > 0 || el.textContent.trim().length > 0) return;
    STORY_PARAGRAPHS.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      el.appendChild(p);
    });
  }

  // --- Cấu hình nhận thông báo qua Telegram (Tùy chọn) ---
  // Nếu có dùng Telegram Bot, hãy điền token & chatId vào 2 biến dưới đây; nếu không dùng cứ để trống ""
  const TELEGRAM_BOT_TOKEN = "";
  const TELEGRAM_CHAT_ID = "";

  function notifyTelegram(eventLabel, storageKey) {
    try {
      const token = typeof TELEGRAM_BOT_TOKEN !== "undefined"
        ? String(TELEGRAM_BOT_TOKEN || "").trim()
        : (typeof window !== "undefined" && window.TELEGRAM_BOT_TOKEN ? String(window.TELEGRAM_BOT_TOKEN).trim() : "");
      const chatId = typeof TELEGRAM_CHAT_ID !== "undefined"
        ? String(TELEGRAM_CHAT_ID || "").trim()
        : (typeof window !== "undefined" && window.TELEGRAM_CHAT_ID ? String(window.TELEGRAM_CHAT_ID).trim() : "");
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
      fetch(url, { method: "GET", mode: "no-cors", keepalive: true }).catch(
        () => {},
      );
    } catch (e) {
      console.warn("Lỗi gửi thông báo Telegram:", e);
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
    if (hasUnlocked || isHolding) return;
    if (e && e.cancelable) e.preventDefault();
    warmUpAudio();

    if (bgMusic) {
      bgMusic.load();
    }

    isHolding = true;
    holdStartTime = performance.now();
    touchArea.classList.add("holding");

    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 20, 40]);
      } catch (err) {}
    }
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
      if (navigator.vibrate) {
        try {
          navigator.vibrate(25);
        } catch (err) {}
      }
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
  window.addEventListener("mouseup", (e) => {
    if (isHolding) endHold(e);
  });
  touchArea.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // ============================================================
  // 5. HIỆU ỨNG MỞ QUÀ BÙNG NỔ (REVEAL MAGIC)
  // ============================================================
  function triggerUnlockMagic() {
    hasUnlocked = true;
    isHolding = false;
    cancelAnimationFrame(holdAnimFrame);

    touchArea.classList.remove("holding");
    progressFill.style.strokeDashoffset = 0;

    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 120, 40, 200]);
      } catch (err) {}
    }

    // Gửi thông báo an toàn, tuyệt đối không bao giờ làm gián đoạn hiệu ứng mở quà
    try {
      notifyTelegram(
        "🎁 Có người đã dí tay 2 giây và mở quà",
        "hpbdc_tg_unlocked",
      );
      if (typeof emailjs !== "undefined" && !sessionStorage.getItem("hpbdc_email_unlocked")) {
        sessionStorage.setItem("hpbdc_email_unlocked", "1");
        emailjs.send("service_gi70snv", "template_stkadco", {}).catch(() => {});
      }
    } catch (err) {
      console.warn("Lỗi gửi thông báo mở quà:", err);
    }

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

    // ❌ KHÔNG PHÁT NHẠC VỘI TẠI ĐÂY (Theo yêu cầu: sau khi dí 2s xong thì chưa có nhạc)

    // Chuyển màn hình từ Màn 1 sang Màn 2
    setTimeout(() => {
      introScreen.classList.remove("active");
      introScreen.classList.add("hidden");

      giftScreen.classList.remove("hidden");
      giftScreen.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });

      // Nến pháo hoa bắn tia lửa rực rỡ
      startSparklerCandle();

      // Điền nội dung Thư chúc mừng sinh nhật
      fillWishLetterContent();

      // Tắt flash
      flash.classList.remove("flash-active");
      setTimeout(() => flash.remove(), 600);

      // 👉 SAU KHI DÍ 2S XONG, CHỜ ĐÚNG 4 GIÂY SAU HIỆN NÚT BẤM Ở DƯỚI THƯ CHÚC
      setTimeout(() => {
        showLetterRevealButton();
      }, 4000);
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
  // 7. ÂM NHẠC SINH NHẬT (PHÁT KHI BẤM NÚT MỞ BỨC THƯ)
  // ============================================================
  function playBirthdayMusic() {
    if (!bgMusic) return;

    bgMusic.currentTime = 0;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(
            "Đang phát toidaidot (GREY D) từ câu: Ngày hôm ấy đã quá ngốc...",
          );
          if (musicToggleBtn) {
            musicToggleBtn.classList.remove("hidden");
            musicToggleBtn.classList.add("playing");
          }
        })
        .catch((err) => {
          console.warn("Lỗi phát audio, kích hoạt fallback:", err);
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

  // ============================================================
  // 8. TƯƠNG TÁC THÚ VỊ VỚI THANH SOCOLA & QUE BÁNH QUẾ
  // ============================================================
  function setupChocolateInteractions() {
    const chocoElements = document.querySelectorAll(
      ".choco-bar-wrap, .choco-stick",
    );
    const cakeStage = document.getElementById("cakeStage");
    if (!chocoElements.length || !cakeStage) return;

    const chocoEmojis = ["🍫", "✨", "🤎", "🍓", "🧁"];

    chocoElements.forEach((el) => {
      el.addEventListener("click", () => {
        el.classList.remove("choco-pop-anim");
        void el.offsetWidth;
        el.classList.add("choco-pop-anim");

        // Âm thanh chime nhẹ nhàng ngọt ngào
        try {
          warmUpAudio();
          if (typeof playChime === "function" && webAudioCtx) {
            const randomPitch = [659.25, 783.99, 880, 1046.5][
              Math.floor(Math.random() * 4)
            ];
            playChime(randomPitch, 0.3);
          }
        } catch (err) {}

        // Hiệu ứng hạt bay ngộ nghĩnh
        const rect = el.getBoundingClientRect();
        const stageRect = cakeStage.getBoundingClientRect();
        const x = rect.left - stageRect.left + rect.width / 2;
        const y = rect.top - stageRect.top;

        for (let i = 0; i < 3; i++) {
          const particle = document.createElement("span");
          particle.className = "choco-particle";
          particle.textContent =
            chocoEmojis[Math.floor(Math.random() * chocoEmojis.length)];
          particle.style.left = `${x}px`;
          particle.style.top = `${y}px`;
          particle.style.setProperty(
            "--tx",
            `${(Math.random() - 0.5) * 50}px`,
          );
          particle.style.setProperty(
            "--rot",
            `${(Math.random() - 0.5) * 60}deg`,
          );
          cakeStage.appendChild(particle);

          setTimeout(() => {
            particle.remove();
          }, 1200);
        }
      });
    });
  }

  setupChocolateInteractions();

  // ============================================================
  // 9. NÚT HIỆN SAU 4 GIÂY: BẤM ĐỂ MỞ BỨC THƯ & PHÁT TIẾNG NHẠC
  // ============================================================
  function showLetterRevealButton() {
    if (!letterRevealBox) return;
    letterRevealBox.style.display = "flex";
    void letterRevealBox.offsetWidth;
    letterRevealBox.classList.remove("fade-out");
    letterRevealBox.classList.add("visible");

    // Rung nhẹ điện thoại báo hiệu nút xuất hiện
    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch (e) {}
    }

    // Hiệu ứng pháo hoa nhẹ điểm xuyết quanh nút
    launchFirework(screenWidth * 0.5, screenHeight * 0.65, 35);
  }

  let hasOpenedLetter = false;
  function handleLetterRevealClick() {
    if (hasOpenedLetter) return;
    hasOpenedLetter = true;

    // 1. Đồng thời phát tiếng nhạc lên ngay khi bấm nút
    playBirthdayMusic();

    // 2. Rung haptic phản hồi
    if (navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 100]);
      } catch (e) {}
    }

    // 3. Gửi thông báo nếu có cấu hình Telegram
    try {
      notifyTelegram(
        "💌 Người ấy đã bấm nút mở đọc bức thư tâm sự!",
        "hpbdc_tg_letter_opened",
      );
    } catch (e) {}

    // 4. Hoạt ảnh biến mất mượt mà của nút bấm
    if (letterRevealBox) {
      letterRevealBox.classList.add("fade-out");
      setTimeout(() => {
        letterRevealBox.style.display = "none";
      }, 350);
    }

    // 5. Mở bức thư tự ghi nội dung (hiện ở dưới thư chúc)
    if (storyEnvelopeWrapper) {
      storyEnvelopeWrapper.style.display = "block";
      fillStoryLetterContent();

      void storyEnvelopeWrapper.offsetWidth;
      storyEnvelopeWrapper.classList.add("revealed");

      setTimeout(() => {
        if (storyEnvelope) {
          storyEnvelope.classList.add("opened");
        }
      }, 200);

      // Cuộn màn hình mượt mà đến bức thư để người nhận đọc trọn vẹn
      setTimeout(() => {
        storyEnvelopeWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }

    // 7. Loạt pháo hoa lung linh chào mừng khoảnh khắc mở thư
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        launchFirework(
          Math.random() * screenWidth * 0.8 + screenWidth * 0.1,
          Math.random() * (screenHeight * 0.45) + 60,
          60,
        );
      }, i * 200);
    }
  }

  function setupLetterReveal() {
    if (revealLetterBtn) {
      revealLetterBtn.addEventListener("click", handleLetterRevealClick);
      revealLetterBtn.addEventListener(
        "touchstart",
        () => {
          warmUpAudio();
        },
        { passive: true },
      );
    }
  }

  function setupMusicControls() {
    if (!musicToggleBtn || !bgMusic) return;

    musicToggleBtn.addEventListener("click", () => {
      warmUpAudio();
      if (bgMusic.paused) {
        bgMusic
          .play()
          .then(() => {
            musicToggleBtn.classList.add("playing");
          })
          .catch(() => {});
      } else {
        bgMusic.pause();
        musicToggleBtn.classList.remove("playing");
      }
    });

    bgMusic.addEventListener("play", () => {
      musicToggleBtn.classList.remove("hidden");
      musicToggleBtn.classList.add("playing");
    });

    bgMusic.addEventListener("pause", () => {
      musicToggleBtn.classList.remove("playing");
    });
  }

  setupLetterReveal();
  setupMusicControls();

  notifyTelegram("🎂 Có người vừa mở link quà sinh nhật", "hpbdc_tg_opened");
})();
