<script>
	import Prism from 'prismjs';
	import 'prismjs/components/prism-json';
	import 'prismjs/components/prism-bash';
	import 'prismjs/components/prism-css';
	import 'prismjs/components/prism-typescript';
	import 'prismjs/components/prism-git';
	import 'prismjs/components/prism-javascript';
	import 'prismjs/components/prism-jsx';
	import 'prismjs/components/prism-markdown';
	import 'prismjs/components/prism-powershell';
	import 'prismjs/components/prism-scss';
	import 'prism-svelte';
	Prism.manual = true;
	const prism = Prism;

	let {
		filename,
		lang,
		code,
		class: className,
		children
	} = $props();
</script>

<div class={['m-code-block', className]}>
	{#if filename}
		<div class="m-code-block__filename">{filename}</div>
	{/if}
	{#if lang}
		<div class="m-code-block__lang">{lang}</div>
	{/if}
	{#if code}
		{#if lang}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<pre class={`language-${lang}`}>{@html Prism.highlight(
					code,
					prism.languages[lang],
					lang
				)}</pre>
		{:else}
			<pre>{code}</pre>
		{/if}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.m-code-block {
		display: block;
		position: relative;
		background-color: #11111B;
		color: #EFF1F5;
		font-size: 1rem;
		line-height: 1.33em;
		border-radius: 6px;
		padding: 32px 16px 24px;
	}

	.m-code-block :global(pre) {
		overflow-x: auto;
		scrollbar-width: thin;
		padding-bottom: 4px;
		-moz-tab-size: 2;
		-o-tab-size: 2;
		tab-size: 2;
	}

	.m-code-block :global(pre::-webkit-scrollbar) {
		height: 8px;
	}

	.m-code-block__lang {
		position: absolute;
		right: 0;
		top: -15px;
		background: inherit;
		border-radius: 6px;
		padding: 4px 8px;
		z-index: 2;
		font-size: 0.85em;
	}

	.m-code-block__filename {
		background: inherit;
		border-top-left-radius: 6px;
		border-top-right-radius: 6px;
		margin-bottom: -2px;
		padding: 4px 8px;
		position: absolute;
		left: 0px;
		top: -15px;
		z-index: 1;
	}
</style>