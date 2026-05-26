<script>
	import '../CarouselPilot.svelte';

	// Behavior
	let centered = $state(true);
	let scrollAmount = $state('slide');

	// Autoplay
	let autoplay = $state(false);
	let autoplayDelay = $state(5000);

	// Loop
	let loop = $state(false);

	// Styles
	let addSpacers = $state(true);
	let showScrollShadow = $state(false);
	let hideScrollbar = $state(true);

	let numberOfSlides = $state(10);
</script>

<div class="demo full-width u-content-grid">
	<h2 id="demo">Demo</h2>

	<div class="carousel full-width">
		{#key `${centered}-${loop}-${addSpacers}-${numberOfSlides}-${autoplay}-${autoplayDelay}`}
		<carousel-pilot
			{centered}
			{scrollAmount}
			{autoplay}
			{autoplayDelay}
			{loop}
			{addSpacers}
			{showScrollShadow}
			{hideScrollbar}
		>
			<div class="inner-carousel u-content-grid">
				<div class="track full-width" class:centered data-carousel-track>
					<!-- eslint-disable no-unused-vars -->
					{#each Array(numberOfSlides) as _, i (i)}
						<div class="slide">
							<img src="https://placedog.net/700/394?id={i + 1}" alt="Dog {i + 1}" />
						</div>
					{/each}
				</div>

				<div class="controls smol">
					<button class="button" data-carousel-prev>Prev</button>
					<div class="indicators">
						<div class="dots">
							<!-- eslint-disable no-unused-vars -->
							{#each Array(numberOfSlides) as _, i (i)}
								<div class="dot" data-carousel-indicator></div>
							{/each}
						</div>
						<span>Slide <span data-carousel-currentIndex>1</span> of {numberOfSlides}</span>
					</div>
					<button class="button" data-carousel-next>Next</button>
				</div>
			</div>
		</carousel-pilot>
		{/key}
	</div>
</div>
<div class="prop-panel smol">
	<h3>Props</h3>
	<div class="groups">
		<div class="group">
			<div class="label">Behavior</div>
			<div class="checkbox-control">
				<input id="centered" type="checkbox" bind:checked={centered} />
				<label for="centered">Centered</label>
			</div>
			<div class="input-control">
				<label for="scrollAmount">Scroll Amount</label>
				<select id="scrollAmount" bind:value={scrollAmount}>
					<option value="slide">Slide</option>
					<option value="page">Page</option>
				</select>
			</div>
		</div>
		<div class="group">
			<div class="label">Autoplay</div>
			<div class="checkbox-control">
				<input id="autoplay" type="checkbox" bind:checked={autoplay} />
				<label for="autoplay">Enable</label>
			</div>
			<div class="input-control">
				<label for="autoplayDelay">Delay (ms)</label>
				<input id="autoplayDelay" type="number" bind:value={autoplayDelay} />
			</div>
		</div>

		<div class="group">
			<div class="label">Loop</div>
			<div class="checkbox-control">
				<input id="loop" type="checkbox" bind:checked={loop} />
				<label for="loop">Enable</label>
			</div>
		</div>

		<div class="group">
			<div class="label">Styles</div>
			<div class="checkbox-control">
				<input id="addSpacers" type="checkbox" bind:checked={addSpacers} />
				<label for="addSpacers">Add spacers</label>
			</div>
			<div class="checkbox-control">
				<input id="showScrollShadow" type="checkbox" bind:checked={showScrollShadow} />
				<label for="showScrollShadow">Scroll Shadows</label>
			</div>
			<div class="checkbox-control">
				<input id="hideScrollbar" type="checkbox" bind:checked={hideScrollbar} />
				<label for="hideScrollbar">Hide Scrollbar</label>
			</div>
		</div>
	</div>
</div>

<style>
	.demo {
		row-gap: 32px;
	}

	h2 {
		text-align: center;
	}

	.carousel {
		display: flex;
		flex-direction: column;
		gap: 32px;
		justify-content: center;
	}

	carousel-pilot {
		display: contents;
	}

	.track {
		display: flex;
		gap: clamp(15px, calc((100vw - 320px) / 580 * 30), 32px);
		align-items: center;
		scroll-snap-type: x mandatory;
		max-width: 100vw;
		overflow: auto;
		margin: 0;
		padding: 0;
		overscroll-behavior-x: contain;
	}

	.slide {
		flex: 0 0 min(700px, calc(100% - 64px));
		scroll-snap-align: start;
		border-radius: 20px;
		overflow: hidden;
	}

	.track.centered .slide {
		scroll-snap-align: center;
	}

	.controls {
		display: flex;
		gap: 32px;
		align-items: center;
		justify-content: center;
	}

	.indicators {
		display: flex;
		flex-direction: column;
		gap: 16px;
		align-items: center;
		justify-content: center;
	}

	.dots {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--bg-accent-color);
		border: none;
		appearance: none;
	}

	:global(.dot.active) {
		background: var(--accent-color);
	}

	.prop-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;

		background-color: var(--bg-accent-color);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 16px;
	}

	.groups {
		display: flex;
		align-items: flex-start;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px 32px;
	}

	.group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}

	.label {
		font-size: 1.35rem;
		font-weight: 800;
	}

	.checkbox-control {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.checkbox-control input {
		width: 22px;
		height: 22px;
	}

	.input-control {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.input-control input {
		width: 140px;
	}
</style>
