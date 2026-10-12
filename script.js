/* ============================================================
   PATRICK & MICHAELA — WEDDING INVITATION
   ============================================================ */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const body = document.body;
  const landing = $("#landing");
  const sealBtn = $("#discoverSeal");
  const discoverBtn = $("#discoverBtn");
  const bgm = $("#bgm");
  const musicBtn = $("#musicBtn");

  /* ---------- 1. LANDING — SEAL OR DISCOVER OPENS ---------- */
  let opened = false;

  function openInvitation(triggeredByUser) {
    if (opened) return;
    opened = true;

    window.scrollTo({ top: 0, behavior: "auto" });
    if (triggeredByUser) setTimeout(playMusic, 150);

    landing.classList.add("is-open");
    body.classList.remove("is-locked");

    setTimeout(() => {
      body.classList.add("unlocked");
      initObservers();
    }, 2400);

    setTimeout(() => landing.classList.add("is-complete"), 3200);
    setTimeout(() => { landing.style.display = "none"; }, 4000);
  }

  if (sealBtn) sealBtn.addEventListener("click", () => openInvitation(true));
  if (discoverBtn) discoverBtn.addEventListener("click", () => openInvitation(true));

  const autoOpenTimer = setTimeout(() => openInvitation(false), 15000);
  if (sealBtn) sealBtn.addEventListener("click", () => clearTimeout(autoOpenTimer));
  if (discoverBtn) discoverBtn.addEventListener("click", () => clearTimeout(autoOpenTimer));

  /* ---------- 2. ALL OBSERVERS — start after landing opens ---------- */
  let observersInit = false;
  function initObservers() {
    if (observersInit) return;
    observersInit = true;

    const revealEls = $$(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    const timeline = $("#timeline");
    if (timeline) {
      if ("IntersectionObserver" in window) {
        const tlObs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-drawn");
                tlObs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
        );
        tlObs.observe(timeline);
      } else {
        timeline.classList.add("is-drawn");
      }
    }
  }

  /* ---------- 3. COUNTDOWN ---------- */
  const countdownBox = $("#countdownBox");
  if (countdownBox) {
    const target = new Date(countdownBox.dataset.date).getTime();
    const units = {
      days:    $('[data-unit="days"]', countdownBox),
      hours:   $('[data-unit="hours"]', countdownBox),
      minutes: $('[data-unit="minutes"]', countdownBox),
      seconds: $('[data-unit="seconds"]', countdownBox),
    };
    const pad = (n) => String(n).padStart(2, "0");
    function tick() {
      let diff = target - Date.now();
      if (diff <= 0) diff = 0;
      units.days.textContent    = pad(Math.floor(diff / 86400000));
      units.hours.textContent   = pad(Math.floor((diff % 86400000) / 3600000));
      units.minutes.textContent = pad(Math.floor((diff % 3600000) / 60000));
      units.seconds.textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 4. ADD TO CALENDAR ---------- */
  const calLink = $("#calLink");
  if (calLink && countdownBox) {
    const start = new Date(countdownBox.dataset.date);
    const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "Wedding of Patrick & Michaela",
      dates: `${fmt(start)}/${fmt(end)}`,
      details: "Nuestra Señora del Pilar Parish Church, San Juan, San Simon, Pampanga. Reception at La Jardin De Librada.",
      location: "Nuestra Señora del Pilar Parish Church, Pampanga",
    });
    calLink.href = `https://calendar.google.com/calendar/render?${params}`;
  }

  /* ---------- 5. TOAST ---------- */
  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-show"), 2400);
  }

  /* ---------- 6. RSVP — SPLITFORMS EMAIL + SMS ---------- */
  const rsvpForm = $("#rsvpForm");
  const thanks = $("#thanks");
  const SMS_NUMBER = "+639650682101";

  // ============================================================
  // ✏️ SPLITFORMS SETUP — FILL IN THESE TWO VALUES
  // ============================================================
  //   1. Sign up at https://splitforms.com
  //   2. Create a new form
  //   3. Set the destination email to mikandpatrickwedding@gmail.com
  //   4. Copy your Access Key from the dashboard and paste it below
  //
  //   If you leave SPLITFORMS_ACCESS_KEY empty, the email button will
  //   fall back to opening the guest's email app with everything filled in.
  // ============================================================
  const SPLITFORMS_ENDPOINT = "https://splitforms.com/api/submit";
  const SPLITFORMS_ACCESS_KEY = "61db9f3f13594bc387d2acf45f8a4e32"; // ← paste your access key here

  function validateForm() {
    const name = $("#name");
    const attendance = $("#attendance");
    let valid = true;
    [name, attendance].forEach((el) => {
      if (!el.value.trim()) { el.classList.add("is-invalid"); valid = false; }
      else el.classList.remove("is-invalid");
    });
    if (!valid) { showToast("Please complete the required fields"); return null; }
    const guests = $("#guests");
    const message = $("#message");
    return {
      name: name.value.trim(),
      attendance: attendance.value,
      guests: guests ? guests.value : "—",
      message: message.value.trim() || "—",
    };
  }

  function finishRsvp() {
    rsvpForm.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* --- EMAIL button --- */
  const emailBtn = $("#rsvpEmail");
  if (emailBtn) {
    emailBtn.addEventListener("click", async () => {
      const data = validateForm();
      if (!data) return;

      if (SPLITFORMS_ACCESS_KEY) {
        emailBtn.disabled = true;
        const originalLabel = emailBtn.textContent;
        emailBtn.textContent = "Sending…";

        // Build URL-encoded body (splitforms docs say this is accepted)
        const params = new URLSearchParams();
        params.append("access_key", SPLITFORMS_ACCESS_KEY);
        params.append("name", data.name);
        params.append("attendance", data.attendance);
        params.append("guests", data.guests);
        params.append("message", data.message);
        params.append("subject", `Wedding RSVP — ${data.name}`);

        // Timeout so the button never hangs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          console.log("→ POST to", SPLITFORMS_ENDPOINT);
          console.log("→ Body:", params.toString());

          const res = await fetch(SPLITFORMS_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const rawText = await res.text();
          console.log("← Status:", res.status);
          console.log("← Raw response:", rawText);

          let result;
          try { result = JSON.parse(rawText); }
          catch { result = { success: res.ok, raw: rawText }; }

          if (!res.ok || !result.success) {
            throw new Error(`HTTP ${res.status}: ${rawText}`);
          }

          finishRsvp();
        } catch (err) {
          clearTimeout(timeoutId);
          console.error("splitforms error:", err);
          emailBtn.disabled = false;
          emailBtn.textContent = originalLabel;

          if (err.name === "AbortError") {
            showToast("Request timed out. Try SMS instead.");
          } else {
            showToast("Send failed. Please try SMS instead.");
          }
        }
        return;
      }

      // Fallback: open email app
      const subject = `Wedding RSVP — ${data.name}`;
      const bodyText =
        `Wedding RSVP — Patrick & Michaela\n` +
        `20 December 2026\n\n` +
        `Name: ${data.name}\n` +
        `Attendance: ${data.attendance}\n` +
        `Number of Guests: ${data.guests}\n` +
        `Message: ${data.message}\n`;
      window.location.href =
        `mailto:mikandpatrickwedding@gmail.com` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyText)}`;
      finishRsvp();
    });
  }

  /* --- SMS button — works on both iOS and Android --- */
  const smsBtn = $("#rsvpSms");
  if (smsBtn) {
    smsBtn.addEventListener("click", () => {
      const data = validateForm();
      if (!data) return;

      const bodyText =
        `Wedding RSVP — Patrick & Michaela. ` +
        `Name: ${data.name}. ` +
        `Attendance: ${data.attendance}. ` +
        `Guests: ${data.guests}. ` +
        `Message: ${data.message}`;

      // iOS uses "&body=", Android uses "?body="
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      const url = isIOS
        ? `sms:${SMS_NUMBER}&body=${encodeURIComponent(bodyText)}`
        : `sms:${SMS_NUMBER}?body=${encodeURIComponent(bodyText)}`;

      window.location.href = url;
      finishRsvp();
    });
  }

  if (rsvpForm) {
    $$("input, select", rsvpForm).forEach((el) =>
      el.addEventListener("input", () => el.classList.remove("is-invalid"))
    );
  }

  /* ---------- 7. GALLERY LIGHTBOX ---------- */
  const galleryItems = $$(".gallery__item img");
  if (galleryItems.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.innerHTML = '<img alt="" />';
    document.body.appendChild(lightbox);
    const lightboxImg = $("img", lightbox);

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.classList.add("is-open");
      body.classList.add("is-locked");
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      body.classList.remove("is-locked");
    }
    galleryItems.forEach((img) => {
      img.parentElement.addEventListener("click", () => openLightbox(img.src, img.alt));
    });
    lightbox.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---------- 8. MUSIC ---------- */
  function playMusic() {
    if (!bgm) return;
    bgm.volume = 0.45;
    bgm.load();
    const promise = bgm.play();
    if (promise && typeof promise.then === "function") {
      promise.then(() => {
        musicBtn.classList.add("is-playing");
        musicBtn.setAttribute("aria-pressed", "true");
      }).catch((err) => {
        console.warn("Music autoplay blocked:", err);
        musicBtn.classList.remove("is-playing");
        musicBtn.setAttribute("aria-pressed", "false");
      });
    }
  }

  function toggleMusic() {
    if (!bgm) return;
    if (bgm.paused) playMusic();
    else {
      bgm.pause();
      musicBtn.classList.remove("is-playing");
      musicBtn.setAttribute("aria-pressed", "false");
    }
  }

  if (musicBtn && bgm) musicBtn.addEventListener("click", toggleMusic);

})();