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

document.querySelectorAll('[data-video]').forEach(button => {
  const chapter = button.closest('details');
  let player;

  button.addEventListener('click', () => {
    if (player) {
      player.remove();
      player = null;
      button.textContent = '▶ Play video here';
      return;
    }
    player = document.createElement('iframe');
    player.title = button.dataset.title;
    player.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}`;
    player.allow = 'encrypted-media; picture-in-picture';
    player.allowFullscreen = true;
    button.parentElement.append(player);
    button.textContent = 'Hide video';
  });

  chapter.addEventListener('toggle', () => {
    if (!chapter.open && player) button.click();
  });
});

const mapCanvas = document.getElementById('map-canvas');
const mapLabel = document.getElementById('map-label');
const mapLink = document.getElementById('map-link');
const mapPlaces = [...document.querySelectorAll('[data-place]')];
let selectedPlace = mapPlaces[0].dataset.place;
let mapFrame;

function updateMap() {
  const query = encodeURIComponent(selectedPlace);
  mapLabel.textContent = selectedPlace;
  mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  if (mapFrame) {
    mapFrame.title = `Map of ${selectedPlace}`;
    mapFrame.src = `https://maps.google.com/maps?q=${query}&z=10&output=embed`;
  }
}

mapPlaces.forEach(button => {
  button.addEventListener('click', () => {
    selectedPlace = button.dataset.place;
    mapPlaces.forEach(place => {
      place.setAttribute('aria-pressed', String(place === button));
    });
    updateMap();
  });
});

document.getElementById('load-map').addEventListener('click', event => {
  mapFrame = document.createElement('iframe');
  mapFrame.referrerPolicy = 'no-referrer-when-downgrade';
  updateMap();
  event.currentTarget.remove();
  mapCanvas.append(mapFrame);
  mapLink.focus();
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
