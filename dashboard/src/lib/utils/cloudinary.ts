const API_BASE = 'http://localhost:3000';

export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB target (auto-compressed)
export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15 MB hard rejection limit

let cloudName = '';
let uploadPreset = '';
let initialized = false;

export async function initCloudinary() {
	if (initialized) return;
	initialized = true;
	try {
		const res = await fetch(`${API_BASE}/public/events/config/cloudinary`);
		if (res.ok) {
			const json = await res.json();
			if (json.success && json.data) {
				cloudName = json.data.cloudName || 'your_cloud_name';
				uploadPreset = json.data.uploadPreset || 'mssn_events';
				return;
			}
		}
	} catch { /* ignore */ }
	cloudName = 'your_cloud_name';
	uploadPreset = 'mssn_events';
}

function compressImage(file: File, maxBytes: number): Promise<File> {
	return new Promise((resolve) => {
		if (file.size <= maxBytes) { resolve(file); return; }
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const scale = Math.sqrt(maxBytes / file.size) * 0.9;
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			canvas.toBlob((blob) => {
				URL.revokeObjectURL(url);
				if (blob) {
					resolve(new File([blob], file.name, { type: 'image/jpeg' }));
				} else {
					resolve(file);
				}
			}, 'image/jpeg', 0.8);
		};
		img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
		img.src = url;
	});
}

export async function uploadImage(file: File): Promise<string> {
	await initCloudinary();
	if (!file) throw new Error('No file provided');
	if (file.size > MAX_UPLOAD_SIZE) {
		throw new Error(`Image is too large. Please upload an image under 15MB (this file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
	}
	const compressed = await compressImage(file, MAX_IMAGE_SIZE);
	const formData = new FormData();
	formData.append('file', compressed);
	formData.append('upload_preset', uploadPreset);
	const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
		method: 'POST',
		body: formData,
	});
	const json = await res.json();
	if (json.secure_url) {
		return json.secure_url;
	}
	throw new Error(json.error?.message || 'Image upload failed. Check Cloudinary config.');
}

export function validateImageSize(file: File): string | null {
	if (file.size > MAX_IMAGE_SIZE) {
		return `Image must be less than 3MB (this file is ${(file.size / (1024 * 1024)).toFixed(1)}MB)`;
	}
	return null;
}
