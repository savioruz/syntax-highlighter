import { toast } from 'svelte-sonner';

interface CopyToClipboardOptions {
	highlightedHtml: string;
	code: string;
	fontSize: number;
	lineHeight: number;
	showLineNumbers: boolean;
}

export function useCopyToClipboard() {
	return async (options: CopyToClipboardOptions) => {
		const { highlightedHtml, code, fontSize, lineHeight, showLineNumbers } = options;

		try {
			let styledHtml = highlightedHtml.replace(
				'<pre class="shiki"',
				`<pre class="shiki" style="font-family: 'Courier New', monospace; font-size: ${fontSize}px; line-height: ${lineHeight};"`
			);

			if (showLineNumbers) {
				const lines = code.split('\n');
				const codeContent = styledHtml.match(/<code[^>]*>([\s\S]*?)<\/code>/)?.[1] || '';
				const lineElements = codeContent.split('\n');

				const numberedLines = lineElements
					.map((line, index) => {
						if (index < lines.length) {
							return `${index + 1}. ${line}`;
						}
						return line;
					})
					.join('\n');

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
	};
}
