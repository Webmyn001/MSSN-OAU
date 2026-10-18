import { useEffect, useState, type ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "~/components/ui/sheet";

interface ResponsiveModalProps {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	title?: string;
	description?: string;
	side?: "top" | "right" | "bottom" | "left";
	contentClass?: string;
	closeOnOutsideClick?: boolean;
	closeOnEscape?: boolean;
	header?: ReactNode;
	children?: ReactNode;
	footer?: ReactNode;
}

export function ResponsiveModal({
	open,
	onOpenChange,
	title = "",
	description = "",
	side = "bottom",
	contentClass = "",
	header,
	children,
	footer,
}: ResponsiveModalProps) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const update = () => setIsMobile(window.innerWidth < 768);
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	if (isMobile) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent
					side={side}
					className={`flex flex-col p-0 max-h-[85dvh] ${contentClass}`}
					aria-describedby={description ? "sheet-description" : undefined}
				>
					{header ?? (title ? (
						<SheetHeader className="sticky top-0 bg-background/90 backdrop-blur-sm z-20 px-6 pt-5 pb-4 border-b text-left">
							<SheetTitle className="text-lg font-semibold text-foreground pr-8">
								{title}
							</SheetTitle>
							{description ? (
								<SheetDescription id="sheet-description" className="text-xs text-muted-foreground mt-0.5">
									{description}
								</SheetDescription>
							) : null}
						</SheetHeader>
					) : null)}

					<div className="flex-1 overflow-y-auto p-6 dialog-inner-content-scrollable">{children}</div>

					{footer ? (
						<SheetFooter className="sticky bottom-0 bg-background/90 backdrop-blur-sm z-20 p-4 border-t mt-auto">
							{footer}
						</SheetFooter>
					) : null}
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={`sm:max-w-md flex flex-col ${contentClass}`}
				aria-describedby={description ? "dialog-description" : undefined}
			>
				{header ?? (title ? (
					<DialogHeader className="text-left">
						<DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>
						{description ? (
							<DialogDescription
								id="dialog-description"
								className="text-sm text-muted-foreground mt-1"
							>
								{description}
							</DialogDescription>
						) : null}
					</DialogHeader>
				) : null)}

				<div className="flex-1 overflow-y-auto py-4 dialog-inner-content-scrollable">{children}</div>

				{footer ? <DialogFooter className="mt-auto">{footer}</DialogFooter> : null}
			</DialogContent>
		</Dialog>
	);
}
