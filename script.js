const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const music = $("#bgMusic");
const musicControl = $("#musicControl");
const musicText = $("#musicText");

function setMusicUI() {
  const playing = !music.paused;
  musicControl.classList.toggle("playing", playing);
  musicText.textContent = playing ? "♫ Barbaad · playing" : "♫ Barbaad · paused";
  musicControl.setAttribute("aria-label", playing ? "Pause music" : "Play music");
}
async function playMusic() {
  try {
    await music.play();
  } catch (_) {
    musicText.textContent = "♫ Music is optional";
  }
  setMusicUI();
}
music.addEventListener("play", setMusicUI);
music.addEventListener("pause", setMusicUI);
musicControl.addEventListener("click", async () => {
  if (music.paused) await playMusic();
  else music.pause();
});

function showOnly(id) {
  ["intro","rule","doors","letterExperience","ending"].forEach(x => {
    const el = document.getElementById(x);
    el.classList.toggle("hidden", x !== id);
  });
  window.scrollTo({top:0, behavior:"smooth"});
}

$("#openBtn").addEventListener("click", async () => {
  await playMusic();
  showOnly("rule");
});
$("#okayBtn").addEventListener("click", () => showOnly("doors"));

let openedDoors = 0;
const doorReveal = $("#doorReveal");
$$(".door").forEach(btn => {
  btn.addEventListener("click", () => {
    doorReveal.textContent = btn.dataset.note;
    doorReveal.classList.add("show");
    if (!btn.dataset.opened) {
      btn.dataset.opened = "true";
      openedDoors++;
    }
    if (openedDoors >= 2) $("#startLetter").classList.remove("hidden");
  });
});
$("#startLetter").addEventListener("click", () => {
  showOnly("letterExperience");
  activatePage(0);
});


const polaroid = $("#polaroid");
const memoryReveal = $("#memoryReveal");
polaroid.addEventListener("click", () => {
  polaroid.classList.add("opened");
  memoryReveal.classList.add("show");
});
$("#keepMemory").addEventListener("click", () => {
  showOnly("letterExperience");
  activatePage(0);
});

const pages = $$(".letter-page");
const total = pages.length;
let current = 0;
$("#totalPages").textContent = String(total).padStart(2,"0");

function activatePage(index) {
  current = Math.max(0, Math.min(total - 1, index));
  pages.forEach((p,i)=>p.classList.toggle("active", i===current));
  $("#currentPage").textContent = String(current+1).padStart(2,"0");
  $("#prevBtn").disabled = current===0;
  $("#nextBtn").textContent = current===total-1 ? "finish →" : "Next →";
  $("#progressBar").style.width = `${((current+1)/total)*100}%`;
  window.scrollTo({top:0, behavior:"smooth"});
}
$("#prevBtn").addEventListener("click", () => activatePage(current-1));
$("#nextBtn").addEventListener("click", () => {
  if (current < total-1) activatePage(current+1);
  else showOnly("ending");
});

const modal = $("#noteModal");
const modalText = $("#modalText");
$$(".secret-trigger").forEach((btn, i) => {
  btn.addEventListener("click", () => {
    const p = pages[i].querySelector("p");
    const words = p.textContent.trim().split(/\s+/);
    const snippet = words.slice(0, Math.min(22, words.length)).join(" ");
    modalText.textContent = i % 3 === 0 ? "♡ " + snippet : snippet;
    modal.classList.remove("hidden");
  });
});
function closeModal(){ modal.classList.add("hidden"); }
$("#closeModal").addEventListener("click", closeModal);
$("#modalContinue").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if(e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });

music.volume = 0.42;
setMusicUI();
