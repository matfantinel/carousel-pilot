<script>
	const totalCount = 6;

	/** @type {HTMLElement | null} */
	let backgroundCarousel = $state(null);
	/** @type {HTMLElement | null} */
	let controllerCarousel = $state(null);

	function handleSlideChange(/** @type {CustomEvent<{ index: number; total: number }>} */ event) {
		const bg = /** @type {any} */ (backgroundCarousel);
		bg?.scrollToIndex(event.detail.index, 'instant');
	}
</script>

<p>
	A linked slider example where the controller slider controls the background image (also a slider).
</p>
<p>This is done by listening to the <code>slide-change</code> event on the controller slider and calling <code>scrollToIndex</code> on the background slider.</p>

<div class="background-slider">
	<carousel-pilot bind:this={backgroundCarousel} centered addSpacers={false} hideScrollbar={true}>
		<ul class="background-track" data-carousel-track>
			<!-- eslint-disable no-unused-vars -->
			{#each Array(totalCount) as _, i (i)}
				<li><img src="https://placedog.net/600/400?id={i + 1}" alt="Dog {i + 1}" /></li>
			{/each}
		</ul>
	</carousel-pilot>
</div>

<div class="controller-slider">
	<carousel-pilot
		bind:this={controllerCarousel}
		hideScrollbar={true}
		onslide-change={handleSlideChange}
	>
		<ul class="controller-track" data-carousel-track>
			<!-- eslint-disable no-unused-vars -->
			{#each Array(totalCount) as _, i (i)}
				<li><img src="https://placedog.net/600/400?id={i + 1}" alt="Dog {i + 1}" /></li>
			{/each}
		</ul>

		<div class="navigation">
			<button data-carousel-prev>Prev</button>
			<span>Slide <span data-carousel-currentIndex>1</span> of {totalCount}</span>
			<button data-carousel-next>Next</button>
		</div>
	</carousel-pilot>
</div>

<style>
	.background-slider {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		opacity: 0.5;
		overscroll-behavior-x: contain;
	}

	.background-track {
		list-style: none;
		display: flex;
		margin: 0;
		padding: 0;
		gap: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.background-track li {
		width: 100vw;
		height: 100vh;
		flex-shrink: 0;
	}

	.background-track img {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		display: block;
	}

	.controller-slider {
		position: relative;
		z-index: 1;
		padding: 2rem;
	}

	.controller-track {
		list-style: none;
		display: flex;
		gap: 20px;
		scroll-snap-type: x mandatory;
		width: Min(100vw, 600px);
		overflow: auto;
		margin: 0;
		padding: 0;
	}

	.controller-track li {
		width: Min(100vw, 600px);
		scroll-snap-align: start;
		flex-shrink: 0;
	}

	.controller-track img {
		display: block;
		width: 100%;
		height: auto;
	}

	.navigation {
		margin-top: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
