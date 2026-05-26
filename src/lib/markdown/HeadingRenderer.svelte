<script>
	import MarkdownRenderer from './MarkdownRenderer.svelte';
	import GithubSlugger from 'github-slugger'

	let { text, depth, raw } = $props();

	const slugger = new GithubSlugger();

	const headingLevel = $derived(depth ?? raw.match(/#/g)?.length);
	const element = $derived(`h${headingLevel}`);
	const slug = $derived(slugger.slug(text));

</script>

<svelte:element this={element} id={slug}>
	<MarkdownRenderer content={text} isInline />
</svelte:element>
