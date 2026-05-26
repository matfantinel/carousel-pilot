<script lang="ts">
	import { marked } from 'marked';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import HeadingRenderer from './HeadingRenderer.svelte';
	import CodeBlockRenderer from './CodeBlockRenderer.svelte';

	let { 
		content, 
		isInline = false,
	} = $props();

	const options = marked.defaults;

	const renderers = {
		heading: HeadingRenderer,
		code: CodeBlockRenderer,
	};
</script>

<SvelteMarkdown source={content} {renderers} {options} {isInline} />