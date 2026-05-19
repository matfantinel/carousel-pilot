<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CarouselPilot from '../CarouselPilot.svelte';
	import Autoplay from './Autoplay.svelte';

	if (typeof window !== 'undefined' && !customElements.get('carousel-pilot')) {
		customElements.define(
			'carousel-pilot',
			/** @type {CustomElementConstructor} */ (/** @type {unknown} */ (CarouselPilot))
		);
	}

	const { Story } = defineMeta({
		title: '2. Autoplay',
		component: Autoplay,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />
