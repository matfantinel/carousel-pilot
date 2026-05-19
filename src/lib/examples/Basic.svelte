<script>
	let {
		centered = false,
		useDots = false,
		addSpacers = true,
		hideScrollbar = true,
		showScrollShadow = true,
		scrollAmount = 'slide',
		loop = false,
	} = $props();

	const totalCount = 10;
</script>

<carousel-pilot {centered} {addSpacers} {showScrollShadow} {hideScrollbar} {scrollAmount} {loop}>
	<ul class="slides" class:centered data-carousel-track>
		<!-- eslint-disable no-unused-vars -->
		{#each Array(totalCount) as _, i (i)}
			<li><img src="https://placedog.net/600/400?id={i + 1}" alt="Dog {i + 1}" /></li>
		{/each}
	</ul>

	<div class="navigation" class:centered>
		<button data-carousel-prev>Prev</button>
		{#if useDots}
			<div class="dots">
				<!-- eslint-disable no-unused-vars -->
				{#each Array(totalCount) as _, i (i)}
					<div class="dot" data-carousel-indicator></div>
				{/each}
			</div>
		{:else}
			<span>Slide <span data-carousel-currentIndex>1</span> of {totalCount}</span>
		{/if}
		<button data-carousel-next>Next</button>
	</div>
</carousel-pilot>

<style>
	.slides {
		list-style: none;
		display: flex;
		gap: 20px;
		scroll-snap-type: x mandatory;
		max-width: 100vw;
		overflow: auto;
		margin: 0;
		padding: 0;
		overscroll-behavior-x: contain;
	}

	.slides li {
		flex: 0 0 600px;
		scroll-snap-align: start;
	}

	.slides.centered li {
		scroll-snap-align: center;
	}

	img {
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

	.navigation.centered {
		justify-content: center;
	}

	.dots {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #ccc;
		border: none;
		appearance: none;
	}

	:global(.dot.active) {
		background: peachpuff;
	}
</style>
