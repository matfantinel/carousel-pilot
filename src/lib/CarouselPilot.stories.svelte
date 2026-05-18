<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CarouselPilot from './CarouselPilot.svelte';

	if (typeof window !== 'undefined' && !customElements.get('carousel-pilot')) {
		customElements.define(
			'carousel-pilot',
			/** @type {CustomElementConstructor} */ (/** @type {unknown} */ (CarouselPilot))
		);
	}

	const { Story } = defineMeta({
		title: 'Example/CarouselPilot',
		component: CarouselPilot,
		tags: ['autodocs'],
		argTypes: {
			centered: { control: 'boolean' },
			scrollAmount: { control: 'select', options: ['page', 'slide'] },
			addSpacers: { control: 'boolean' },
			showScrollShadow: { control: 'boolean' },
			hideScrollbar: { control: 'boolean' }
		},
		args: {
			centered: false,
			scrollAmount: 'slide',
			addSpacers: true,
			showScrollShadow: true,
			hideScrollbar: true
		},
		render: template
	});
</script>

{#snippet template(
	/** @type {{ centered: boolean; scrollAmount: string; addSpacers: boolean; showScrollShadow: boolean; hideScrollbar: boolean; children?: import('svelte').Snippet }} */ args
)}
	<carousel-pilot
		centered={args.centered}
		scrollAmount={args.scrollAmount}
		addSpacers={args.addSpacers}
		showScrollShadow={args.showScrollShadow}
		hideScrollbar={args.hideScrollbar}
	>
		{@render args.children?.()}
	</carousel-pilot>
{/snippet}

{#snippet slides(count = 6, centered = false)}
	<ul data-carousel-track>
		<!-- eslint-disable no-unused-vars -->
		{#each Array(count) as _, i (i)}
			<li><img src="https://placedog.net/600/400?id={i + 1}" alt="Dog {i + 1}" /></li>
		{/each}
	</ul>

	<style>
		ul {
			list-style: none;
			display: flex;
			gap: 20px;
			scroll-snap-type: x mandatory;
			max-width: 100vw;
			overflow: auto;
			margin: 0;
			padding: 0;
		}

		li {
			flex: 0 0 600px;
			scroll-snap-align: start;
		}

		img {
			display: block;
			width: 100%;
			height: auto;
		}
	</style>

	{#if centered}
		<style>
			li {
				scroll-snap-align: center;
			}
		</style>
	{/if}
{/snippet}

{#snippet navigation(totalCount = 6)}
	<div class="navigation">
		<button data-carousel-prev>Prev</button>
		<span>Slide <span data-carousel-currentIndex>1</span> of {totalCount}</span>
		<button data-carousel-next>Next</button>
	</div>

	<style>
		.navigation {
			margin-top: 1rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	</style>
{/snippet}

{#snippet navigationWithIndicators(totalCount = 6)}
	<div class="navigation">
		<button data-carousel-prev>Prev</button>
		<div class="dots">
			<!-- eslint-disable no-unused-vars -->
			{#each Array(totalCount) as _, i (i)}
				<div class="dot" data-carousel-indicator></div>
			{/each}
		</div>
		<button data-carousel-next>Next</button>
	</div>

	<style>
		.navigation {
			margin-top: 1rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
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

		.dot.active {
			background: peachpuff;
		}
	</style>
{/snippet}

{#snippet defaultContent()}
	{@render slides(10)}
	{@render navigation(10)}
{/snippet}

<Story name="Default" args={{ children: defaultContent }} />

{#snippet dotIndicators()}
	{@render slides(10)}
	{@render navigationWithIndicators(10)}
{/snippet}

<Story name="Dot Indicators" args={{ children: dotIndicators }} />

{#snippet centeredContent()}
	{@render slides(10, true)}
	{@render navigation(10)}
{/snippet}
<Story name="Centered" args={{ children: centeredContent, centered: true }} />
