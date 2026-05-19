<script>
	const totalCount = 6;

	let statusText = $state('Autoplay enabled');
	let statusColor = $state('#95caca');

	function handleAutoplayStarted() {
		statusText = 'Autoplay enabled';
		statusColor = '#95caca';
	}

	function handleAutoplayStopped(/** @type {CustomEvent<{ paused: boolean }>} */ event) {
		if (event.detail.paused) {
			statusText = 'Autoplay paused';
			statusColor = '#d9cb8b';
		} else {
			statusText = 'Autoplay stopped';
			statusColor = '#d98b8b';
		}
	}
</script>

<carousel-pilot
	autoplay={true}
	autoplayDelay={2000}
	addSpacers={true}
	hideScrollbar={true}
	onautoplay-started={handleAutoplayStarted}
	onautoplay-stopped={handleAutoplayStopped}
	loop={true}
>
	<ul class="slides" data-carousel-track>
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

<div class="autoplay-status" style="background: {statusColor};">
	{statusText}
</div>

<p>
	This example shows a slider with autoplay enabled. Autoplay advances slides every 2 seconds.
</p>
<p>It pauses on hover and stops permanently if you click prev/next or scroll manually.</p>

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

	.autoplay-status {
		width: 140px;
		padding: 20px;
		text-align: center;
		margin-top: 1rem;
		color: #000;
		font-weight: 500;
	}
</style>
