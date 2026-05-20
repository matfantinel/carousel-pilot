<svelte:options customElement={{ tag: 'carousel-pilot', shadow: 'open' }} />

<script>
	import { SCROLL_SHADOW_CSS, HIDE_SCROLLBAR_CSS } from './css-utils.js';
	import { queryElement, queryElements } from './helpers.js';

	let {
		track: trackSelector = '',
		centered = false,
		loop = false,
		scrollAmount = 'slide',
		addSpacers = true,
		showScrollShadow = false,
		hideScrollbar = false,
		prev: prevSelector = '',
		next: nextSelector = '',
		indicators: indicatorsSelector = '',
		current: currentSelector = '',
		autoplay = false,
		autoplayDelay = 5000,
		headingClasses = 'h1, h2, h3, h4, h5, h6',
		dedupeHeadings = true
	} = $props();

	// #region Global Variables

	/** @type {HTMLDivElement | undefined} */
	let wrapper;
	/** @type {HTMLElement | null} */
	let host = null;
	/** @type {HTMLElement | null} */
	let track = null;
	/** @type {Element[]} */
	let slides = [];
	/** @type {HTMLElement | null} */
	let prevButton = null;
	/** @type {HTMLElement | null} */
	let nextButton = null;
	/** @type {HTMLElement[]} */
	let indicatorElements = [];
	/** @type {HTMLElement | null} */
	let currentIndexElement = null;
	/** @type {HTMLElement[]} */
	let spacerElements = [];
	/** @type {ResizeObserver | null} */
	let resizeObserver = null;
	/** @type {HTMLStyleElement | null} */
	let scrollShadowStyle = null;
	/** @type {HTMLStyleElement | null} */
	let hideScrollbarStyle = null;
	/** @type {number | null} */
	let autoplayTimer = null;
	let autoplayIsRunning = false;
	let autoplayListenersAdded = false;
	let isProgrammaticScroll = false;
	/** @type {number | null} */
	let scrollTimeout = null;

	// #endregion Global Variables

	// #region Events

	/**
	 * @param {number} index
	 * @param {number} total
	 */
	function dispatchSlideChange(index, total) {
		const event = new CustomEvent('slide-change', {
			detail: { index, total },
			bubbles: true,
			composed: true
		});
		host?.dispatchEvent(event);
	}

	// #endregion Events

	// #region State

	/** @type {IntersectionObserverEntry[]} */
	const intersectionEntries = [];
	let activeIndex = $state(0);
	/** @type {(() => void) | null} */
	let cleanupObserver = null;

	// #endregion State

	// #region Spacers (to push first/last slides to center/edges)

	/*
	 * @function removeSpacers
	 * @description Removes any previously injected spacer elements and disconnects the ResizeObserver.
	 * @description Called before recreating spacers or during teardown.
	 */
	function removeSpacers() {
		for (const spacer of spacerElements) {
			spacer.remove();
		}
		spacerElements = [];
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
	}

	/*
	 * @function computeSpacerSizes
	 * @description Computes and applies the correct flex-basis to each spacer element.
	 * @description For centered mode, spacers are fixed at 50vw. For left-aligned mode,
	 * @description the after-spacer size is based on the track width minus the last slide width,
	 * @description so the last slide can snap flush to the left edge.
	 */
	function computeSpacerSizes() {
		if (!track || spacerElements.length === 0) return;

		if (centered) {
			for (const spacer of spacerElements) {
				spacer.style.flex = '0 0 50vw';
			}
		} else {
			const realSlides = Array.from(track.children).filter(
				(/** @type {Element} */ el) => !el.hasAttribute('data-carousel-spacer')
			);
			const lastSlide = realSlides[realSlides.length - 1];
			if (lastSlide instanceof HTMLElement) {
				const width = lastSlide.getBoundingClientRect().width;
				const afterSpacer = spacerElements[spacerElements.length - 1];
				if (afterSpacer) {
					afterSpacer.style.flex = `0 0 calc(100% - ${width}px)`;
				}
			}
		}
	}

	/*
	 * @function updateSpacers
	 * @description Injects hidden spacer divs into the track when `addSpacers` is enabled,
	 * @description then sizes them appropriately. Also sets up a ResizeObserver to
	 * @description keep spacer dimensions in sync when the track or slides change size.
	 */
	function updateSpacers() {
		if (!track || loop) return;

		removeSpacers();
		if (!addSpacers) return;

		const realSlides = Array.from(track.children).filter(
			(/** @type {Element} */ el) => !el.hasAttribute('data-carousel-spacer')
		);

		if (centered) {
			const before = document.createElement('div');
			before.setAttribute('aria-hidden', 'true');
			before.setAttribute('data-carousel-spacer', '');
			track.insertBefore(before, realSlides[0] || null);
			spacerElements.push(before);
		}

		const after = document.createElement('div');
		after.setAttribute('aria-hidden', 'true');
		after.setAttribute('data-carousel-spacer', '');
		track.appendChild(after);
		spacerElements.push(after);

		computeSpacerSizes();

		resizeObserver = new ResizeObserver(() => computeSpacerSizes());
		resizeObserver.observe(track);
	}

	// #endregion Spacers

	// #region Setup

	/*
	 * @function wireDom
	 * @description Looks up the DOM elements for slotted content, assign them to easy-to-use variables
	 * @description and sets up event listeners.
	 */
	function wireDom() {
		const root = wrapper?.getRootNode();
		host = root instanceof ShadowRoot ? /** @type {HTMLElement} */ (root.host) : null;
		if (!host) {
			console.error('CarouselPilot: Could not find host element');
			return;
		}

		track = queryElement(host, trackSelector, '[data-carousel-track]');
		if (!track) {
			console.error('CarouselPilot: Could not find track element. Define it with data-carousel-track attribute or pass a trackSelector prop.');
			return;
		}

		updateSpacers();

		slides = Array.from(track.children).filter(
			(/** @type {Element} */ el) => !el.hasAttribute('data-carousel-spacer')
		);
		if (slides.length === 0) return;

		prevButton = queryElement(host, prevSelector, '[data-carousel-prev]');
		nextButton = queryElement(host, nextSelector, '[data-carousel-next]');
		indicatorElements = queryElements(host, indicatorsSelector, '[data-carousel-indicator]');
		currentIndexElement = queryElement(host, currentSelector, '[data-carousel-currentIndex]');

		prevButton?.addEventListener('click', scrollPrev);
		nextButton?.addEventListener('click', scrollNext);
		exposeMethods();

		// Force scroll to the first slide
		// This is because Safari has a bug where scroll-snap and container queries conflict
		// Resulting in a seemingly random slide being shown on page load.
		// https://devcodef1.com/news/1227800/safari-s-unpredictable-css-snap-behavior
		setTimeout(() => {
			scrollToIndex(0, 'instant');
		}, 10);
	}

	/*
	 * @function exposeMethods
	 * @description Attaches public API methods (scrollToIndex, scrollNext, scrollPrev)
	 * @description to the custom element host so outer code can call them.
	 */
	function exposeMethods() {
		if (!host) return;
		const h = /** @type {any} */ (host);
		h.scrollToIndex = scrollToIndex;
		h.scrollNext = scrollNext;
		h.scrollPrev = scrollPrev;
	}

	function setupObserver() {
		if (!track || slides.length === 0) return;

		let options = {
			root: track,
			threshold: 0,
			rootMargin: '0px 0px 0px 0px'
		};

		if (centered) {
			// Centered will have only a tiny strip in the center that counts as "visible"
			const inset = (track.clientWidth - 2) / 2;
			options = {
				root: track,
				threshold: 0,
				rootMargin: `0px -${inset}px 0px -${inset}px`
			};
		}

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const slideIndex = slides.indexOf(entry.target);
				intersectionEntries[slideIndex] = entry;
			}
			recomputeActiveSlide();
		}, options);

		for (const slide of slides) {
			observer.observe(slide);
		}

		cleanupObserver = () => observer.disconnect();
	}

	// #endregion Setup

	// #region Injected CSS

	/*
	 * @function updateScrollShadow
	 * @description Injects or removes a <style> tag in <head> that targets the track element.
	 */
	function updateScrollShadow() {
		if (!showScrollShadow || !track) {
			scrollShadowStyle?.remove();
			scrollShadowStyle = null;
			return;
		}

		if (!scrollShadowStyle) {
			scrollShadowStyle = document.createElement('style');
			scrollShadowStyle.textContent = SCROLL_SHADOW_CSS;
			document.head.appendChild(scrollShadowStyle);
		}
	}

	/*
	 * @function updateHideScrollbar
	 * @description Injects or removes a <style> tag in <head> that hides the track scrollbar.
	 */
	function updateHideScrollbar() {
		if (!hideScrollbar || !track) {
			hideScrollbarStyle?.remove();
			hideScrollbarStyle = null;
			return;
		}

		if (!hideScrollbarStyle) {
			hideScrollbarStyle = document.createElement('style');
			hideScrollbarStyle.textContent = HIDE_SCROLLBAR_CSS;
			document.head.appendChild(hideScrollbarStyle);
		}
	}

	// #endregion Injected CSS

	// #region Active Slide logic

	/*
	 * @function recomputeActiveSlide
	 * @description Recomputes the active slide based on which slides are currently visible in the viewport.
	 */
	function recomputeActiveSlide() {
		if (!track || slides.length === 0) return;

		if (centered) {
			// Observer root is shrunk to a 2px strip in the track centre,
			// so at most one slide should ever intersect.
			for (let i = 0; i < intersectionEntries.length; i++) {
				const entry = intersectionEntries[i];
				if (entry?.isIntersecting) {
					if (i !== activeIndex) {
						activeIndex = i;
						dispatchSlideChange(i, slides.length);
					}
					updateActiveState();
					return;
				}
			}
			// No slide currently hits the centre strip (e.g. mid-scroll) –
			// keep the previous active index until one does.
			return;
		}

		const visible = [];
		for (let i = 0; i < intersectionEntries.length; i++) {
			const entry = intersectionEntries[i];
			if (entry?.isIntersecting) {
				visible.push({ slide: slides[i], entry });
			}
		}

		if (visible.length === 0) return;

		// Left-aligned: the first visible slide is the active one
		const bestIndex = slides.indexOf(visible[0].slide);

		if (bestIndex !== activeIndex) {
			activeIndex = bestIndex;
			dispatchSlideChange(bestIndex, slides.length);
		}
		updateActiveState();
	}

	/*
	 * @function updateActiveState
	 * @description Updates the indicators and currentIndex element, if they exist
	 */
	function updateActiveState() {
		for (let i = 0; i < indicatorElements.length; i++) {
			indicatorElements[i].classList.toggle('active', i === activeIndex);
		}

		if (currentIndexElement) {
			currentIndexElement.textContent = String(activeIndex + 1);
		}

		if (prevButton instanceof HTMLButtonElement) {
			prevButton.disabled = !loop && activeIndex === 0;
		}

		if (nextButton instanceof HTMLButtonElement) {
			nextButton.disabled = !loop && activeIndex === slides.length - 1;
		}
	}

	// #endregion Active Slide logic

	// #region Slider navigation

	/*
	 * @function scrollToIndex
	 * @description Scrolls the track so the slide at the given index is visible.
	 * @description For left-aligned mode the slide's left edge aligns with the track's left edge.
	 * @description For centered mode the slide is centred in the track.
	 * @param {number} index
	 * @param {ScrollBehavior} [behavior='smooth']
	 */
	function scrollToIndex(/** @type {number} */ index, /** @type {ScrollBehavior} */ behavior = 'smooth') {
		if (!track || !slides[index]) return;
		const slide = slides[index];
		const slideRect = slide.getBoundingClientRect();
		const trackRect = track.getBoundingClientRect();
		const relativeLeft = slideRect.left - trackRect.left + track.scrollLeft;

		isProgrammaticScroll = true;

		if (centered) {
			const slideCenter = relativeLeft + slideRect.width / 2;
			const trackCenter = track.clientWidth / 2;
			track.scrollTo({ left: slideCenter - trackCenter, behavior });
		} else {
			track.scrollTo({ left: relativeLeft, behavior });
		}
	}

	function getScrollDistance() {
		if (!track) return 0;
		if (scrollAmount === 'page' || !slides[activeIndex]) {
			return track.clientWidth;
		}
		return slides[activeIndex].getBoundingClientRect().width;
	}

	/*
	 * @function scrollPrev
	 * @description Scrolls the track backwards by one slide (or page) width.
	 * @description Permanently stops autoplay if it was active.
	 */
	function scrollPrev() {
		stopAutoplay();
		if (!track) return;
		isProgrammaticScroll = true;
		track.scrollBy({ left: -getScrollDistance(), behavior: 'smooth' });
	}

	/*
	 * @function scrollNext
	 * @description Scrolls the track forwards by one slide (or page) width.
	 * @description Permanently stops autoplay if it was active.
	 */
	function scrollNext() {
		stopAutoplay();
		if (!track) return;
		isProgrammaticScroll = true;
		track.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
	}

	// #endregion Slider navigation

	// #region Autoplay

	/*
	 * @function startAutoplay
	 * @description Starts the autoplay interval if enabled and not already running.
	 */
	function startAutoplay() {
		if (!autoplay || autoplayIsRunning || !track) return;
		autoplayIsRunning = true;
		dispatchAutoplayEvent('autoplay-started', { paused: false });
		autoplayTimer = window.setInterval(() => {
			isProgrammaticScroll = true;
			if (!track) return;
			track.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
		}, autoplayDelay);
	}

	/*
	 * @function pauseAutoplay
	 * @description Pauses the autoplay interval. Can be resumed with startAutoplay.
	 */
	function pauseAutoplay() {
		if (!autoplayIsRunning) return;
		if (autoplayTimer !== null) {
			clearInterval(autoplayTimer);
		}
		autoplayTimer = null;
		autoplayIsRunning = false;
		dispatchAutoplayEvent('autoplay-stopped', { paused: true });
	}

	/*
	 * @function stopAutoplay
	 * @description Permanently stops autoplay and disables it.
	 */
	function stopAutoplay() {
		if (autoplayTimer !== null) {
			clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
		if (autoplay) {
			autoplayIsRunning = false;
			dispatchAutoplayEvent('autoplay-stopped', { paused: false });
		}
		autoplay = false;
	}

	/*
	 * @function dispatchAutoplayEvent
	 * @param {string} name
	 * @param {{ paused: boolean }} detail
	 */
	function dispatchAutoplayEvent(/** @type {string} */ name, /** @type {{ paused: boolean }} */ detail) {
		const event = new CustomEvent(name, {
			detail,
			bubbles: true,
			composed: true
		});
		host?.dispatchEvent(event);
	}

	/*
	 * @function handleTrackScroll
	 * @description Scroll listener on the track. Debounced: only evaluates once scrolling has
	 * @description settled. Stops autoplay if the scroll was user-initiated.
	 */
	function handleTrackScroll() {
		if (scrollTimeout !== null) {
			clearTimeout(scrollTimeout);
		}
		scrollTimeout = window.setTimeout(() => {
			if (!isProgrammaticScroll) {
				stopAutoplay();
			}
			isProgrammaticScroll = false;
			scrollTimeout = null;
		}, 150);
	}

	/*
	 * @function setupAutoplay
	 * @description Sets up autoplay listeners (hover, scroll) and starts the interval.
	 */
	function setupAutoplay() {
		if (!autoplay || !host || !track || autoplayListenersAdded) return;
		autoplayListenersAdded = true;
		host.addEventListener('mouseenter', pauseAutoplay);
		host.addEventListener('mouseleave', startAutoplay);
		track.addEventListener('scroll', handleTrackScroll);
		startAutoplay();
	}

	/*
	 * @function cleanupAutoplay
	 * @description Removes autoplay listeners and clears the interval.
	 */
	function cleanupAutoplay() {
		if (autoplayTimer !== null) {
			clearInterval(autoplayTimer);
		}
		autoplayTimer = null;
		autoplayIsRunning = false;
		if (scrollTimeout !== null) {
			clearTimeout(scrollTimeout);
			scrollTimeout = null;
		}
		if (autoplayListenersAdded) {
			autoplayListenersAdded = false;
			host?.removeEventListener('mouseenter', pauseAutoplay);
			host?.removeEventListener('mouseleave', startAutoplay);
			track?.removeEventListener('scroll', handleTrackScroll);
		}
	}

	// #endregion Autoplay

	// #region Infinite Loop

	const CLONE_SCREENS = 3;
	const SCROLL_END_DEBOUNCE_MS = 300;

	/** @type {number | null} */
	let loopScrollEndTimeout = null;
	/** @type {(() => void) | null} */
	let loopScrollListener = null;

	/*
	 * @function degradeHeadings
	 * @description Replaces every heading element inside a clone with a <div> that carries the
	 * @description same innerHTML and className. If the headingClasses prop is set, an extra
	 * @description level-specific class is appended (index 0 → h1, index 1 → h2, …).
	 * @description This prevents duplicate heading tags from polluting the document outline.
	 * @param {HTMLElement} clone
	 */
	function degradeHeadings(/** @type {HTMLElement} */ clone) {
		const headings = clone.querySelectorAll('h1, h2, h3, h4, h5, h6');
		const levelClasses = headingClasses ? headingClasses.split(',').map((c) => c.trim()) : [];
		for (const heading of headings) {
			const div = document.createElement('div');
			div.innerHTML = heading.innerHTML;
			div.className = heading.className;
			const level = parseInt(heading.tagName[1], 10) - 1;
			if (levelClasses[level]) {
				div.className += (div.className ? ' ' : '') + levelClasses[level];
			}
			heading.replaceWith(div);
		}
	}

	/*
	 * @function injectClones
	 * @description Creates CLONE_SCREENS copies of the slide set on each side of the real slides.
	 * @description Each clone carries data-carousel-clone-index so teleportToRealIfNeeded can
	 * @description identify its real counterpart. Clones are purely visual — the IntersectionObserver
	 * @description ignores them.
	 */
	function injectClones() {
		if (!track || slides.length === 0) return;

		const clonesPerSide = CLONE_SCREENS * slides.length;
		const firstRealSlide = /** @type {HTMLElement} */ (slides[0]);

		for (let i = 0; i < clonesPerSide; i++) {
			const clone = slides[i % slides.length].cloneNode(true);
			if (clone instanceof HTMLElement) {
				if (dedupeHeadings) degradeHeadings(clone);
				clone.setAttribute('data-carousel-clone', '');
				clone.setAttribute('data-carousel-clone-index', String(i % slides.length));
				clone.setAttribute('aria-hidden', 'true');
				clone.removeAttribute('id');
			}
			track.insertBefore(clone, firstRealSlide);
		}

		for (let i = 0; i < clonesPerSide; i++) {
			const clone = slides[i % slides.length].cloneNode(true);
			if (clone instanceof HTMLElement) {
				if (dedupeHeadings) degradeHeadings(clone);
				clone.setAttribute('data-carousel-clone', '');
				clone.setAttribute('data-carousel-clone-index', String(i % slides.length));
				clone.setAttribute('aria-hidden', 'true');
				clone.removeAttribute('id');
			}
			track.appendChild(clone);
		}
	}

	/*
	 * @function removeClones
	 * @description Removes all injected clone elements.
	 */
	function removeClones() {
		if (!track) return;
		const clones = Array.from(track.querySelectorAll('[data-carousel-clone]'));
		for (const clone of clones) clone.remove();
	}

	/*
	 * @function findVisibleClone
	 * @description Returns the clone currently visible in the track viewport.
	 * @description For centered mode, finds the clone whose rect straddles the track center.
	 * @description For left-aligned mode, finds the leftmost clone intersecting the track.
	 * @returns {HTMLElement | null}
	 */
	function findVisibleClone() {
		if (!track) return null;
		const trackRect = track.getBoundingClientRect();
		const clones = /** @type {NodeListOf<HTMLElement>} */ (
			track.querySelectorAll('[data-carousel-clone]')
		);

		if (centered) {
			const center = trackRect.left + trackRect.width / 2;
			for (const clone of clones) {
				const rect = clone.getBoundingClientRect();
				if (rect.left <= center && rect.right > center) return clone;
			}
		} else {
			for (const clone of clones) {
				const rect = clone.getBoundingClientRect();
				if (rect.right > trackRect.left && rect.left < trackRect.right) return clone;
			}
		}
		return null;
	}

	/*
	 * @function teleportToRealIfNeeded
	 * @description Called after scrolling settles. If no real slide is currently intersecting
	 * @description (we are in clone territory), finds the visible clone and teleports scrollLeft
	 * @description by the position delta between that clone and its real slide counterpart.
	 */
	function teleportToRealIfNeeded() {
		if (!track) return;

		const anyRealVisible = intersectionEntries.some((e) => e?.isIntersecting);
		if (anyRealVisible) return;

		const visibleClone = findVisibleClone();
		if (!visibleClone) return;

		const cloneIndex = parseInt(visibleClone.getAttribute('data-carousel-clone-index') ?? '0');
		const realSlide = slides[cloneIndex];
		if (!realSlide) return;

		const cloneLeft = visibleClone.getBoundingClientRect().left;
		const realLeft = realSlide.getBoundingClientRect().left;
		isProgrammaticScroll = true;
		track.scrollLeft -= cloneLeft - realLeft;
	}

	/*
	 * @function handleLoopScroll
	 * @description Scroll listener for the infinite loop. Debounces teleportToRealIfNeeded so
	 * @description the teleport only fires once scrolling and CSS snap animation have settled.
	 */
	function handleLoopScroll() {
		if (loopScrollEndTimeout !== null) clearTimeout(loopScrollEndTimeout);
		loopScrollEndTimeout = window.setTimeout(teleportToRealIfNeeded, SCROLL_END_DEBOUNCE_MS);
	}

	/*
	 * @function setupLoop
	 * @description Injects clones, scrolls to the first real slide, and wires the loop scroll listener.
	 */
	function setupLoop() {
		if (!loop || !track || slides.length === 0) return;
		cleanupLoop();
		injectClones();
		scrollToIndex(0, 'instant');
		loopScrollListener = handleLoopScroll;
		track.addEventListener('scroll', loopScrollListener);
	}

	/*
	 * @function cleanupLoop
	 * @description Removes clones and unwires the loop scroll listener.
	 */
	function cleanupLoop() {
		if (loopScrollListener && track) {
			track.removeEventListener('scroll', loopScrollListener);
			loopScrollListener = null;
		}
		if (loopScrollEndTimeout !== null) {
			clearTimeout(loopScrollEndTimeout);
			loopScrollEndTimeout = null;
		}
		removeClones();
	}

	// #endregion Infinite Loop

	// #region Lifecycle

	$effect(() => {
		wireDom();
		centered; // recreate observer when mode changes
		loop; // reinit when loop mode changes
		setupObserver();
		recomputeActiveSlide();
		setupLoop();

		return () => {
			prevButton?.removeEventListener('click', scrollPrev);
			nextButton?.removeEventListener('click', scrollNext);
			cleanupObserver?.();
			removeSpacers();
			cleanupLoop();
			cleanupAutoplay();
			scrollShadowStyle?.remove();
			scrollShadowStyle = null;
			hideScrollbarStyle?.remove();
			hideScrollbarStyle = null;
			if (host) {
				const h = /** @type {any} */ (host);
				delete h.scrollToIndex;
				delete h.scrollNext;
				delete h.scrollPrev;
			}
		};
	});

	$effect(() => {
		addSpacers; // dependency
		updateSpacers();
	});

	$effect(() => {
		showScrollShadow; // dependency
		updateScrollShadow();
	});

	$effect(() => {
		hideScrollbar; // dependency
		updateHideScrollbar();
	});

	$effect(() => {
		autoplay;
		autoplayDelay;
		if (autoplay) {
			setupAutoplay();
		} else {
			cleanupAutoplay();
		}
	});

	// #endregion Lifecycle

</script>

<div bind:this={wrapper} style="display: contents;">
	<slot />
</div>
