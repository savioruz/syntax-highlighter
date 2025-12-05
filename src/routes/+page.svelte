<script lang="ts">
	import { codeToHtml } from 'shiki';
    import { languages } from '$lib/languages';
    import { themes } from '$lib/themes';
	import { Button } from "$lib/components/ui/button/index.js";
    import * as NativeSelect from "$lib/components/ui/native-select/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
	import { toast } from 'svelte-sonner';

	let code = $state('# Enter your code here\nprint("Hello, World!")');
	let language = $state('python');
	let theme = $state('github-light');
	let fontSize = $state(10);
	let lineHeight = $state(1.0);
	let showLineNumbers = $state(false);
	let editorElement: HTMLDivElement;

	let highlightedHtml = $state('');
	let textareaElement: HTMLTextAreaElement;

	$effect(() => {
		let cancelled = false;

		(async () => {
			try {
				const html = await codeToHtml(code || ' ', {
					lang: language,
					theme: theme
				});
				if (!cancelled) {
					highlightedHtml = html;
				}
			} catch (error) {
				console.error('Error highlighting code:', error);
				if (!cancelled) {
					highlightedHtml = '<pre class="shiki"><code>' + code + '</code></pre>';
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	function syncScroll() {
		if (textareaElement && editorElement) {
			editorElement.scrollTop = textareaElement.scrollTop;
			editorElement.scrollLeft = textareaElement.scrollLeft;
		}
	}

	async function copyToClipboard() {
		try {
			let styledHtml = highlightedHtml.replace(
				'<pre class="shiki"',
				`<pre class="shiki" style="font-family: 'Courier New', monospace; font-size: ${fontSize}px; line-height: ${lineHeight};"`
			);

			if (showLineNumbers) {
				const lines = code.split('\n');
				const codeContent = styledHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/)?.[1] || '';
				const lineElements = codeContent.split('\n');
				
				const numberedLines = lineElements.map((line, index) => {
					if (index < lines.length) {
						return `${index + 1}. ${line}`;
					}
					return line;
				}).join('\n');
				
				styledHtml = styledHtml.replace(
					/<code[^>]*>[\s\S]*?<\/code>/,
					`<code>${numberedLines}</code>`
				);
			}
			
			const blob = new Blob([styledHtml], { type: 'text/html' });
			const textBlob = new Blob([code], { type: 'text/plain' });
			
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/html': blob,
					'text/plain': textBlob
				})
			]);

            toast.success('Code copied to clipboard!');
		} catch (error) {
            toast.error('Failed to copy code to clipboard.');
			try {
				await navigator.clipboard.writeText(code);
			} catch (e) {
				console.error('Fallback copy failed:', e);
			}
		}
	}

	function clearCode() {
		code = '';
	}
</script>

<div class="container mx-auto max-w-5xl p-4 md:p-8">
	<div class="mb-4 md:mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0">
		<div class="flex flex-wrap items-center gap-4">
            <NativeSelect.Root bind:value={language}>
                {#each languages as lang (lang.value)}
                    <NativeSelect.Option value={lang.value}>{lang.label}</NativeSelect.Option>
                {/each}
            </NativeSelect.Root>

            <NativeSelect.Root bind:value={theme}>
                {#each themes as themeOption (themeOption.value)}
                    <NativeSelect.Option value={themeOption.value}>{themeOption.label}</NativeSelect.Option>
                {/each}
            </NativeSelect.Root>
		</div>

		<div class="flex flex-wrap items-center gap-4">
			<div class="flex items-center gap-1 md:gap-2">
				<Label for="fontSize" class="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Size:</Label>
				<Input
					id="fontSize"
					type="number"
					bind:value={fontSize}
					min="8"
					max="32"
					class="w-16"
				/>
			</div>

			<div class="flex items-center gap-1 md:gap-2">
				<Label for="lineHeight" class="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Line:</Label>
				<Input
					id="lineHeight"
					type="number"
					bind:value={lineHeight}
					min="0.8"
					max="2.5"
					step="0.1"
					class="w-16"
				/>
			</div>
			<Label class="flex items-center gap-1 md:gap-2 cursor-pointer">
				<input type="checkbox" bind:checked={showLineNumbers} class="h-4 w-4" />
				<span class="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Line Numbers</span>
			</Label>
		</div>

        <div class="flex items-center gap-4">
            <Button
				onclick={copyToClipboard}
                variant="secondary"
				class="text-xs md:text-sm"
			>
				Copy
            </Button>
			<Button
				onclick={clearCode}
				variant="secondary"
				class="text-xs md:text-sm px-3"
			>
				✕
			</Button>
        </div>
	</div>

	<div 
		class="rounded-lg border shadow-sm relative h-[400px] md:h-[600px] overflow-hidden"
		style="--editor-font-size: {fontSize}px; --editor-line-height: {lineHeight};"
	>
		<div
			bind:this={editorElement}
			class="absolute inset-0 overflow-auto pb-96"
		>
			{@html highlightedHtml}
		</div>
		<textarea
			bind:this={textareaElement}
			bind:value={code}
			onscroll={syncScroll}
			placeholder=""
			class="absolute inset-0 w-full h-full resize-none overflow-auto bg-transparent font-mono text-transparent focus:outline-none z-1 pb-96"
			spellcheck="false"
			autocomplete="off"
			autocapitalize="off"
		></textarea>
	</div>
</div>

<style>
	:global(.shiki),
	textarea {
		padding: 10px !important;
		min-height: 4em;
		white-space: pre;
		font-family: 'Courier New', monospace;
		box-sizing: border-box;
		font-size: 14px;
		line-height: 1.5;
	}

	:global(.shiki) {
		margin: 0;
		display: block;
	}

	:global(.shiki pre) {
		margin: 0;
		padding: 0;
	}

	:global(.shiki code) {
		display: block;
	}

	textarea {
		-webkit-text-fill-color: transparent;
		caret-color: black;
	}

	textarea::placeholder {
		-webkit-text-fill-color: hsl(var(--muted-foreground));
		opacity: 0.5;
	}

	textarea::selection {
		background-color: rgba(59, 130, 246, 0.3);
	}

	:global(.shiki) {
		background: transparent !important;
	}
</style>