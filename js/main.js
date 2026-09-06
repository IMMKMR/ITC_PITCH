document.addEventListener('DOMContentLoaded', () => {
  
  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return;
      } else {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealOnScroll.observe(el);
  });

  // --- Sticky Scroll Instagram Carousel Logic ---
  const stickyWrapper = document.querySelector('.sticky-wrapper');
  const scrollTrack = document.getElementById('ig-scroll-track');
  const paginationDots = document.querySelectorAll('#ig-pagination button');
  
  if (stickyWrapper && scrollTrack && paginationDots.length) {
    const totalSlides = paginationDots.length;
    
    // Use requestAnimationFrame for smoother performance
    let isTicking = false;
    
    const updateCarousel = () => {
      const wrapperRect = stickyWrapper.getBoundingClientRect();
      const wrapperTop = wrapperRect.top;
      
      const scrollDistance = -wrapperTop;
      const scrollableHeight = stickyWrapper.offsetHeight - window.innerHeight;
      
      let rawProgress = scrollDistance / scrollableHeight;
      rawProgress = Math.min(Math.max(rawProgress, 0), 1);
      
      // Add dead zones: first 10% stays on slide 1, last 10% stays on last slide
      // The actual sliding happens in the middle 80%
      const padStart = 0.10;
      const padEnd = 0.10;
      let scrollProgress;
      if (rawProgress <= padStart) {
        scrollProgress = 0;
      } else if (rawProgress >= 1 - padEnd) {
        scrollProgress = 1;
      } else {
        scrollProgress = (rawProgress - padStart) / (1 - padStart - padEnd);
      }
      
      const maxTranslateX = (totalSlides - 1) * 100;
      const currentTranslateX = scrollProgress * maxTranslateX;
      
      scrollTrack.style.transform = `translateX(-${currentTranslateX}%)`;
      
      // Highlight correct pagination dot based on closest slide
      const activeIndex = Math.round(scrollProgress * (totalSlides - 1));
      paginationDots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      
      isTicking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!isTicking) {
        window.requestAnimationFrame(updateCarousel);
        isTicking = true;
      }
    });
    
    // Initial call to set state
    updateCarousel();
  }

  // --- Pitch Deck Logic Removed (Using Canva Embed) ---

  // --- Story Timeline Logic ---
  const timelines = document.querySelectorAll('[data-story-timeline]');
  if (timelines.length) {
    timelines.forEach(timeline => {
      const entries = [...timeline.querySelectorAll('[data-timeline-entry]')];
      const nav = timeline.querySelector('[data-timeline-nav]');
      const navItems = [...timeline.querySelectorAll('[data-timeline-nav-item]')];
      const currentNumber = timeline.querySelector('[data-timeline-current-number]');
      const currentTitle = timeline.querySelector('[data-timeline-current-title]');

      if (!entries.length || entries.length !== navItems.length) return;

      let activeIndex = -1;
      let frame = null;

      function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

      function isPageBottom() {
        return (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 4);
      }

      function getActiveIndex(rects) {
        const triggerY = window.innerHeight * 0.55; // Slightly lower trigger line
        let index = 0;
        rects.forEach((rect, entryIndex) => {
          if (rect.top <= triggerY) index = entryIndex;
        });
        if (isPageBottom()) index = entries.length - 1;
        return index;
      }

      function getProgress(rects) {
        if (entries.length <= 1) return 1;
        const triggerY = window.innerHeight * 0.55;
        const firstTop = rects[0].top;
        const lastTop = rects[rects.length - 1].top;
        const distance = lastTop - firstTop;
        if (distance <= 0) return 0;
        let progress = (triggerY - firstTop) / distance;
        progress = clamp(progress, 0, 1);
        if (isPageBottom()) progress = 1;
        return progress;
      }

      function setActive(index) {
        if (index === activeIndex) return;
        activeIndex = index;

        entries.forEach((entry, entryIndex) => {
          entry.classList.remove('is-active', 'is-past', 'is-future');
          if (entryIndex < index) entry.classList.add('is-past');
          else if (entryIndex === index) entry.classList.add('is-active');
          else entry.classList.add('is-future');
        });

        navItems.forEach((item, itemIndex) => {
          item.classList.remove('is-active', 'is-past', 'is-future');
          if (itemIndex < index) item.classList.add('is-past');
          else if (itemIndex === index) item.classList.add('is-active');
          else item.classList.add('is-future');
        });

        if (currentNumber) currentNumber.textContent = String(index + 1).padStart(2, '0');
        if (currentTitle) currentTitle.textContent = entries[index].dataset.title || '';
      }

      function update() {
        frame = null;
        const rects = entries.map(entry => entry.getBoundingClientRect());
        const index = getActiveIndex(rects);
        const progress = getProgress(rects);
        setActive(index);
        nav.style.setProperty('--progress', progress.toFixed(4));
      }

      function requestUpdate() {
        if (frame !== null) return;
        frame = requestAnimationFrame(update);
      }

      navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          entries[index].scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
          });
        });
      });

      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate, { passive: true });
      window.addEventListener('load', requestUpdate);
      requestUpdate();
    });
  }

  // --- Lightbox (Click-to-Expand) ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('img.expandable').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  // --- YOUTUBE FACADE LOGIC (Fix Local Error 153 & Play One at a Time) ---
  const facades = document.querySelectorAll('.yt-facade');
  
  function resetAllFacades() {
    facades.forEach(facade => {
      // Remove any iframe inside
      const iframe = facade.querySelector('iframe');
      if (iframe) {
        iframe.remove();
      }
      // Show thumbnail & button again
      const img = facade.querySelector('img');
      const btn = facade.querySelector('.yt-play-btn');
      if (img) img.style.display = 'block';
      if (btn) btn.style.display = 'block';
    });
  }

  facades.forEach(facade => {
    facade.addEventListener('click', function() {
      // 1. Reset all other facades to stop their playback
      resetAllFacades();

      // Pause background music if it is playing
      const bgAudio = document.getElementById('bg-music');
      if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
      }

      // 2. Hide thumbnail & button for this one
      const img = this.querySelector('img');
      const btn = this.querySelector('.yt-play-btn');
      const vid = this.getAttribute('data-vid');
      const title = this.getAttribute('data-title');
      
      if (img) img.style.display = 'none';
      if (btn) btn.style.display = 'none';

      // 3. Inject Iframe with autoplay=1
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${vid}?autoplay=1`);
      iframe.setAttribute('title', title);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.zIndex = '5';
      
      this.appendChild(iframe);
    });
  });

});
