<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CarouselPilot from '../CarouselPilot.svelte';
	import Basic from './Basic.svelte';

	if (typeof window !== 'undefined' && !customElements.get('carousel-pilot')) {
		customElements.define(
			'carousel-pilot',
			/** @type {CustomElementConstructor} */ (/** @type {unknown} */ (CarouselPilot))
		);
	}

	const { Story } = defineMeta({
		title: 'Examples/Basic',
		component: Basic,
		tags: ['autodocs'],
		argTypes: {
			centered: { control: 'boolean' },
			useDots: { control: 'boolean' },
			addSpacers: { control: 'boolean', description: 'Add spacer that makes the last slide be pushed all the way to the left edge. When centered, adds a spacer that pushes the first slide to the center of the screen.' },
			hideScrollbar: { control: 'boolean', description: 'Injects CSS that hides the scrollbar' },
			showScrollShadow: { control: 'boolean', description: 'Injects CSS that displays a subtle fade to the left right to indicate the slider is scrollable.' },
			scrollAmount: { control: 'radio', options: ['slide', 'page'], description: 'The amount of space to scroll when navigating. "slide" scrolls by the width of one slide, "page" scrolls by the width of the viewport.' }
		},
		args: {
			centered: false,
			useDots: false,
			addSpacers: true,
			hideScrollbar: false,
			showScrollShadow: false,
			scrollAmount: 'slide'
		}
	});
</script>

<Story name="Default" />

<Story name="Dot Indicators" args={{ useDots: true }} />

<Story name="Centered" args={{ centered: true }} />

<Story name="Centered with Dots" args={{ centered: true, useDots: true }} />
