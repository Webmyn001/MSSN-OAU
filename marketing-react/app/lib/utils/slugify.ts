function slugify(text: string): string {
	return text
		.toString()
		.trim()
		.toLowerCase()
		.replace(/[\s\-_]+/g, "-")
		.replace(/[^\w\-]+/g, "")
		.replace(/^-+|-+$/g, "");
}

export default slugify;
