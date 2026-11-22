import { useEffect, useRef, useState, type ClipboardEvent } from "react";

interface RichTextEditorProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minHeight?: string;
}

const ALLOWED_TAGS = new Set([
	"p",
	"br",
	"b",
	"strong",
	"i",
	"em",
	"u",
	"h2",
	"h3",
	"h4",
	"ul",
	"ol",
	"li",
	"blockquote",
	"a",
]);

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function escapeAttr(value: string): string {
	return escapeHtml(value).replace(/'/g, "&#39;");
}

function isBlank(html: string): boolean {
	return html.replace(/&nbsp;|&#160;|\s/g, "").length === 0;
}

/** Strips Word/Google Docs inline styling and keeps only article-friendly tags. */
function cleanPastedHtml(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	doc.querySelectorAll("script, style, meta, link, title").forEach((node) => node.remove());

	function walk(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) {
			return escapeHtml(node.textContent || "");
		}
		if (node.nodeType !== Node.ELEMENT_NODE) return "";

		const element = node as HTMLElement;
		const tag = element.tagName.toLowerCase();
		const children = Array.from(element.childNodes).map(walk).join("");

		if (tag === "br") return "<br>";
		if (isBlank(children)) return "";

		if (tag === "a") {
			const href = element.getAttribute("href") || "";
			if (/^(https?:|mailto:|\/|#)/i.test(href)) {
				return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${children}</a>`;
			}
			return children;
		}

		if (tag === "div" || tag === "o:p") {
			return /^<p[\s>]/i.test(children) ? children : `<p>${children}</p>`;
		}

		return ALLOWED_TAGS.has(tag) ? `<${tag}>${children}</${tag}>` : children;
	}

	return Array.from(doc.body.childNodes).map(walk).join("").trim();
}

function plainTextToHtml(text: string): string {
	return text
		.split(/\n\s*\n/)
		.map((block) =>
			block
				.split("\n")
				.map((line) => escapeHtml(line.trim()))
				.filter(Boolean)
				.join("<br>")
		)
		.filter(Boolean)
		.map((block) => `<p>${block}</p>`)
		.join("");
}

export function RichTextEditor({
	id,
	value,
	onChange,
	placeholder = "Start writing...",
	minHeight = "10rem",
}: RichTextEditorProps) {
	const editorRef = useRef<HTMLDivElement>(null);
	const [showHtml, setShowHtml] = useState(false);

	useEffect(() => {
		if (showHtml) return;
		const editor = editorRef.current;
		if (editor && document.activeElement !== editor && editor.innerHTML !== value) {
			editor.innerHTML = value;
		}
	}, [value, showHtml]);

	function emit() {
		onChange(editorRef.current?.innerHTML || "");
	}

	function run(command: string, commandValue?: string) {
		editorRef.current?.focus();
		document.execCommand(command, false, commandValue);
		emit();
	}

	function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
		event.preventDefault();
		const html = event.clipboardData.getData("text/html");
		const text = event.clipboardData.getData("text/plain");
		const clean = html ? cleanPastedHtml(html) : plainTextToHtml(text);
		if (clean) {
			run("insertHTML", clean);
		}
	}

	const tools = [
		{ label: "B", title: "Bold", action: () => run("bold"), className: "font-bold" },
		{ label: "I", title: "Italic", action: () => run("italic"), className: "italic" },
		{ label: "Heading", title: "Heading", action: () => run("formatBlock", "<h3>"), className: "" },
		{ label: "• List", title: "Bullet list", action: () => run("insertUnorderedList"), className: "" },
		{ label: "1. List", title: "Numbered list", action: () => run("insertOrderedList"), className: "" },
		{ label: "❝", title: "Quote", action: () => run("formatBlock", "<blockquote>"), className: "" },
		{ label: "Clear", title: "Clear formatting", action: () => run("removeFormat"), className: "" },
	];

	return (
		<div className="overflow-hidden rounded-xl border border-green-200 bg-white">
			<div className="flex flex-wrap items-center gap-1 border-b border-green-100 bg-green-50/60 px-2 py-1.5">
				{!showHtml
					? tools.map((tool) => (
							<button
								key={tool.title}
								type="button"
								title={tool.title}
								onMouseDown={(event) => event.preventDefault()}
								onClick={tool.action}
								className={`rounded-md px-2 py-1 text-[10px] font-semibold text-green-800 transition-colors hover:bg-green-200 ${tool.className}`}
							>
								{tool.label}
							</button>
						))
					: null}
				<span className={`text-[9px] text-gray-400 ${showHtml ? "ml-1" : "ml-auto pr-1"}`}>
					{showHtml ? "Paste prepared HTML here" : "Paste from Word is supported"}
				</span>
				<button
					type="button"
					title={showHtml ? "Switch to visual editor" : "Edit HTML directly"}
					onMouseDown={(event) => event.preventDefault()}
					onClick={() => setShowHtml((current) => !current)}
					className="ml-auto rounded-md border border-green-200 bg-white px-2 py-1 text-[10px] font-semibold text-green-800 transition-colors hover:bg-green-100"
				>
					{showHtml ? "Visual" : "HTML"}
				</button>
			</div>
			{showHtml ? (
				<textarea
					id={id}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder="<p>Paste or edit HTML here...</p>"
					spellCheck={false}
					className="w-full resize-y bg-white px-3 py-2 font-mono text-xs leading-relaxed text-green-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-600"
					style={{ minHeight }}
				/>
			) : (
				<div className="relative">
					{!value ? (
						<span className="pointer-events-none absolute left-3 top-3 text-xs text-gray-400">
							{placeholder}
						</span>
					) : null}
					<div
						id={id}
						ref={editorRef}
						contentEditable
						suppressContentEditableWarning
						role="textbox"
						aria-multiline="true"
						onInput={emit}
						onPaste={handlePaste}
						onBlur={emit}
						className="prose prose-sm max-w-none px-3 py-2 text-xs text-green-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-600"
						style={{ minHeight }}
					/>
				</div>
			)}
		</div>
	);
}
