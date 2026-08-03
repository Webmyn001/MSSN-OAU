export type ToastType = 'success' | 'error';

export interface ToastItem {
	id: number;
	type: ToastType;
	message: string;
}

let nextId = 1;

export const toasts: ToastItem[] = $state([]);

export function toast(type: ToastType, message: string, duration = 5000) {
	const id = nextId++;
	toasts.push({ id, type, message });
	setTimeout(() => dismiss(id), duration);
}

export function dismiss(id: number) {
	const idx = toasts.findIndex((t) => t.id === id);
	if (idx >= 0) toasts.splice(idx, 1);
}
