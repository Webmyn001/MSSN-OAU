import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
	BookOpenText,
	MessageCircle,
	NotebookPen,
	Presentation,
	SquareArrowOutUpRight,
	UsersRound,
	type LucideIcon,
} from "lucide-react";
import { Image } from "~/components/ui/image";

export interface HomeProgramme {
	title: string;
	text?: string;
	summary?: string;
	description?: string;
	image?: string;
	alt?: string;
	href?: string;
}

interface ProgrammesProps {
	programmes?: HomeProgramme[];
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

const iconMap: Record<string, LucideIcon> = {
	Tutorials: BookOpenText,
	Madrasah: NotebookPen,
	"Al-Usrah": Presentation,
	"Sisters' Circle": UsersRound,
};

function getIcon(title: string): LucideIcon {
	return iconMap[title] || BookOpenText;
}

export function Programmes({ programmes = [] }: ProgrammesProps) {
	const [displayed, setDisplayed] = useState<HomeProgramme[]>(programmes);
	const [selectedEvent, setSelectedEvent] = useState<string>(programmes[0]?.title ?? "");
	const [hoveredTab, setHoveredTab] = useState<string | null>(null);
	const [tilt, setTilt] = useState({ x: 0, y: 0 });
	const containerRef = useRef<HTMLDivElement>(null);
	const didShuffle = useRef(false);

	useEffect(() => {
		if (programmes.length > 0 && !didShuffle.current) {
			didShuffle.current = true;
			const next = programmes.length > 1 ? shuffle(programmes) : programmes;
			setDisplayed(next);
			setSelectedEvent(next[0].title);
		}
	}, [programmes]);

	const selectedImage = useMemo(
		() => displayed.find((p) => p.title === selectedEvent)?.image,
		[displayed, selectedEvent]
	);

	function handleMouseMove(e: React.MouseEvent) {
		const el = containerRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		setTilt({
			x: (e.clientX - rect.left) / rect.width,
			y: (e.clientY - rect.top) / rect.height,
		});
	}

	return (
		<div
			role="button"
			tabIndex={0}
			className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto"
			ref={containerRef}
			onMouseMove={handleMouseMove}
		>
			<div className="relative p-6 md:p-16 overflow-hidden">
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

				<div className="relative z-10 flex flex-col lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
					<div className="order-2 mb-10 lg:mb-0 lg:order-2 lg:col-span-6 lg:col-start-8">
						<h2 className="text-2xl text-neutral-800 font-bold sm:text-3xl font-primary relative inline-block">
							Our Programmes
							<span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-700 rounded-full" />
						</h2>

						<nav
							role="tablist"
							aria-label="Programmes"
							className="relative grid gap-4 mt-5 md:mt-10"
						>
							{displayed.map((programme) => {
								const Icon = getIcon(programme.title);
								return (
									<button
										key={programme.title}
										type="button"
										role="tab"
										onClick={() => {
											setSelectedEvent(programme.title);
											setHoveredTab(null);
										}}
										onMouseEnter={() => setHoveredTab(programme.title)}
										onMouseLeave={() => setHoveredTab(null)}
										className="text-left"
									>
										<span className="flex gap-x-4 items-start">
											<Icon
												className={`shrink-0 mt-1 size-5 ${
													selectedEvent === programme.title || hoveredTab === programme.title
														? "text-primary-700"
														: "text-neutral-700"
												}`}
											/>
											<span className="flex-1">
												<span
													className={`block font-semibold ${
														selectedEvent === programme.title ||
														hoveredTab === programme.title
															? "text-primary-800"
															: "text-neutral-800"
													}`}
												>
													{programme.title}
												</span>
												<span className="mt-0.5 block text-sm text-neutral-500 line-clamp-2">
													{programme.summary || programme.text || programme.description}
												</span>
											</span>
										</span>
									</button>
								);
							})}
						</nav>

						<div className="mt-6 flex flex-wrap items-center gap-4">
							<Link
								to="/programmes"
								className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
							>
								View All Programmes <SquareArrowOutUpRight className="size-4" />
							</Link>
							<a
								href="https://wa.me/2348146851394"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
							>
								Enquiry <MessageCircle className="size-4" />
							</a>
						</div>
					</div>

					<div className="order-1 lg:order-1 lg:col-span-6">
						<div
							className="relative overflow-hidden rounded-2xl shadow-xl border border-primary-100"
							style={{
								transform: `perspective(1000px) rotateY(${(tilt.x - 0.5) * -4}deg) rotateX(${(tilt.y - 0.5) * 4}deg)`,
							}}
						>
							<Image
								loading="eager"
								className="w-full h-[280px] sm:h-[360px] object-cover"
								width={640}
								height={400}
								src={selectedImage || "/images/placeholder.webp"}
								alt={selectedEvent}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
							<div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-white/20 border border-white/30 rounded-lg px-4 py-2">
								<p className="text-white font-medium text-sm md:text-base">
									{selectedEvent} Programme
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
