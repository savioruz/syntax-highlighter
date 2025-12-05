<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from "$lib/components/ui/sonner/index.js";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Syntax Highlighter - Beautiful code highlighting</title>
	<meta
		name="description"
		content="A modern syntax highlighter for your code snippets using Shiki and Svelte"
	/>
</svelte:head>

<div class="min-h-screen bg-background">
	<Toaster position="top-right" richColors theme="light" />
	{@render children()}
</div>
