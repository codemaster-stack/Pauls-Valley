// // Marketing Slider Script
// let currentSlide = 0;
// let slides = [];
// let autoSlideInterval;

// // Fetch marketing slides from backend
// async function loadMarketingSlides() {
//   try {
//     const response = await fetch('https://valley.pvbonline.online/api/slides/public/active');
//     const data = await response.json();
    
//     if (!response.ok) throw new Error(data.message || 'Failed to load slides');
    
//     slides = data;
    
//     if (slides.length === 0) {
//       displayNoSlides();
//       return;
//     }
    
//     renderSlides();
//     renderDots();
//     startAutoSlide();
    
//   } catch (error) {
//     console.error('Error loading marketing slides:', error);
//     displayError();
//   }
// }

// // Render all slides
// function renderSlides() {
//   const container = document.getElementById('marketing-slides-container');
//   container.innerHTML = '';
  
//   slides.forEach((slide, index) => {
//     const li = document.createElement('li');
//     li.className = slide.slideClass || `mk-slide${(index % 3) + 1}`; // Use slideClass from backend
//     li.style.display = index === 0 ? 'block' : 'none';
    
//     // Apply background image if exists
//     if (slide.backgroundImage) {
//       // Check if it's already a full URL (starts with http)
//       let bgImageUrl = slide.backgroundImage.startsWith('http') 
//         ? slide.backgroundImage 
//         : `https://valley.pvbonline.online${slide.backgroundImage}`;
      
//       li.style.backgroundImage = `url('${bgImageUrl}')`;
//       li.style.backgroundSize = 'cover';
//       li.style.backgroundPosition = 'center';
//     }
    
//     li.innerHTML = `
//       <div class="container">
//         <div class="marketing-text">
//           <h2 class="marketing-title">${slide.title}</h2>
//           <p class="marketing-subtitle">${slide.subtitle || slide.description || ''}</p>
//           ${slide.buttonText && slide.buttonAction ? 
//             `<button class="marketing-btn" onclick="${slide.buttonAction}">${slide.buttonText}</button>` 
//             : ''}
//         </div>
//       </div>
//     `;
    
//     container.appendChild(li);
//   });
// }

// // Render navigation dots
// function renderDots() {
//   const dotsContainer = document.getElementById('slider-dots-container');
//   dotsContainer.innerHTML = '';
  
//   slides.forEach((_, index) => {
//     const dot = document.createElement('button');
//     dot.type = 'button';
//     dot.className = `mm-control-dot ${index === 0 ? 'active' : ''}`;
//     dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
//     dot.onclick = () => goToSlide(index);
    
//     dotsContainer.appendChild(dot);
//   });
// }

// // Navigate to specific slide
// function goToSlide(index) {
//   if (index < 0 || index >= slides.length || slides.length === 0) return;
  
//   const container = document.getElementById('marketing-slides-container');
//   const allSlides = container.querySelectorAll('li');
//   const dots = document.querySelectorAll('.mm-control-dot');
  
//   // Check if slides and dots exist
//   if (allSlides.length === 0 || dots.length === 0) return;
  
//   // Hide current slide
//   if (allSlides[currentSlide]) {
//     allSlides[currentSlide].style.display = 'none';
//   }
//   if (dots[currentSlide]) {
//     dots[currentSlide].classList.remove('active');
//   }
  
//   // Show new slide
//   currentSlide = index;
//   if (allSlides[currentSlide]) {
//     allSlides[currentSlide].style.display = 'block';
//   }
//   if (dots[currentSlide]) {
//     dots[currentSlide].classList.add('active');
//   }
  
//   // Reset auto-slide timer
//   resetAutoSlide();
// }

// // Next slide
// function nextSlide() {
//   const nextIndex = (currentSlide + 1) % slides.length;
//   goToSlide(nextIndex);
// }

// // Previous slide
// function prevSlide() {
//   const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
//   goToSlide(prevIndex);
// }

// // Auto-slide functionality
// function startAutoSlide() {
//   // Only start auto-slide if there are multiple slides
//   if (slides.length > 1) {
//     autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
//   }
// }

// function resetAutoSlide() {
//   clearInterval(autoSlideInterval);
//   startAutoSlide();
// }

// function stopAutoSlide() {
//   clearInterval(autoSlideInterval);
// }

// // Display error state
// function displayError() {
//   const container = document.getElementById('marketing-slides-container');
//   container.innerHTML = `
//     <li class="mk-slide1">
//       <div class="container">
//         <div class="marketing-text">
//           <h2 class="marketing-title">⚠️ Unable to Load Content</h2>
//           <p class="marketing-subtitle">Please refresh the page or try again later.</p>
//         </div>
//       </div>
//     </li>
//   `;
//   document.getElementById('slider-dots-container').innerHTML = '';
// }

// // Display no slides state
// function displayNoSlides() {
//   const container = document.getElementById('marketing-slides-container');
//   container.innerHTML = `
//     <li class="mk-slide2">
//       <div class="container">
//         <div class="marketing-text">
//           <h2 class="marketing-title">Welcome to PVB Bank</h2>
//           <p class="marketing-subtitle">Your trusted financial partner.</p>
//         </div>
//       </div>
//     </li>
//   `;
//   document.getElementById('slider-dots-container').innerHTML = '';
// }

// // Event listeners for navigation buttons
// document.querySelector('.flex-prev').addEventListener('click', prevSlide);
// document.querySelector('.flex-next').addEventListener('click', nextSlide);

// // Pause auto-slide on hover
// const sliderContainer = document.querySelector('.flexslider');
// sliderContainer.addEventListener('mouseenter', stopAutoSlide);
// sliderContainer.addEventListener('mouseleave', startAutoSlide);

// // Keyboard navigation
// document.addEventListener('keydown', (e) => {
//   if (e.key === 'ArrowLeft') prevSlide();
//   if (e.key === 'ArrowRight') nextSlide();
// });

// // Initialize slider on page load
// loadMarketingSlides();


// Marketing Slider Script
let currentSlide = 0;
let slides = [];
let autoSlideInterval;

// Fetch marketing slides from backend
async function loadMarketingSlides() {
  try {
    const response = await fetch('https://valley.pvbonline.online/api/slides/public/active');
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.message || 'Failed to load slides');
    
    slides = data;
    
    if (slides.length === 0) {
      displayNoSlides();
      return;
    }
    
    renderSlides();
    renderDots();
    showSlide(0); // Initialize first slide
    startAutoSlide();
    
  } catch (error) {
    console.error('Error loading marketing slides:', error);
    displayError();
  }
}

// Render all slides
function renderSlides() {
  const container = document.getElementById('marketing-slides-container');
  container.innerHTML = '';
  
  slides.forEach((slide, index) => {
    const li = document.createElement('li');
    
    // Use slideClass from backend or generate default class
    li.className = slide.slideClass || `mk-slide${(index % 3) + 1}`;
    
    // Add a data attribute for easier slide management
    li.setAttribute('data-slide-index', index);
    
    // Initially hide all slides (we'll show the first one with showSlide())
    li.style.display = 'none';
    li.style.opacity = '0';
    li.style.transition = 'opacity 0.5s ease-in-out';
    
    // Apply background image if exists
    if (slide.backgroundImage) {
      let bgImageUrl = slide.backgroundImage.startsWith('http') 
        ? slide.backgroundImage 
        : `https://valley.pvbonline.online${slide.backgroundImage}`;
      
      li.style.backgroundImage = `url('${bgImageUrl}')`;
      li.style.backgroundSize = 'cover';
      li.style.backgroundPosition = 'center';
      li.style.backgroundRepeat = 'no-repeat';
    }
    
    li.innerHTML = `
      <div class="container">
        <div class="marketing-text">
          <h2 class="marketing-title">${slide.title}</h2>
          <p class="marketing-subtitle">${slide.subtitle || slide.description || ''}</p>
          ${slide.buttonText && slide.buttonAction ? 
            `<button class="marketing-btn" onclick="${slide.buttonAction}">${slide.buttonText}</button>` 
            : ''}
        </div>
      </div>
    `;
    
    container.appendChild(li);
  });
}

// Render navigation dots
function renderDots() {
  const dotsContainer = document.getElementById('slider-dots-container');
  dotsContainer.innerHTML = '';
  
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'mm-control-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    dot.onclick = () => goToSlide(index);
    
    dotsContainer.appendChild(dot);
  });
}

// Show specific slide with fade effect
function showSlide(index) {
  if (index < 0 || index >= slides.length || slides.length === 0) return;
  
  const container = document.getElementById('marketing-slides-container');
  const allSlides = container.querySelectorAll('li');
  const dots = document.querySelectorAll('.mm-control-dot');
  
  if (allSlides.length === 0) return;
  
  // Hide all slides and remove active from all dots
  allSlides.forEach((slide, i) => {
    slide.style.display = 'none';
    slide.style.opacity = '0';
  });
  
  dots.forEach(dot => {
    dot.classList.remove('active');
  });
  
  // Show the target slide with fade-in effect
  if (allSlides[index]) {
    allSlides[index].style.display = 'block';
    // Force reflow to ensure the transition works
    void allSlides[index].offsetWidth;
    allSlides[index].style.opacity = '1';
  }
  
  // Activate the corresponding dot
  if (dots[index]) {
    dots[index].classList.add('active');
  }
  
  // Update current slide index
  currentSlide = index;
}

// Navigate to specific slide
function goToSlide(index) {
  if (index < 0 || index >= slides.length) return;
  
  showSlide(index);
  resetAutoSlide();
}

// Next slide
function nextSlide() {
  if (slides.length === 0) return;
  const nextIndex = (currentSlide + 1) % slides.length;
  goToSlide(nextIndex);
}

// Previous slide
function prevSlide() {
  if (slides.length === 0) return;
  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

// Auto-slide functionality
function startAutoSlide() {
  // Clear any existing interval first
  stopAutoSlide();
  
  // Only start auto-slide if there are multiple slides
  if (slides.length > 1) {
    autoSlideInterval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds
  }
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

// Display error state
function displayError() {
  const container = document.getElementById('marketing-slides-container');
  container.innerHTML = `
    <li class="mk-slide1" style="display: block; opacity: 1;">
      <div class="container">
        <div class="marketing-text">
          <h2 class="marketing-title">⚠️ Unable to Load Content</h2>
          <p class="marketing-subtitle">Please refresh the page or try again later.</p>
        </div>
      </div>
    </li>
  `;
  document.getElementById('slider-dots-container').innerHTML = '';
}

// Display no slides state
function displayNoSlides() {
  const container = document.getElementById('marketing-slides-container');
  container.innerHTML = `
    <li class="mk-slide2" style="display: block; opacity: 1;">
      <div class="container">
        <div class="marketing-text">
          <h2 class="marketing-title">Welcome to PVB Bank</h2>
          <p class="marketing-subtitle">Your trusted financial partner.</p>
        </div>
      </div>
    </li>
  `;
  document.getElementById('slider-dots-container').innerHTML = '';
}

// Initialize event listeners when DOM is ready
function initializeSlider() {
  // Event listeners for navigation buttons
  const prevBtn = document.querySelector('.flex-prev');
  const nextBtn = document.querySelector('.flex-next');
  
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  
  // Pause auto-slide on hover
  const sliderContainer = document.querySelector('.flexslider');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  
  // Load slides
  loadMarketingSlides();
}

// Initialize slider on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSlider);
} else {
  initializeSlider();
}