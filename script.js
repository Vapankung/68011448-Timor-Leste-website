const root = document.documentElement;
root.classList.add('js');

const themeButton = document.getElementById('theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
} catch {
  // The system setting still works when storage is blocked.
}

function isDark() {
  return root.dataset.theme ? root.dataset.theme === 'dark' : systemTheme.matches;
}

function updateThemeButton() {
  themeButton.setAttribute('aria-pressed', String(isDark()));
}

updateThemeButton();
systemTheme.addEventListener('change', updateThemeButton);
themeButton.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  updateThemeButton();
  try {
    localStorage.setItem('theme', root.dataset.theme);
  } catch {
    // The selection remains active for this page.
  }
});

const topics = [...document.querySelectorAll('.topic')];
const filters = [...document.querySelectorAll('[data-filter]')];
const chapterCount = document.getElementById('chapter-count');

function filterTopics(group) {
  filters.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === group));
  });
  topics.forEach(topic => {
    topic.hidden = group !== 'All' && topic.dataset.group !== group;
  });
  const count = topics.filter(topic => !topic.hidden).length;
  chapterCount.textContent = count === 1 ? '1 chapter' : `${count} chapters`;
}

filters.forEach(button => {
  button.addEventListener('click', () => filterTopics(button.dataset.filter));
});

function followChapterLink() {
  const topic = topics.find(item => `#${item.id}` === location.hash);
  if (!topic) return;
  if (topic.hidden) {
    filterTopics('All');
    topic.scrollIntoView();
  }
  topic.querySelector('details').open = true;
}

window.addEventListener('hashchange', followChapterLink);
followChapterLink();

const gallery = document.querySelector('.gallery');
const slides = [...gallery.querySelectorAll('figure')];
const slideCount = gallery.querySelector('.slide-count');
let slideIndex = 0;

function stepGallery(step) {
  slides[slideIndex].hidden = true;
  slideIndex = (slideIndex + step + slides.length) % slides.length;
  slides[slideIndex].hidden = false;
  slideCount.textContent = `${slideIndex + 1} / ${slides.length}`;
}

gallery.querySelectorAll('[data-slide]').forEach(button => {
  button.addEventListener('click', () => stepGallery(Number(button.dataset.slide)));
});

gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    stepGallery(event.key === 'ArrowLeft' ? -1 : 1);
  }
});

const playlist = [...document.querySelectorAll('#playlist a')];
const poster = document.getElementById('film-poster');
const filmTitle = document.getElementById('film-title');
const filmExternal = document.getElementById('film-external');
const playButton = document.getElementById('film-play');
let selectedFilm = playlist[0];
let player;

function selectFilm(film) {
  player?.remove();
  player = null;
  selectedFilm.removeAttribute('aria-current');
  selectedFilm = film;
  film.setAttribute('aria-current', 'true');
  poster.src = film.dataset.poster;
  filmTitle.textContent = film.dataset.title;
  filmExternal.href = film.href;
  playButton.setAttribute('aria-label', `Play ${film.dataset.title}`);
  playButton.hidden = false;
}

document.querySelectorAll('[data-watch]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const film = playlist.find(entry => entry.dataset.watch === link.dataset.watch);
    if (film !== selectedFilm) selectFilm(film);
    if (!playlist.includes(link)) {
      document.getElementById('watch').scrollIntoView();
      (player || playButton).focus({ preventScroll: true });
    }
  });
});

playButton.addEventListener('click', () => {
  player = document.createElement('iframe');
  player.title = `${selectedFilm.dataset.title} video`;
  player.src = `https://www.youtube-nocookie.com/embed/${selectedFilm.dataset.watch}?autoplay=1`;
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.allowFullscreen = true;
  document.getElementById('film-screen').append(player);
  playButton.hidden = true;
  player.focus({ preventScroll: true });
});

const mapCanvas = document.getElementById('map-canvas');
const mapLabel = document.getElementById('map-label');
const mapNote = document.getElementById('map-note');
const mapLink = document.getElementById('map-link');
const mapToggle = document.getElementById('load-map');
const mapPlaces = [...document.querySelectorAll('[data-place]')];
let selectedPlace = mapPlaces[0];
let mapFrame;

function updateMap() {
  const place = selectedPlace.dataset.place;
  const query = encodeURIComponent(place);
  mapLabel.textContent = place;
  mapNote.textContent = selectedPlace.dataset.note;
  mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  if (mapFrame) {
    mapFrame.title = `Map of ${place}`;
    mapFrame.src = `https://maps.google.com/maps?q=${query}&z=11&output=embed`;
  }
}

mapPlaces.forEach(button => {
  button.addEventListener('click', () => {
    if (selectedPlace === button) return;
    selectedPlace.setAttribute('aria-pressed', 'false');
    selectedPlace = button;
    button.setAttribute('aria-pressed', 'true');
    updateMap();
  });
});

mapToggle.addEventListener('click', () => {
  const opening = mapCanvas.hidden;
  mapCanvas.hidden = !opening;
  mapToggle.setAttribute('aria-expanded', String(opening));
  mapToggle.textContent = opening ? 'Hide zoomable map' : 'Open zoomable map';
  if (opening) {
    mapFrame = document.createElement('iframe');
    mapFrame.referrerPolicy = 'no-referrer-when-downgrade';
    updateMap();
    mapCanvas.append(mapFrame);
  } else {
    mapFrame.remove();
    mapFrame = null;
  }
});

const quiz = document.getElementById('quiz-form');
const questions = [...quiz.querySelectorAll('fieldset')];
const result = document.getElementById('quiz-result');

function clearQuizFeedback() {
  questions.forEach(question => {
    question.querySelector('.question-feedback').hidden = true;
  });
  result.textContent = '';
}

quiz.addEventListener('submit', event => {
  event.preventDefault();
  let score = 0;
  questions.forEach(question => {
    const correct = question.querySelector('input:checked').value === question.dataset.answer;
    if (correct) score += 1;
    const feedback = question.querySelector('.question-feedback');
    feedback.textContent = `${correct ? 'Correct.' : 'Incorrect.'} ${question.dataset.explanation}`;
    feedback.hidden = false;
  });
  result.textContent = `You scored ${score} out of ${questions.length}.`;
});

quiz.addEventListener('reset', clearQuizFeedback);
quiz.addEventListener('change', clearQuizFeedback);

const navigation = [...document.querySelectorAll('nav a')];
const destinations = navigation.map(link => document.querySelector(link.hash));

function markCurrentSection() {
  const threshold = document.querySelector('.site-header').offsetHeight + 48;
  const current = destinations.findLastIndex(section => section.getBoundingClientRect().top <= threshold);
  navigation.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

window.addEventListener('scroll', markCurrentSection, { passive: true });
window.addEventListener('resize', markCurrentSection);
markCurrentSection();
