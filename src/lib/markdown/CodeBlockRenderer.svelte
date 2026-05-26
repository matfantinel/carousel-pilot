<script lang="ts">
  import CodeBlock from "./CodeBlock.svelte";

	let {
		lang,
		text
	} : {
		lang: string;
		text: string;
	} = $props();

	// Get filename from code block
	// Pattern: ~filename example.js
	// Then remove it from the code block
	const filename = $derived(text.match(/^~filename\s*(.*)/)?.[1]);
	const code = $derived(filename ? text.replace(/^~filename.*(?:\n|$)/, '') : text);
</script>

<CodeBlock {lang} {filename} {code} />