<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CarouselPilot from '../CarouselPilot.svelte';
	import LinkedSliders from './LinkedSliders.svelte';

	if (typeof window !== 'undefined' && !customElements.get('carousel-pilot')) {
		customElements.define(
			'carousel-pilot',
			/** @type {CustomElementConstructor} */ (/** @type {unknown} */ (CarouselPilot))
		);
	}

	const { Story } = defineMeta({
		title: 'Examples/3. LinkedSliders',
		component: LinkedSliders,
		tags: ['autodocs']
	});
</script>

<Story name="Default" />
