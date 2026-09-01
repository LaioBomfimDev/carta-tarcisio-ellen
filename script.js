const intro = document.querySelector("#intro");
const openButton = document.querySelector("#openInvitation");
const main = document.querySelector("#convite");
const musicControl = document.querySelector("#musicControl");
const music = document.querySelector("#backgroundMusic");
const musicDialog = document.querySelector("#musicDialog");
const toast = document.querySelector("#demoToast");

let invitationOpened = false;
let musicAvailable = false;
let toastTimer;

const setMainVisibility = (visible) => {
  main.setAttribute("aria-hidden", String(!visible));
};

const prepareMusic = () => {
  if (music.src) return;

  const track = music.dataset.track;
  if (!track) return;

  music.src = track;
  music.load();
};

const playMusic = async () => {
  prepareMusic();

  try {
    await music.play();
    musicAvailable = true;
    musicControl.setAttribute("aria-pressed", "false");
    musicControl.setAttribute("aria-label", "Pausar música");
  } catch {
    musicAvailable = false;
    musicControl.setAttribute("aria-pressed", "true");
    musicControl.setAttribute("aria-label", "Adicionar ou ativar música");
  }
};

const openInvitation = () => {
  if (invitationOpened) return;
  invitationOpened = true;

  intro.classList.add("is-opening");
  openButton.disabled = true;
  playMusic();

  window.setTimeout(() => {
    setMainVisibility(true);
    document.body.classList.remove("is-locked");
    musicControl.classList.add("is-visible");
    document.querySelector(".hero .reveal")?.classList.add("is-visible");
  }, 2450);

  window.setTimeout(() => {
    intro.classList.add("is-finished");
  }, 2850);
};

openButton.addEventListener("click", openInvitation);

music.addEventListener("canplay", () => {
  musicAvailable = true;
});

music.addEventListener("error", () => {
  musicAvailable = false;
  musicControl.setAttribute("aria-pressed", "true");
});

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
    musicControl.setAttribute("aria-pressed", "true");
    musicControl.setAttribute("aria-label", "Ativar música");
  }
});

const weddingDate = new Date("2027-04-21T16:30:00-03:00");

const updateCountdown = () => {
  const difference = Math.max(0, weddingDate.getTime() - Date.now());
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference / 3_600_000) % 24);
  const minutes = Math.floor((difference / 60_000) % 60);
  const seconds = Math.floor((difference / 1_000) % 60);

  document.querySelector("#countDays").textContent = String(days).padStart(3, "0");
  document.querySelector("#countHours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#countMinutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#countSeconds").textContent = String(seconds).padStart(2, "0");
};

updateCountdown();
window.setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -6%" }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll("[data-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.querySelector(`#${button.dataset.dialog}`);
    dialog?.showModal();
  });
});

document.querySelectorAll(".info-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const demoMessages = {
  calendar: ["Calendário demonstrativo", "O evento será conectado ao calendário definitivo depois."],
  map: ["Local fictício", "Substituiremos pelo endereço real da cerimônia."],
  rsvp: ["Confirmação demonstrativa", "Aqui entra o WhatsApp ou formulário de presença."],
  gifts: ["Lista demonstrativa", "Aqui entra o link da lista de presentes escolhida pelo casal."],
};

function showToast(title, message) {
  window.clearTimeout(toastTimer);
  toast.querySelector("strong").textContent = title;
  toast.querySelector("span").textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3800);
}

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    const [title, message] = demoMessages[button.dataset.demo];
    showToast(title, message);
  });
});

document.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && !invitationOpened) {
    event.preventDefault();
    openInvitation();
  }
});
