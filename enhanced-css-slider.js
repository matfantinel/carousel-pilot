class EnhancedCssSlider extends HTMLElement {
  static tagName = 'enhanced-css-slider';

  // Register element so it can be used in the DOM
  static register(tagName, registry) {
    if (!registry && 'customElements' in globalThis) {
      registry = globalThis.customElements;
    }

    registry?.define(tagName || this.tagName, this);
  }

  // This is here just for reference
  // This object is not used
  static props = {
    loop: false,
    centered: false,
    slidesToClone: 2,
    autoplay: false,
    autoplayInterval: 5000,
    headingClasses: 'h1, h2, h3, h4, h5, h6',
  };

  static events = {
    slideChanged: 'slideChanged',
    slideStarted: 'slideStarted',
    autoplayStarted: 'autoplayStarted',
    autoplayStopped: 'autoplayStopped',
  }

  static classes = {};

  connectedCallback() {
    /// Make sure we can load web components
    if (this.shadowRoot || !('replaceSync' in CSSStyleSheet.prototype)) {
      return;
    }

    // Create a shadow root
    let shadowroot = this.attachShadow({ mode: 'open' });

    let slot = document.createElement('slot');
    shadowroot.appendChild(slot);

    this.content = this;
    this.content.setAttribute('tabindex', '0');
    this.content.setAttribute('role', 'region');

    this.props = {};

    this.props.centered = this.content.hasAttribute('centered') && this.content.getAttribute('centered') !== 'false';
    this.props.loop = this.content.hasAttribute('loop') && this.content.getAttribute('loop') !== 'false';
    this.props.slidesToClone = parseInt(this.content.getAttribute('slides-to-clone')) || 2;
    this.props.autoplay = this.content.hasAttribute('autoplay') && this.content.getAttribute('autoplay') !== 'false';
    this.props.autoplayInterval = parseInt(this.content.getAttribute('autoplay-interval')) || 5000;
    this.props.headingClasses = this.content.getAttribute('heading-classes') || 'h1, h2, h3, h4, h5, h6';

    // Get previous and next buttons if they exist
    this.prev = this.content.querySelector('[data-slider-slot="prev"]') ?? this.content.querySelector('.prev');
    this.next = this.content.querySelector('[data-slider-slot="next"]') ?? this.content.querySelector('.next');

    // Get current slide indicator if it exists
    this.currentSlideIndicator = this.content.querySelector('[data-slider-slot="current"]') ?? this.content.querySelector('.current');
    this.dotIndicators = this.content.querySelectorAll('[data-slider-slot="dot"]');
    if (!this.dotIndicators?.length) {
      this.dotIndicators = this.content.querySelectorAll('.dot');
    }

    // Try to get what the list of slides is. Look for data-slider-slot=list or ul
    this.list = this.content.querySelector('[data-slider-slot="list"]') ?? this.content.querySelector('ul');
    if (!this.list) {
      console.error('No list of slides found');
      return;
    }
    
    this.slides = this.list?.children;
    this.realSlides = [...this.slides];

    if (!this.slides || !this.children?.length) {
      return;
    }

    this.indexOffset = 0;
    this.autoplayInterval = null;

    this.setupHandlers();

    if (this.props.loop) {
      this.cloneSlides();    
    } else {
      // Force scroll to the first slide
      // This is because Safari has a bug where scroll-snap and container queries conflict
      // Resulting in a seemingly random slide being shown on page load.
      // https://devcodef1.com/news/1227800/safari-s-unpredictable-css-snap-behavior
      setTimeout(() => {
        this.scrollToIndex(0, 'instant');
      }, 10);
    }

    this.checkIfSliderIsNeeded();
  }

  //≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
  // ✅ Utility functions
  //≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

  // Get the active slide by checking which is closest to the left of the parent
  // If centered, check which is closest to the center of the parent
  getActiveSlide(includeDistance = false) {    
    let activeSlide = null;
    let activeSlideDistance = null;

    [...this.slides].forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const parentRect = this.list.getBoundingClientRect();

      let distanceFromReference;

      if (this.props.centered) {
        const slideCenter = slideRect.left + slideRect.width / 2;
        const parentCenter = parentRect.left + parentRect.width / 2;

        distanceFromReference = Math.abs(slideCenter - parentCenter);
      } else {
        // Get margin-left of the first slide and use it as the offset of the parent position
        const firstSlideMarginLeft = parseInt(window.getComputedStyle(this.slides[0]).marginLeft, 0);

        distanceFromReference = (parentRect.left + firstSlideMarginLeft) - slideRect.left;

        if (distanceFromReference < 0) {
          distanceFromReference = distanceFromReference * -1;
        }
      }

      if (activeSlideDistance === null || distanceFromReference < activeSlideDistance) {
        activeSlide = index - this.indexOffset;
        activeSlideDistance = distanceFromReference;
      }
    }); 

    if (includeDistance) {
      return { activeSlide, activeSlideDistance };
    }

    return activeSlide;
  }

  scrollToIndex(index, behavior = 'smooth') {
    index += this.indexOffset;

    const slide = this.slides[index];

    let positionToSlideTo;
    if (this.props.centered) {
      const offsetOfFirstSlide = this.slides[0].offsetLeft - this.slides[0].offsetWidth / 2;
      positionToSlideTo = slide.offsetLeft - slide.offsetWidth / 2 - offsetOfFirstSlide + 10;
    } else {
      const offsetOfFirstSlide = this.slides[0].offsetLeft;
      positionToSlideTo = slide.offsetLeft - offsetOfFirstSlide + 10;
    }

    let nextSlide = index - this.indexOffset;
    if (nextSlide >= 0 && nextSlide < this.realSlides.length) { 
      const prevSlide = this.getActiveSlide();
      this.dispatchEvent(new CustomEvent(EnhancedCssSlider.events.slideStarted, { detail: { prevSlide, nextSlide } }));
    }

    this.isProgrammaticScroll = true;
    this.list.scrollTo({
      left: positionToSlideTo,
      behavior,
    });
  }

  scrollNext(behavior = 'smooth') {
    const activeSlide = this.getActiveSlide();
    if (activeSlide < this.slides.length - 1) {
      this.scrollToIndex(activeSlide + 1, behavior);
    }
  }

  scrollPrev(behavior = 'smooth') {
    const activeSlide = this.getActiveSlide();
    if (activeSlide + this.indexOffset > 0) {
      this.scrollToIndex(activeSlide - 1, behavior);
    }
  }

  cloneSlides() {
    this.indexOffset = this.props.slidesToClone;

    // Clone the last this.indexOffset slides and add them to the beginning of the list
    for (let i = 0; i < this.indexOffset; i++) {
      const lastSlide = this.realSlides[this.realSlides.length - 1 - i];
      const clone = lastSlide.cloneNode(true);
      clone.classList.add('fake');

      // Make sure any heading elements are changed to divs
      // As to not mess with the document outline
      const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const newElement = document.createElement('div');
        newElement.innerHTML = heading.innerHTML;

        // Apply classes from props to the heading element
        let classes = heading.className;
        if (this.props.headingClasses) {
          const headingClasses = this.props.headingClasses.split(',').map(c => c.trim());
          const headingLevel = parseInt(heading.tagName[1], 10) - 1;
          if (headingClasses[headingLevel]) {
            classes += ' ' + headingClasses[headingLevel];
          }
        }

        newElement.className = classes;
        heading.replaceWith(newElement);
      });

      this.list.insertBefore(clone, this.list.firstChild);
    }

    // Now, clone the first this.indexOffset slides and add them to the end
    for (let i = 0; i < this.indexOffset; i++) {
      const firstSlide = this.realSlides[i];
      const clone = firstSlide.cloneNode(true);
      clone.classList.add('fake');

      // Make sure any heading elements are changed to divs
      // As to not mess with the document outline
      const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const newElement = document.createElement('div');
        newElement.innerHTML = heading.innerHTML;
        
        // Apply classes from props to the heading element
        let classes = heading.className;
        if (this.props.headingClasses) {
          const headingClasses = this.props.headingClasses.split(',').map(c => c.trim());
          const headingLevel = parseInt(heading.tagName[1], 10) - 1;
          if (headingClasses[headingLevel]) {
            classes += ' ' + headingClasses[headingLevel];
          }
        }

        newElement.className = classes;
        heading.replaceWith(newElement);
      });
      
      this.list.appendChild(clone);
    }

    this.slides = this.list.children;
    this.realSlides = [...this.slides].filter(slide => !slide.classList.contains('fake'));

    // Set tabindex of all fake slides and their children to -1
    const fakeSlides = [...this.slides].filter(slide => slide.classList.contains('fake'));
    fakeSlides.forEach(slide => {
      slide.setAttribute('tabindex', '-1');
      [...slide.querySelectorAll('*')].forEach(child => child.setAttribute('tabindex', '-1'));
    });

    setTimeout(() => {
      this.scrollToIndex(0, 'instant');
    }, 100);
  }

  // Disable prev/next buttons if the width of the list is enough to fit all children
  checkIfSliderIsNeeded() {    
    if (this.props.centered || this.props.loop) {
      return;
    }

    // Check if list has pseudo elements, and get their widths
    const pseudoBefore = window.getComputedStyle(this.list, ':before');
    const pseudoAfter = window.getComputedStyle(this.list, ':after');

    const beforeWidth = parseInt(pseudoBefore.width, 10) || 0;
    const afterWidth = parseInt(pseudoAfter.width, 10) || 0;

    const scrollWidth = this.list.scrollWidth - beforeWidth - afterWidth;
    const offsetWidth = this.list.offsetWidth;

    // If the scrollWidth is greater than the offsetWidth, we need to show the prev and next buttons
    if (scrollWidth > offsetWidth) {
      this.list.classList.remove('no-scroll');
      const activeSlide = this.getActiveSlide();
      if (this.prev && (activeSlide > 0 || this.props.loop)) {
        this.prev.removeAttribute('disabled');
      }
      if (this.next && (activeSlide < this.slides.length - 1 || this.props.loop)) {
        this.next.removeAttribute('disabled');
      }
    } else {
      this.list.classList.add('no-scroll');
      if (this.prev) {
        this.prev.setAttribute('disabled', 'true');
      }
      if (this.next) {
        this.next.setAttribute('disabled', 'true');
      }
    }
  }

  startAutoplay() {
    if (this.props.autoplay) {
      this.dispatchEvent(new CustomEvent(EnhancedCssSlider.events.autoplayStarted));
      
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = setInterval(() => {
        this.scrollNext();
      }, this.props.autoplayInterval);
    }
  }
  
  pauseAutoplay() {
    clearInterval(this.autoplayInterval);
    if (this.props.autoplay) {
      this.dispatchEvent(new CustomEvent(EnhancedCssSlider.events.autoplayStopped, { detail: { paused: true } }));
    }
  }

  stopAutoplay() {
    clearInterval(this.autoplayInterval);
    if (this.props.autoplay) {
      this.dispatchEvent(new CustomEvent(EnhancedCssSlider.events.autoplayStopped, { detail: { paused: false } }));
      this.props.autoplay = false;
    }
  }

  //≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
  // ✅ Setup Handlers
  //≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

  setupHandlers() {
    if (this.prev) {
      this.prev.addEventListener('click', () => {
        this.stopAutoplay();
        this.scrollPrev();
    });
    }

    if (this.next) {
      this.next.addEventListener('click', () => {
        this.stopAutoplay();
        this.scrollNext();
    });
    }

    // On window resize, run checkIfSliderIsNeeded
    window.addEventListener('resize', () => {
      this.checkIfSliderIsNeeded();
    });

    this.list.addEventListener('scroll', () => {
      const activeSlideRes = this.getActiveSlide(true);
      const { activeSlide, activeSlideDistance } = activeSlideRes;

      if (this.props.loop && activeSlide < 0) {
        if (activeSlideDistance < 10) {
          // If activeSlide is negative, it means we should loop to last real slide
          this.scrollToIndex(this.realSlides.length - 1, 'instant');
        }
      } else if (this.props.loop && activeSlide > this.realSlides.length - 1) {
        if (activeSlideDistance < 10) {
          // If activeSlide is greater than the number of real slides, it means we should loop to the beginning
          this.scrollToIndex(0, 'instant');
        }
      } else {        
        if (this.currentSlideIndicator) {
          this.currentSlideIndicator.textContent = activeSlide + 1;
        }

        if (this.dotIndicators?.length) {
          const dots = this.dotIndicators;
          [...dots].forEach((dot, index) => {
            if (index <= activeSlide) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });
        }
        
        // Debounce the event
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = setTimeout(() => {
          if (!this.isProgrammaticScroll) {
            this.stopAutoplay();
          }
          this.isProgrammaticScroll = false;
          this.dispatchEvent(new CustomEvent(EnhancedCssSlider.events.slideChanged, { detail: { activeSlide } }));          
        }, 200);
      }

      if (!this.props.loop) {
        const hasReachedEnd = !this.props.centered && this.list.scrollLeft + this.list.offsetWidth >= this.list.scrollWidth;

        if (activeSlide === 0) {
          this.prev?.setAttribute('disabled', 'true');
        } else {
          this.prev?.removeAttribute('disabled');
        }
        if (activeSlide === this.slides.length - 1 || hasReachedEnd) {
          this.next?.setAttribute('disabled', 'true');
        } else {
          this.next?.removeAttribute('disabled');
        }
      }
    });


    this.startAutoplay();
    // If mouse enters the slider, pause autoplay
    this.content.addEventListener('mouseenter', () => {
      this.pauseAutoplay();
    });

    // If mouse leaves, resume autoplay
    this.content.addEventListener('mouseleave', () => {
      this.startAutoplay();
    });
  }
}

EnhancedCssSlider.register();
