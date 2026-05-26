<script>
	import '../app.css';
	import MarkdownRenderer from '$lib/markdown/MarkdownRenderer.svelte';
	import Hero from '$lib/landing-page/Hero.svelte';
	import Footer from '$lib/landing-page/Footer.svelte';
	import Header from '$lib/landing-page/Header.svelte';
	import Demo from '$lib/landing-page/Demo.svelte';

	let { data } = $props();
</script>

<Header />

<div class="u-content-grid">
	<Hero />

	<div class="u-markdown smol">
		<MarkdownRenderer content={data.intro} />
	</div>
	<Demo />
	<div class="u-markdown smol">
		<MarkdownRenderer content={data.content} />
	</div>

	<Footer />
</div>
