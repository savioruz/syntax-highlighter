<script lang="ts">
	import { codeToHtml } from 'shiki';

	let code = $state('# Enter your code here\nprint("Hello, World!")');
	let language = $state('python');
	let theme = $state('github-light');
	let fontSize = $state(10);
	let lineHeight = $state(1.0);
	let showLineNumbers = $state(false);
	let editorElement: HTMLDivElement;

	const languages = [
        { value: 'python', label: 'Python' },
		{ value: 'javascript', label: 'JavaScript' },
		{ value: 'typescript', label: 'TypeScript' },
		{ value: 'java', label: 'Java' },
		{ value: 'cpp', label: 'C++' },
		{ value: 'html', label: 'HTML' },
		{ value: 'css', label: 'CSS' },
		{ value: 'json', label: 'JSON' },
		{ value: 'rust', label: 'Rust' },
		{ value: 'go', label: 'Go' },
		{ value: 'sql', label: 'SQL' },
		{ value: 'php', label: 'PHP' },
		{ value: 'ruby', label: 'Ruby' },
		{ value: 'csharp', label: 'C#' },
		{ value: 'kotlin', label: 'Kotlin' },
		{ value: 'swift', label: 'Swift' },
		{ value: 'shellscript', label: 'Shell Script' },
		{ value: 'yaml', label: 'YAML' },
		{ value: 'zig', label: 'Zig' }
	];

	const themes = [
		{ value: 'github-light', label: 'GitHub Light' },
		{ value: 'min-light', label: 'Min Light' },
		{ value: 'slack-ochin', label: 'Slack Ochin' },
		{ value: 'vitesse-light', label: 'Vitesse Light' },
		{ value: 'catppuccin-latte', label: 'Catppuccin Latte' },
		{ value: 'rose-pine-dawn', label: 'Rose Pine Dawn' }
	];

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
		} catch (error) {
			console.error('Failed to copy:', error);
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

<div class="container mx-auto max-w-5xl p-8">
	<!-- Header with controls -->
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<select
				id="language"
				bind:value={language}
				class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
			>
				{#each languages as lang (lang.value)}
					<option value={lang.value}>{lang.label}</option>
				{/each}
			</select>

			<select
				id="theme"
				bind:value={theme}
				class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
			>
				{#each themes as themeOption (themeOption.value)}
					<option value={themeOption.value}>{themeOption.label}</option>
				{/each}
			</select>
		</div>

		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<label for="fontSize" class="text-sm text-muted-foreground">Size:</label>
				<input
					id="fontSize"
					type="number"
					bind:value={fontSize}
					min="8"
					max="24"
					class="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<div class="flex items-center gap-2">
				<label for="lineHeight" class="text-sm text-muted-foreground">Line:</label>
				<input
					id="lineHeight"
					type="number"
					bind:value={lineHeight}
					min="0.8"
					max="2.5"
					step="0.1"
					class="h-9 w-16 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>

			<label class="flex items-center gap-2 cursor-pointer">
				<input type="checkbox" bind:checked={showLineNumbers} class="h-4 w-4" />
				<span class="text-sm text-muted-foreground">Line Numbers</span>
			</label>
			<button
				onclick={copyToClipboard}
				class="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent hover:text-accent-foreground"
			>
				Copy
			</button>
			<button
				onclick={clearCode}
				class="h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
			>
				✕
			</button>
		</div>
	</div>

	<!-- Code Editor -->
	<div 
		class="rounded-lg border shadow-sm relative h-[600px] overflow-hidden"
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
			placeholder="// Enter your code here..."
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
		font-family: 'Fira Code', 'Courier New', monospace;
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