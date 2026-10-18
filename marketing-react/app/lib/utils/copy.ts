async function copyTextToClipboard(text: string): Promise<boolean> {
	if (navigator.clipboard) {
		return navigator.clipboard
			.writeText(text)
			.then(() => true)
			.catch(() => fallbackCopyTextToClipboard(text));
	}
	return Promise.resolve(fallbackCopyTextToClipboard(text));
}

function fallbackCopyTextToClipboard(text: string): boolean {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();
	try {
		document.execCommand("copy");
		document.body.removeChild(textArea);
		return true;
	} catch {
		document.body.removeChild(textArea);
		return false;
	}
}

export default copyTextToClipboard;
