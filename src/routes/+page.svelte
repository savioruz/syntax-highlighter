<script lang="ts">
	import { codeToHtml } from 'shiki';
    import { languages } from '$lib/languages';
    import { themes } from '$lib/themes';
	import { Button } from "$lib/components/ui/button/index.js";
    import * as NativeSelect from "$lib/components/ui/native-select/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";
    import * as Kbd from "$lib/components/ui/kbd/index.js";
    import { Github } from "lucide-svelte";
	import { useKeyboardShortcuts } from '$lib/hooks/useKeyboardShortcuts.svelte';
	import { useSyncScroll } from '$lib/hooks/useSyncScroll.svelte';
	import { useCopyToClipboard } from '$lib/hooks/useCopyToClipboard.svelte';

	let code = $state('#Type your code here\nprint("Hello, World!")\n');
	let language = $state('python');
	let theme = $state('github-light');
	let fontSize = $state(10);
	let lineHeight = $state(1.0);
	let showLineNumbers = $state(false);
	let editorElement: HTMLDivElement;

	let highlightedHtml = $state('');
	let textareaElement: HTMLTextAreaElement;

	const copyToClipboard = useCopyToClipboard();
	const syncScroll = useSyncScroll(() => textareaElement, () => editorElement);

	useKeyboardShortcuts({
		getTextareaElement: () => textareaElement,
		getCode: () => code,
		onCodeChange: (newCode) => {
			code = newCode;
		},
		onCopy: () => copyToClipboard({
			highlightedHtml,
			code,
			fontSize,
			lineHeight,
			showLineNumbers
		}),
		onClear: clearCode
	});

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

	function clearCode() {
		code = '';
	}
</script>

<div class="container mx-auto max-w-5xl p-4 md:p-8">
    <h1 class="text-2xl md:text-3xl font-bold text-center">Syntax Highlighter</h1>
    <h4 class="text-sm md:text-base text-center text-muted-foreground mb-8">
        Inspired from <a href="https://shiki.matsu.io/" target="_blank" rel="noopener noreferrer" class="underline">Shiki</a>
        , this site is able highlight your code snippets as you type then you just paste into Word with effortless.
    </h4>

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
				<Checkbox bind:checked={showLineNumbers} />
				<span class="text-xs md:text-sm text-muted-foreground whitespace-nowrap">Line Numbers</span>
			</Label>
		</div>

        <div class="flex items-center gap-4">
            <Button
				onclick={() => copyToClipboard({ highlightedHtml, code, fontSize, lineHeight, showLineNumbers })}
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

    <div class="my-8">
        <h3 class="text-sm font-semibold mb-3">Keyboard Shortcuts</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
            <li class="flex items-center gap-2">
                <Kbd.Group>
                    <Kbd.Root>⌘</Kbd.Root>/<Kbd.Root>Ctrl</Kbd.Root> + <Kbd.Root>C</Kbd.Root>
                </Kbd.Group>
                <span>Copy the highlighted code to clipboard</span>
            </li>
            <li class="flex items-center gap-2">
                <Kbd.Group>
                    <Kbd.Root>⌘</Kbd.Root>/<Kbd.Root>Ctrl</Kbd.Root> + <Kbd.Root>V</Kbd.Root>
                </Kbd.Group>
                <span>Paste code from clipboard</span>
            </li>
            <li class="flex items-center gap-2">
                <Kbd.Group>
                    <Kbd.Root>⌘</Kbd.Root>/<Kbd.Root>Ctrl</Kbd.Root> + <Kbd.Root>D</Kbd.Root>
                </Kbd.Group>
                <span>Clear the editor</span>
            </li>
        </ul>
    </div>

    <footer class="text-center text-xs text-muted-foreground">
        <Button variant="outline" href="https://github.com/savioruz/syntax-highlighter" target="_blank" rel="noopener noreferrer">
            <Github /> View on GitHub
        </Button>
    </footer>
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