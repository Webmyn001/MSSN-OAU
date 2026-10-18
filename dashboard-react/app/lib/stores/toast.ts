import { useEffect, useState } from "react";

export type ToastType = "success" | "error";

export interface ToastItem {
	id: number;
	type: ToastType;
	message: string;
}

let nextId = 1;
let toasts: ToastItem[] = [];
const listeners = new Set<(t: ToastItem[]) => void>();

function emit() {
	const snapshot = [...toasts];
	listeners.forEach((l) => l(snapshot));
}

export function toast(type: ToastType, message: string, duration = 5000) {
	const id = nextId++;
	toasts = [...toasts, { id, type, message }];
	emit();
	setTimeout(() => dismiss(id), duration);
}

export function dismiss(id: number) {
	toasts = toasts.filter((t) => t.id !== id);
	emit();
}

export function useToasts(): ToastItem[] {
	const [items, setItems] = useState<ToastItem[]>(toasts);
	useEffect(() => {
		const listener = (t: ToastItem[]) => setItems(t);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}, []);
	return items;
}
