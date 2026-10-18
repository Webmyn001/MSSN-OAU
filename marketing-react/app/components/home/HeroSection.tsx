import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Sparkles } from "./Sparkles";

const heroStyles = `
.yoruba { font-family: "Charis SIL", sans-serif; }
@font-face {
	font-family: 'Charis SIL';
	font-style: normal;
	font-display: swap;
	font-weight: 400;
	src: url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff2) format('woff2'), url(https://cdn.jsdelivr.net/fontsource/fonts/charis-sil@latest/latin-400-normal.woff) format('woff');
	unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
.oau { cursor: url('/oau-logo.png') 32 32, auto; }
`;

export function HeroSection() {
	return (
		<section className="relative py-24 md:py-32 w-full overflow-hidden">
			<style dangerouslySetInnerHTML={{ __html: heroStyles }} />

			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 size-[28rem] rounded-full bg-[#EBB957]/15 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-[#026d3b]/10 blur-3xl" />
				<div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.03] mix-blend-overlay" />
			</div>

			<div className="container relative mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
				<div className="relative animate-fade-in">
					<span className="inline-flex items-center gap-2 mb-6 rounded-full border border-[#EBB957]/30 bg-[#EBB957]/10 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-primary-800 backdrop-blur-sm">
						<span className="size-2 rounded-full bg-[#EBB957] animate-pulse" />
						Muslim Students&apos; Society of Nigeria, OAU Branch
					</span>
					<h1
						className="text-primary-900 oau my-6 text-pretty text-4xl font-bold lg:text-6xl xl:text-7xl text-center tracking-tight"
						id="hero-text"
					>
						<span>We are Great</span>{" "}
						<span className="relative inline-block oau">
							<span className="relative z-10 yoruba text-[#28145B] inline-block">
								Ifẹ̀&apos;s
								<svg
									className="absolute left-0 bottom-0 w-full opacity-70"
									style={{ height: "10px", transform: "translateY(7px)" }}
									viewBox="0 0 100 10"
									preserveAspectRatio="none"
									aria-hidden="true"
								>
									<path
										d="M2,5 Q10,2.5 25,5.2 Q40,3 50,5.5 T73,4.8 T98,5"
										stroke="#EBB957"
										strokeWidth={2.5}
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</span>
							<span className="absolute left-[-2px] top-0 z-0 yoruba text-[#EBB957] blur-[0.5px]">
								Ìfẹ́&apos;s
							</span>
						</span>
					</h1>

					<div className="relative mb-10 max-w-3xl mx-auto">
						<p className="text-zinc-600 lg:text-xl xl:text-2xl leading-relaxed">
							community of diverse, forward-thinking and progressive muslim men and women united
							in faith.
						</p>
						<div className="absolute -inset-4 -z-10 bg-gradient-to-r from-[#EBB957]/5 via-[#28145B]/5 to-[#EBB957]/5 rounded-2xl blur-xl opacity-70" />
					</div>
				</div>

				<div className="w-full relative">
					<Sparkles
						minSize={8}
						maxSize={16}
						particleDensity={60}
						className="w-full mx-auto h-[25dvh]"
						particleColor="#026d3b"
						secondaryColor="#EBB957"
						speed={12}
					/>
				</div>

				<div className="flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4 mt-4 relative z-10">
					<Button
						asChild
						size="lg"
						className="w-full sm:w-auto hover:shadow-lg hover:-translate-y-0.5 transition-all"
					>
						<Link to="/about">About Us</Link>
					</Button>
					<Button
						variant="outline"
						size="lg"
						asChild
						className="w-full sm:w-auto hover:shadow-lg hover:-translate-y-0.5 transition-all bg-white/80 backdrop-blur-sm hover:bg-[#EBB957]/10 text-primary-900 border-[#EBB957]/30"
					>
						<Link to="/our-excos">Our Excos</Link>
					</Button>
				</div>
			</div>

			<div className="mt-16 sm:mt-24 md:mt-32 aspect-video overflow-hidden md:aspect-auto md:h-[480px] relative">
				<div className="relative mx-auto flex max-w-4xl flex-col">
					<div className="container mx-auto px-4 sm:px-6 relative">
						<div className="absolute inset-0 pointer-events-none">
							<div className="absolute left-[-80px] top-[10%] hidden md:block">
								<div className="relative">
									<img
										src="/images/man_1.webp"
										alt="community member"
										loading="lazy"
										className="size-16 rounded-full object-cover border-2 border-white shadow-md"
									/>
									<img
										src="/images/woman_1.webp"
										alt="community member"
										loading="lazy"
										className="size-14 rounded-full object-cover border-2 border-white shadow-md absolute -bottom-6 -right-4"
									/>
								</div>
							</div>

							<div className="absolute left-[-120px] top-[40%] hidden md:block">
								<div className="relative">
									<img
										src="/images/man_2.webp"
										alt="community member"
										loading="lazy"
										className="size-14 rounded-full object-cover border-2 border-white shadow-md"
									/>
								</div>
							</div>

							<div className="absolute left-[-60px] bottom-[15%] hidden md:block">
								<div className="relative">
									<img
										src="/images/woman_2.webp"
										alt="community member"
										loading="lazy"
										className="size-16 rounded-full object-cover border-2 border-white shadow-md"
									/>
									<img
										src="/images/man_3.webp"
										alt="community member"
										loading="lazy"
										className="size-12 rounded-full object-cover border-2 border-white shadow-md absolute -top-8 -right-2"
									/>
								</div>
							</div>

							<div className="absolute right-[-80px] top-[15%] hidden md:block">
								<div className="relative">
									<img
										src="/images/woman_3.webp"
										alt="community member"
										loading="lazy"
										className="size-16 rounded-full object-cover border-2 border-white shadow-md"
									/>
									<img
										src="/images/man_4.webp"
										alt="community member"
										loading="lazy"
										className="size-14 rounded-full object-cover border-2 border-white shadow-md absolute -bottom-4 -left-6"
									/>
								</div>
							</div>

							<div className="absolute right-[-100px] top-[50%] hidden md:block">
								<div className="relative">
									<img
										src="/images/woman_4.webp"
										alt="community member"
										loading="lazy"
										className="size-14 rounded-full object-cover border-2 border-white shadow-md"
									/>
								</div>
							</div>

							<div className="absolute right-[-70px] bottom-[10%] hidden md:block">
								<div className="relative">
									<img
										src="/images/man_5.webp"
										alt="community member"
										loading="lazy"
										className="size-16 rounded-full object-cover border-2 border-white shadow-md"
									/>
									<img
										src="/images/woman_5.webp"
										alt="community member"
										loading="lazy"
										className="size-12 rounded-full object-cover border-2 border-white shadow-md absolute -top-6 -left-4"
									/>
								</div>
							</div>
						</div>

						<div className="relative rounded-lg sm:rounded-xl overflow-hidden group">
							<div className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-[#EBB957]/20 z-10 pointer-events-none" />
							<div className="absolute inset-0 bg-gradient-to-b from-[#28145B]/5 to-[#EBB957]/5 mix-blend-overlay opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
							<img
								src="/images/bg-1.webp"
								loading="eager"
								fetchPriority="high"
								alt="central mosque of unity"
								className="mt-2 flex aspect-[16/9] min-h-[300px] max-h-[600px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
							/>
							<div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto backdrop-blur-md bg-white/30 border border-white/30 rounded-lg px-4 py-2 transform transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
								<p className="text-[#28145B] font-medium text-sm md:text-base">
									Central Mosque of Unity, OAU Ilé-Ifẹ̀
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
