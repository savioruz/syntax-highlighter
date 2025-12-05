export function useSyncScroll(
	getTextareaElement: () => HTMLTextAreaElement | undefined,
	getEditorElement: () => HTMLDivElement | undefined
) {
	return () => {
		const textareaElement = getTextareaElement();
		const editorElement = getEditorElement();
		
		if (textareaElement && editorElement) {
			editorElement.scrollTop = textareaElement.scrollTop;
			editorElement.scrollLeft = textareaElement.scrollLeft;
		}
	};
}
