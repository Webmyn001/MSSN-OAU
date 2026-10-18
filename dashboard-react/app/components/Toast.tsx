import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { dismiss, useToasts, type ToastType } from "~/lib/stores/toast";

const typeStyles: Record<ToastType, string> = {
	success: "bg-green-50 border-green-300 text-green-900",
	error: "bg-rose-50 border-rose-300 text-rose-900",
};

export function Toast() {
	const toasts = useToasts();

	if (toasts.length === 0) return null;

	return (
		<div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
			{toasts.map((t) => (
				<div
					key={t.id}
					className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-center justify-between text-xs font-semibold transition-all animate-[toastIn_0.2s_ease-out] ${typeStyles[t.type]}`}
				>
					<div className="flex items-center space-x-2.5">
						{t.type === "success" ? (
							<CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
						) : (
							<AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
						)}
						<span>{t.message}</span>
					</div>
					<button
						type="button"
						onClick={() => dismiss(t.id)}
						className="text-gray-400 hover:text-gray-700 p-1 shrink-0"
					>
						<span className="sr-only">Dismiss</span>
						<X className="w-4 h-4" />
					</button>
				</div>
			))}
		</div>
	);
}
