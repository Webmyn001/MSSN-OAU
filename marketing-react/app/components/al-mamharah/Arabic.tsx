import type { ReactNode } from "react";

/**
 * Inline Arabic label rendered in the Arabic typeface (RTL).
 * Pairs Arabic wording with the English UI labels across Al-Mamharah.
 */
export function Arabic({ children, className = "" }: { children: ReactNode; className?: string }) {
	return (
		<span dir="rtl" lang="ar" className={`font-arabic ${className}`}>
			{children}
		</span>
	);
}
