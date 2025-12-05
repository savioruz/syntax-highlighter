import { toast } from 'svelte-sonner';

interface KeyboardShortcutsOptions {
	getTextareaElement: () => HTMLTextAreaElement | undefined;
	getCode: () => string;
	onCodeChange: (newCode: string) => void;
	onCopy: () => void;
	onClear: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
	$effect(() => {
		const { getTextareaElement, getCode, onCodeChange, onCopy, onClear } = options;

		const handleGlobalKeydown = (event: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			const modifierKey = isMac ? event.metaKey : event.ctrlKey;

			const target = event.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
				return;
			}

			const textareaElement = getTextareaElement();
			const code = getCode();

			if (modifierKey && event.key === 'c' && !event.shiftKey) {
				if (textareaElement && textareaElement.selectionStart !== textareaElement.selectionEnd) {
					return;
				}

				event.preventDefault();
				onCopy();
			}

			if (modifierKey && event.key === 'v') {
				event.preventDefault();
				navigator.clipboard
					.readText()
					.then((text) => {
						if (textareaElement) {
							const start = textareaElement.selectionStart || code.length;
							const end = textareaElement.selectionEnd || code.length;
							const newCode = code.substring(0, start) + text + code.substring(end);
							onCodeChange(newCode);

							setTimeout(() => {
								if (textareaElement) {
									textareaElement.selectionStart = textareaElement.selectionEnd =
										start + text.length;
									textareaElement.focus();
								}
							}, 0);
						}

						toast.success('Pasted from clipboard!');
					})
					.catch((err) => {
						console.error('Failed to read clipboard:', err);
						toast.error('Failed to paste from clipboard.');
					});
			}

			if (modifierKey && event.key === 'd') {
				event.preventDefault();
				onClear();
				toast.success('Code cleared!');
			}
		};

		document.addEventListener('keydown', handleGlobalKeydown);

		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown);
		};
	});
}
