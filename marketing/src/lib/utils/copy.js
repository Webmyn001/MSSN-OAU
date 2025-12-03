async function copyTextToClipboard(text) {
    if (navigator.clipboard) {
        // Try using Clipboard API
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => fallbackCopyTextToClipboard(text));
    } else {
        // Fallback for older browsers
        return Promise.resolve(fallbackCopyTextToClipboard(text));
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}

export default  copyTextToClipboard