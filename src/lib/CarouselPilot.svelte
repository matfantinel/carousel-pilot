<svelte:options customElement={{ tag: 'carousel-pilot', shadow: 'open' }} />

<script>
	import { SCROLL_SHADOW_CSS, HIDE_SCROLLBAR_CSS } from './css-utils.js';
	import { queryElement, queryElements } from './helpers.js';

	let {
		track: trackSelector = '',
		centered = false,
		scrollAmount = 'slide',
		addSpacers = true,
		showScrollShadow = false,
		hideScrollbar = false,
		prev: prevSelector = '',
		next: nextSelector = '',
		indicators: indicatorsSelector = '',
		current: currentSelector = ''
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
		if (!track) return;

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
		if (!host) return;

		track = queryElement(host, trackSelector, '[data-carousel-track]');
		if (!track) return;

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
			prevButton.disabled = activeIndex === 0;
		}

		if (nextButton instanceof HTMLButtonElement) {
			nextButton.disabled = activeIndex === slides.length - 1;
		}
	}

	// #endregion Active Slide logic

	// #region Slider navigation

	function getScrollDistance() {
		if (!track) return 0;
		if (scrollAmount === 'page' || !slides[activeIndex]) {
			return track.clientWidth;
		}
		return slides[activeIndex].getBoundingClientRect().width;
	}

	function scrollPrev() {
		if (!track) return;
		track.scrollBy({ left: -getScrollDistance(), behavior: 'smooth' });
	}

	function scrollNext() {
		if (!track) return;
		track.scrollBy({ left: getScrollDistance(), behavior: 'smooth' });
	}

	// #endregion Slider navigation

	// #region Lifecycle

	$effect(() => {
		wireDom();
		centered; // recreate observer when mode changes
		setupObserver();
		recomputeActiveSlide();

		return () => {
			prevButton?.removeEventListener('click', scrollPrev);
			nextButton?.removeEventListener('click', scrollNext);
			cleanupObserver?.();
			removeSpacers();
			scrollShadowStyle?.remove();
			scrollShadowStyle = null;
			hideScrollbarStyle?.remove();
			hideScrollbarStyle = null;
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
	
	// #endregion Lifecycle

</script>

<div bind:this={wrapper} style="display: contents;">
	<slot />
</div>
