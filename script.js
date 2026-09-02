const intro = document.querySelector("#intro");
const openButton = document.querySelector("#openInvitation");
const bookApp = document.querySelector("#bookApp");
const book = document.querySelector("#book");
const sheets = [...document.querySelectorAll(".sheet")];
const previousButton = document.querySelector("#prevPage");
const nextButton = document.querySelector("#nextPage");
const currentPageLabel = document.querySelector("#currentPage");
const totalPagesLabel = document.querySelector("#totalPages");
const pageTitle = document.querySelector("#pageTitle");
const gestureTip = document.querySelector("#gestureTip");
const musicControl = document.querySelector("#musicControl");
const music = document.querySelector("#backgroundMusic");
const musicDialog = document.querySelector("#musicDialog");
const toast = document.querySelector("#demoToast");
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightboxImg");
const lightboxClose = document.querySelector("#lightboxClose");

let currentPage = 0;
let invitationOpened = false;
let pageIsTurning = false;
let pointerStart = null;
let toastTimer;
let musicAvailable = false;
let soundContext;

totalPagesLabel.textContent = String(sheets.length);

const arrangeSheets = () => {
  sheets.forEach((sheet, index) => {
    const isCurrent = index === currentPage;
    const isPast = index < currentPage;

    sheet.classList.toggle("is-turned", isPast);
    sheet.classList.toggle("is-active", isCurrent);
    sheet.style.zIndex = isPast ? String(index + 1) : String(sheets.length - index + 10);
    sheet.setAttribute("aria-hidden", String(!isCurrent));

    sheet.querySelectorAll("button, a, input, select, textarea").forEach((control) => {
      control.tabIndex = isCurrent ? 0 : -1;
    });
  });

  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === sheets.length - 1;
  currentPageLabel.textContent = String(currentPage + 1);
  pageTitle.textContent = sheets[currentPage].dataset.title;
};

const playPageSound = () => {
  try {
    soundContext ||= new AudioContext();
    const duration = 0.16;
    const buffer = soundContext.createBuffer(1, soundContext.sampleRate * duration, soundContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      const fade = 1 - index / data.length;
      data[index] = (Math.random() * 2 - 1) * fade * 0.16;
    }

    const source = soundContext.createBufferSource();
    const filter = soundContext.createBiquadFilter();
    const gain = soundContext.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 950;
    filter.Q.value = 0.7;
    gain.gain.value = 0.055;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(soundContext.destination);
    source.start();
  } catch {
    // O efeito sonoro é apenas decorativo; a navegação continua normalmente.
  }
};

const finishTurn = (sheet) => {
  window.setTimeout(() => {
    sheet.classList.remove("is-turning", "is-turning-back");
    arrangeSheets();
    pageIsTurning = false;
  }, 850);
};

const nextPage = () => {
  if (pageIsTurning || currentPage >= sheets.length - 1) return;
  pageIsTurning = true;
  gestureTip.classList.add("is-hidden");
  playPageSound();

  const outgoingSheet = sheets[currentPage];
  outgoingSheet.style.zIndex = "100";
  outgoingSheet.classList.add("is-turning", "is-turned");
  currentPage += 1;
  finishTurn(outgoingSheet);
};

const previousPage = () => {
  if (pageIsTurning || currentPage <= 0) return;
  pageIsTurning = true;
  playPageSound();

  const incomingSheet = sheets[currentPage - 1];
  incomingSheet.style.zIndex = "100";
  incomingSheet.classList.add("is-turning-back");
  incomingSheet.classList.remove("is-turned");
  currentPage -= 1;
  finishTurn(incomingSheet);
};

previousButton.addEventListener("click", previousPage);
nextButton.addEventListener("click", nextPage);

book.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button, a, iframe, dialog, .lightbox-trigger")) return;
  pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
});

book.addEventListener("pointerup", (event) => {
  if (!pointerStart || event.target.closest("button, a, iframe, dialog, .lightbox-trigger")) {
    pointerStart = null;
    return;
  }

  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  const elapsed = performance.now() - pointerStart.time;
  pointerStart = null;

  if (Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15 && elapsed < 900) {
    deltaX < 0 ? nextPage() : previousPage();
  }
});

document.addEventListener("keydown", (event) => {
  if (!invitationOpened && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openInvitation();
    return;
  }

  if (event.key === "ArrowRight" || event.key === "PageDown") nextPage();
  if (event.key === "ArrowLeft" || event.key === "PageUp") previousPage();
});

const prepareMusic = () => {
  if (music.src || !music.dataset.track) return;
  music.src = music.dataset.track;
  music.load();
};

const playMusic = async () => {
  prepareMusic();
  try {
    await music.play();
    musicAvailable = true;
    musicControl.setAttribute("aria-pressed", "true");
    musicControl.setAttribute("aria-label", "Pausar música");
  } catch {
    musicAvailable = false;
    musicControl.setAttribute("aria-pressed", "false");
    musicControl.setAttribute("aria-label", "Abrir playlist de música");
  }
};

const openInvitation = () => {
  if (invitationOpened) return;
  invitationOpened = true;
  openButton.disabled = true;
  intro.classList.add("is-opening");
  playMusic();

  window.setTimeout(() => {
    bookApp.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-locked");
    musicControl.classList.add("is-visible");
    arrangeSheets();
  }, 2150);

  window.setTimeout(() => intro.classList.add("is-finished"), 2500);
};

openButton.addEventListener("click", openInvitation);
music.addEventListener("canplay", () => { musicAvailable = true; });
music.addEventListener("error", () => { musicAvailable = false; });

musicControl.addEventListener("click", async () => {
  if (!musicAvailable && !music.duration) {
    const spotifyPlayer = musicDialog.querySelector("iframe");
    if (!spotifyPlayer.src) spotifyPlayer.src = spotifyPlayer.dataset.src;
    musicDialog.showModal();
    return;
  }

  if (music.paused) {
    await playMusic();
  } else {
    music.pause();
    musicControl.setAttribute("aria-pressed", "false");
    musicControl.setAttribute("aria-label", "Ativar música");
  }
});

const weddingDate = new Date("2027-04-21T16:30:00-03:00");

const updateCountdown = () => {
  const difference = Math.max(0, weddingDate.getTime() - Date.now());
  const values = {
    countDays: Math.floor(difference / 86_400_000),
    countHours: Math.floor((difference / 3_600_000) % 24),
    countMinutes: Math.floor((difference / 60_000) % 60),
    countSeconds: Math.floor((difference / 1_000) % 60),
  };

  Object.entries(values).forEach(([id, value]) => {
    document.querySelector(`#${id}`).textContent = String(value).padStart(id === "countDays" ? 3 : 2, "0");
  });
};

updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelectorAll("[data-dialog]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.dialog}`)?.showModal());
});

document.querySelectorAll(".info-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
});

const demoMessages = {
  calendar: ["Calendário demonstrativo", "O evento será conectado ao calendário definitivo depois."],
  map: ["Endereço da cerimônia", "Aqui entra o endereço e o link do mapa que vocês nos enviarem."],
  rsvp: ["Confirmação de presença", "Aqui entra o link de WhatsApp ou formulário que vocês escolherem."],
  gifts: ["Lista de presentes", "Aqui entra o link da lista que vocês montarem."],
};

const showToast = (title, message) => {
  window.clearTimeout(toastTimer);
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3500);
};

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    const [title, message] = demoMessages[button.dataset.demo];
    showToast(title, message);
  });
});

let lightboxCloseTimer;

const openLightbox = (img) => {
  window.clearTimeout(lightboxCloseTimer);
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = img.alt || "";
  lightbox.classList.remove("is-visible");
  lightbox.classList.add("is-open");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => lightbox.classList.add("is-visible"));
  });
};

const closeLightbox = () => {
  lightbox.classList.remove("is-visible");
  window.clearTimeout(lightboxCloseTimer);
  lightboxCloseTimer = window.setTimeout(() => lightbox.classList.remove("is-open"), 320);
};

document.querySelectorAll(".lightbox-trigger").forEach((img) => {
  img.setAttribute("role", "button");
  img.setAttribute("tabindex", "0");
  img.setAttribute("aria-label", "Ampliar foto: " + (img.alt || ""));
  img.addEventListener("click", () => openLightbox(img));
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(img);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
});

arrangeSheets();
