import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
	open: boolean;
	title?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	danger?: boolean;
	onconfirm?: () => void;
	oncancel?: () => void;
}

export function ConfirmDialog({
	open,
	title = "Are you sure?",
	message,
	confirmLabel = "Yes, Delete",
	cancelLabel = "No, Cancel",
	danger = true,
	onconfirm,
	oncancel,
}: ConfirmDialogProps) {
	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
			role="button"
			tabIndex={-1}
			onClick={(e) => {
				if (e.target === e.currentTarget) oncancel?.();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape" || e.key === "Enter") oncancel?.();
			}}
		>
			<div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 border border-gray-100 text-center animate-[confirmIn_0.15s_ease-out]">
				<div
					className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
						danger ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
					}`}
				>
					<AlertTriangle className="w-7 h-7" />
				</div>

				<div className="space-y-1.5">
					<h3 className="text-base font-bold text-gray-900">{title}</h3>
					<p className="text-xs text-gray-500 leading-relaxed">{message}</p>
				</div>

				<div className="flex items-center space-x-2 pt-1">
					<button
						type="button"
						onClick={() => oncancel?.()}
						className="flex-1 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={() => onconfirm?.()}
						className={`flex-1 py-2.5 rounded-full text-white text-xs font-bold shadow-md ${
							danger ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600"
						}`}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
