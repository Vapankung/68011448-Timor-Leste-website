// Object to track the current slide for multiple slideshows
let slideIndexes = {
    'slideshow-language': 1,
    'slideshow-entertainment': 1
};

// Initialize both slideshows on page load
document.addEventListener("DOMContentLoaded", function () {
    // showSlides(1, 'slideshow-language');
    showSlides(1, 'slideshow-entertainment');
});

// Next/previous controls
function plusSlides(n, slideshowId) {
    showSlides(slideIndexes[slideshowId] += n, slideshowId);
}

// Thumbnail image controls
function currentSlide(n, slideshowId) {
    showSlides(slideIndexes[slideshowId] = n, slideshowId);
}

function showSlides(n, slideshowId) {
    let i;
    let slideshowContainer = document.getElementById(slideshowId);
    let slides = slideshowContainer.getElementsByClassName("mySlides");
    let dotContainer = document.getElementById("dots-" + slideshowId);
    let dots = dotContainer.getElementsByClassName("dot");

    // Loop back to start or end if out of bounds
    if (n > slides.length) { slideIndexes[slideshowId] = 1 }
    if (n < 1) { slideIndexes[slideshowId] = slides.length }

    // Hide all slides
    for (i = 0; i < slides.length; i++) {
        slides[i].classList.remove("block");
        slides[i].classList.add("hidden");
    }

    // Remove active class from all dots
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // Show current slide and highlight current dot
    slides[slideIndexes[slideshowId] - 1].classList.remove("hidden");
    slides[slideIndexes[slideshowId] - 1].classList.add("block");
    dots[slideIndexes[slideshowId] - 1].className += " active";
}


//Dark

const themeCheckbox = document.getElementById('theme-checkbox');
const htmlElement = document.documentElement;

// Initialize theme from storage
if (localStorage.getItem('theme') === 'dark') {
  htmlElement.classList.add('dark');
  themeCheckbox.checked = true;
}

// Listen for toggle changes
themeCheckbox.addEventListener('change', () => {
  if (themeCheckbox.checked) {
    htmlElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    htmlElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});

// --- Navigation Bar Scrolling Logic ---
const navList = document.getElementById('nav-list');
const navLeft = document.getElementById('nav-left');
const navRight = document.getElementById('nav-right');

if (navLeft && navRight && navList) {
  navLeft.addEventListener('click', () => {
    // Scrolls the nav bar to the left by 250px smoothly
    navList.scrollBy({ left: -250, behavior: 'smooth' });
  });

  navRight.addEventListener('click', () => {
    // Scrolls the nav bar to the right by 250px smoothly
    navList.scrollBy({ left: 250, behavior: 'smooth' });
  });
}