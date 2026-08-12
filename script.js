const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const music = $('#bgMusic');
const musicButton = $('#musicButton');
const musicLabel = $('#musicLabel');
const toast = $('#toast');

/*
  EMAIL SETUP:
  Replace YOUR_EMAIL_HERE with the email address where you want every answer.
  FormSubmit will ask you to confirm the address the first time.
  Example:
  const ANSWER_ENDPOINT = 'https://formsubmit.co/ajax/you@example.com';
*/
const ANSWER_ENDPOINT = 'https://formsubmit.co/ajax/vipasana3011@gmail.com';

let musicStarted = false;
let current = 0;
let sending = false;
const pages = $$('.story-page');
const total = pages.length;

function show(id) {
  ['cover','interlude','memory','reaction','story','ending'].forEach(name => {
    const el = document.getElementById(name);
    if (el) el.classList.toggle('hidden', name !== id);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => toast.classList.remove('show'), 3500);
}

function updateMusic() {
  const playing = !music.paused;
  musicButton.classList.toggle('playing', playing);
  musicLabel.textContent = playing ? 'Barbaad · playing' : 'sound off';
}

async function startMusic() {
  try {
    await music.play();
    musicStarted = true;
    updateMusic();
    return true;
  } catch (error) {
    updateMusic();
    toastMessage('Music could not start — make sure assets/Barbaad.mp3 is in the repo.');
    return false;
  }
}

music.addEventListener('play', updateMusic);
music.addEventListener('pause', updateMusic);
music?.addEventListener('error', () => { musicLabel.textContent = 'music unavailable'; });

musicButton.addEventListener('click', async () => {
  if (music.paused) await startMusic();
  else music.pause();
});

// Cover: SAME user click starts audio + opens. No fragile second click.
function openCover(e) {
  if (e) e.preventDefault();
  const cover = $('#cover');
  if (!cover) return;
  cover.classList.add('opening');
  // Do not wait for audio. Some browsers keep an audio promise pending when
  // the file is missing; the page must NEVER get stuck because of music.
  startMusic();
  setTimeout(() => show('interlude'), 650);
}
$('#beginButton')?.addEventListener('click', openCover);
$('#sealButton')?.addEventListener('click', openCover);
$('#beginStory')?.addEventListener('click', e => { e.preventDefault(); show('memory'); });

// Polaroid
$('#polaroid')?.addEventListener('click', () => {
  $('#polaroid').classList.add('opened');
  $('#memoryReveal').classList.add('show');
});
$('#memoryContinue')?.addEventListener('click', () => {
  show('reaction');
  setReaction(0);
});

// Instagram-like reaction slider: drag/tap anywhere on the bar.
const reactionTrack = $('#reactionTrack');
const reactionFill = $('#reactionFill');
const reactionKnob = $('#reactionKnob');
const reactionGlow = $('#reactionGlow');
const reactionPercent = $('#reactionPercent');
const reactionEmoji = $('#reactionEmoji');
const reactionMessage = $('#reactionMessage');
const reactionContinue = $('#reactionContinue');
let reactionValue = 0;
let draggingReaction = false;

function emojiForReaction(v) {
  if (v < 20) return '🙂';
  if (v < 40) return '😊';
  if (v < 60) return '🥰';
  if (v < 80) return '😍';
  if (v < 95) return '🤭';
  return '🫠';
}
function messageForReaction(v) {
  if (v < 15) return 'slide the little heart →';
  if (v < 35) return 'okayyy… a tiny smile?';
  if (v < 55) return 'hmm… I’ll take that ♡';
  if (v < 75) return 'okay, now we are talking…';
  if (v < 95) return 'stoppp, you actually liked it 😭';
  return '100%?! I knew it. ♡';
}
function setReaction(value) {
  reactionValue = Math.max(0, Math.min(100, Math.round(value)));
  reactionPercent.textContent = reactionValue + '%';
  reactionFill.style.width = reactionValue + '%';
  reactionKnob.style.left = reactionValue + '%';
  reactionGlow.style.left = reactionValue + '%';
  reactionGlow.style.opacity = reactionValue ? '.9' : '0';
  const emoji = emojiForReaction(reactionValue);
  reactionKnob.textContent = emoji;
  reactionEmoji.textContent = emoji;
  reactionMessage.textContent = messageForReaction(reactionValue);
  reactionContinue.disabled = reactionValue < 1;
  reactionContinue.classList.toggle('ready', reactionValue > 0);
}
function valueFromPointer(clientX) {
  const rect = reactionTrack.getBoundingClientRect();
  return ((clientX - rect.left) / rect.width) * 100;
}
function beginReaction(e) {
  draggingReaction = true;
  reactionKnob.classList.add('dragging');
  reactionTrack.setPointerCapture?.(e.pointerId);
  setReaction(valueFromPointer(e.clientX));
}
reactionTrack?.addEventListener('pointerdown', beginReaction);
reactionTrack?.addEventListener('pointermove', e => {
  if (!draggingReaction) return;
  setReaction(valueFromPointer(e.clientX));
});
function endReaction() {
  draggingReaction = false;
  reactionKnob.classList.remove('dragging');
}
reactionTrack?.addEventListener('pointerup', endReaction);
reactionTrack?.addEventListener('pointercancel', endReaction);

reactionContinue?.addEventListener('click', async () => {
  if (!reactionValue) return;
  const oldText = reactionContinue.querySelector('span').textContent;
  reactionContinue.querySelector('span').textContent = 'SAVING YOUR REACTION…';
  if (!ANSWER_ENDPOINT.includes('YOUR_EMAIL_HERE')) {
    try {
      await fetch(ANSWER_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({
          name: 'Ayush',
          page: 'Memory 00',
          page_title: 'Polaroid Memory Reaction',
          question: 'How much did this little memory make you smile?',
          answer: reactionValue + '%',
          _subject: 'Reaction to the little memory — ' + reactionValue + '%',
          _captcha: 'false'
        })
      });
    } catch (e) { /* The letter should still continue if email service is unavailable. */ }
  }
  reactionContinue.querySelector('span').textContent = oldText;
  show('story');
  activate(0);
});

function activate(index) {
  current = Math.max(0, Math.min(total - 1, index));
  pages.forEach((p,i) => p.classList.toggle('active', i === current));
  $('#pageCurrent').textContent = String(current + 1).padStart(2,'0');
  $('#progress').style.width = `${((current+1)/total)*100}%`;
  $('#prev').disabled = current === 0;
  $('#next').textContent = current === total - 1 ? 'finish →' : 'next →';
  window.scrollTo({top:0, behavior:'smooth'});
}

function currentAnswer() {
  return pages[current].querySelector('.answer-box').value.trim();
}

async function sendAnswer(pageIndex, answer) {
  if (ANSWER_ENDPOINT.includes('YOUR_EMAIL_HERE')) {
    toastMessage('One tiny setup: add your email in script.js → ANSWER_ENDPOINT.');
    return false;
  }
  const page = pages[pageIndex];
  const question = page.querySelector('h3').textContent.trim();
  const pageTitle = page.querySelector('h2').textContent.trim();

  const payload = {
    name: 'Ayush',
    page: `Memory ${String(pageIndex+1).padStart(2,'0')}`,
    page_title: pageTitle,
    question: question,
    answer: answer,
    _subject: `A little answer — Memory ${pageIndex+1}`,
    _captcha: 'false'
  };

  try {
    const response = await fetch(ANSWER_ENDPOINT, {
      method:'POST',
      headers: {'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || data.success === false) throw new Error('submit failed');
    return true;
  } catch (e) {
    toastMessage('This answer could not be sent. Please try again.');
    return false;
  }
}

async function unlockNext() {
  if (sending) return;
  const answer = currentAnswer();
  if (!answer) {
    toastMessage('Give me one honest little answer before you turn the page ♡');
    pages[current].querySelector('.answer-box').focus();
    return;
  }

  sending = true;
  const btn = pages[current].querySelector('.answer-btn');
  btn.textContent = 'saving…';
  const ok = await sendAnswer(current, answer);
  if (!ok) {
    btn.textContent = 'save & continue →';
    sending = false;
    return;
  }

  btn.classList.add('sent');
  btn.textContent = 'saved ✓';
  pages[current].querySelector('.answer-status').textContent = 'I got this one ♡';

  setTimeout(() => {
    if (current < total - 1) activate(current + 1);
    else {
      show('ending');
      $('#successModal').classList.remove('hidden');
    }
    sending = false;
  }, 550);
}

$$('.answer-btn').forEach(btn => btn.addEventListener('click', unlockNext));

$('#prev').addEventListener('click', () => activate(current - 1));
$('#next').addEventListener('click', unlockNext);

$('#closeModal').addEventListener('click', () => $('#successModal').classList.add('hidden'));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $('#successModal').classList.add('hidden');
});

// Small luxury cursor glow on desktop
document.addEventListener('pointermove', e => {
  const glow = document.querySelector('.cursor-glow');
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

activate(0);
updateMusic();


// FINAL VOICE NOTE
// Put your recording at: assets/my-voice.mp3
const voiceNote = $('#voiceNote');
const voicePlay = $('#voicePlay');
const voiceCard = $('#voiceNoteCard');
const voiceProgress = $('#voiceProgress');
const voiceTime = $('#voiceTime');
const voiceHint = $('#voiceHint');

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
}

async function playVoiceNote() {
  if (!voiceNote) return;
  // The voice note takes over. Barbaad pauses here and comes back automatically.
  music.pause();
  voiceNote.currentTime = 0;
  try {
    await voiceNote.play();
    voiceCard.classList.add('playing');
    voiceHint.textContent = 'voice note playing · Barbaad is waiting ♡';
  } catch (e) {
    toastMessage('I cannot find assets/my-voice.mp3 — add your voice note there first.');
  }
}

function toggleVoiceNote() {
  if (voiceNote.paused) {
    playVoiceNote();
  } else {
    voiceNote.pause();
  }
}

if (voicePlay && voiceNote) {
  voicePlay.addEventListener('click', toggleVoiceNote);
  voiceNote.addEventListener('loadedmetadata', () => {
    voiceTime.textContent = '00:00 / ' + formatAudioTime(voiceNote.duration);
  });
  voiceNote.addEventListener('timeupdate', () => {
    const pct = voiceNote.duration ? (voiceNote.currentTime / voiceNote.duration) * 100 : 0;
    voiceProgress.style.width = pct + '%';
    voiceTime.textContent = formatAudioTime(voiceNote.currentTime) + ' / ' + formatAudioTime(voiceNote.duration);
  });
  voiceNote.addEventListener('play', () => {
    music.pause();
    voiceCard.classList.add('playing');
  });
  voiceNote.addEventListener('pause', () => {
    voiceCard.classList.remove('playing');
  });
  voiceNote.addEventListener('ended', async () => {
    voiceCard.classList.remove('playing');
    voiceProgress.style.width = '100%';
    voiceHint.textContent = 'that was the last little thing ♡';
    // Bring Barbaad back softly after the voice note ends.
    try {
      await music.play();
      updateMusic();
      toastMessage('…and Barbaad is back ♡');
    } catch (e) {
      updateMusic();
    }
  });
  voiceNote.addEventListener('error', () => {
    voiceHint.textContent = 'add assets/my-voice.mp3 to hear this little note';
  });
}
