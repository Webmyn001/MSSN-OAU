import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Image } from "~/components/ui/image";

const NAV_LINKS = [
	{ path: "/", label: "Home" },
	{ path: "/about", label: "About Us" },
	{ path: "/blog", label: "Blog" },
	{ path: "/events", label: "Events" },
];

const MENU_GROUPS = [
	{
		title: "Community",
		links: [
			{
				href: "/our-excos",
				label: "Our Executives",
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4 me-2 text-primary-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
				),
			},
			{
				href: "/our-advisors",
				label: "Our Advisers",
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4 me-2 text-primary-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
						<circle cx="17" cy="7" r="5" />
					</svg>
				),
			},
			{
				href: "/alumni",
				label: "Past Ameer and Ameerah",
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4 me-2 text-primary-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M2 3h20" />
						<path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
						<path d="m7 21 5-5 5 5" />
					</svg>
				),
			},
		],
	},
	{
		title: "Resources",
		links: [
			{
				href: "/al-mamharah",
				label: "Al-Mamharah",
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4 me-2 text-primary-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
						<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
					</svg>
				),
			},
			{
				href: "/annual-dues",
				label: "Annual Dues",
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4 me-2 text-primary-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
					</svg>
				),
			},
		],
	},
	{
		title: "Support",
		links: [
			{
				href: "/contact#faqs",
				label: "FAQs",
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-4 me-2 text-primary-600"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
						<path d="M12 17h.01" />
					</svg>
				),
			},
		],
	},
];

function useClickOutside(onOutside: () => void) {
	const ref = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		function handleClick(event: MouseEvent) {
			if (ref.current && event.target && !ref.current.contains(event.target as Node)) {
				onOutside();
			}
		}
		document.addEventListener("click", handleClick, true);
		return () => document.removeEventListener("click", handleClick, true);
	}, [onOutside]);
	return ref;
}

export function NavBar() {
	const location = useLocation();
	const currentPath = location.pathname || "/";

	const [isOpen, setIsOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [innerWidth, setInnerWidth] = useState(0);

	useEffect(() => {
		setIsOpen(false);
		setIsDropdownOpen(false);
	}, [currentPath]);

	useEffect(() => {
		setInnerWidth(window.innerWidth);
		const updateWidth = () => {
			setInnerWidth(window.innerWidth);
			if (window.innerWidth >= 1024) {
				setIsOpen(false);
				setIsDropdownOpen(false);
			}
		};
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	const dropdownRef = useClickOutside(() => setIsDropdownOpen(false));

	function isActive(path: string) {
		if (path === "/") return currentPath === path;
		return currentPath.startsWith(path);
	}

	const showMenu = isOpen || innerWidth >= 1024;

	return (
		<header className="flex flex-wrap lg:justify-start lg:flex-nowrap z-50 w-full py-3 lg:py-0 border-b bg-gradient-to-r from-white via-white to-primary-50 shadow-md">
			<nav className="max-w-[85rem] w-full mx-auto px-4 md:px-6 lg:px-8">
				<div className="relative lg:flex lg:items-center">
					<div className="flex items-center justify-between w-full lg:w-auto">
						<div className="relative flex items-center">
							<Link className="flex-none flex items-center gap-2 py-2" to="/" aria-label="MSSNOAU">
								<div className="relative">
									<Image
										src="/mssn-logo.webp"
										width={240}
										height={45}
										className="my-4 h-10 lg:h-12 w-auto max-w-[200px] lg:max-w-[240px] object-contain transition-transform hover:scale-105 duration-300"
										alt="MSSNOAU logo"
										fetchpriority="high"
										loading="eager"
									/>
									<div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-600 rounded-full" />
								</div>
								<span className="sr-only">
									Muslim Students Society of Nigeria, OAU Branch
								</span>
							</Link>
						</div>

							<button
								type="button"
								className="lg:hidden p-2 inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white text-primary-800 hover:bg-primary-50"
								onClick={() => setIsOpen((v) => !v)}
								aria-expanded={isOpen}
								aria-controls="navbar-menu"
								aria-label="Toggle navigation"
							>
								{!isOpen ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<line x1="3" x2="21" y1="6" y2="6" />
										<line x1="3" x2="21" y1="12" y2="12" />
										<line x1="3" x2="21" y1="18" y2="18" />
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M18 6 6 18" />
										<path d="m6 6 12 12" />
									</svg>
								)}
							</button>
					</div>

					{showMenu ? (
						<div
							id="navbar-menu"
							className={`w-full lg:block lg:h-auto z-[51] ${isOpen ? "bg-white pb-5 lg:pb-0" : ""}`}
						>
							<div className="flex flex-col gap-y-3 lg:gap-y-0 mt-5 lg:flex-row lg:items-center lg:justify-end lg:mt-0 lg:ps-5">
								{NAV_LINKS.map((link) => (
									<Link
										key={link.path}
										className={`lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center ${
											isActive(link.path) ? "text-primary-700" : ""
										}`}
										to={link.path}
										aria-current={isActive(link.path) ? "page" : undefined}
									>
										<span>{link.label}</span>
										{isActive(link.path) ? (
											<div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block" />
										) : null}
									</Link>
								))}

								<Link
									className="lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center"
									to="/#prayer-times"
								>
									<span>Prayer Times</span>
								</Link>

								<div className="relative" ref={dropdownRef}>
									<button
										type="button"
										className="lg:px-3 lg:py-5 flex items-center w-full font-secondary font-medium text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200"
										onClick={() => setIsDropdownOpen((v) => !v)}
										aria-expanded={isDropdownOpen}
										aria-haspopup="true"
									>
										More
										<svg
											className={`ms-2 size-4 transition-transform duration-300 ${
												isDropdownOpen ? "rotate-180" : ""
											}`}
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="m6 9 6 6 6-6" />
										</svg>
									</button>

									{isDropdownOpen ? (
										<div
											className="absolute z-[52] right-0 mt-2 w-64 lg:w-auto bg-white/95 backdrop-blur-md shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] border border-primary-100/50 rounded-xl py-3 px-3 transition-all duration-300 transform origin-top-right"
											role="menu"
										>
											<div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:min-w-[600px]">
												{MENU_GROUPS.map((group, index) => (
													<div
														key={group.title}
														className={`flex flex-col space-y-1 ${
															index > 0 ? "mt-3 lg:mt-0" : ""
														}`}
													>
														<div className="px-3 py-2 text-xs font-semibold text-primary-600 uppercase tracking-wider">
															{group.title}
														</div>
														{group.links.map((item) => (
															<Link
																key={item.href}
																className="flex items-center py-2 px-3 rounded-lg text-sm font-primary text-gray-800 hover:bg-primary-50 hover:text-primary-700 transition-colors"
																to={item.href}
															>
																{item.icon}
																{item.label}
															</Link>
														))}
													</div>
												))}
											</div>

											<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 rounded-b-xl" />
										</div>
									) : null}
								</div>

								<Link
									className={`lg:px-3 lg:py-5 font-medium font-secondary relative text-gray-700 hover:text-primary-700 transition-colors ease-in-out duration-200 flex gap-1.5 items-center ${
										isActive("/contact") ? "text-primary-700" : ""
									}`}
									to="/contact"
									aria-current={isActive("/contact") ? "page" : undefined}
								>
									<span>Contact Us</span>
									{isActive("/contact") ? (
										<div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 hidden lg:block" />
									) : null}
								</Link>
							</div>
						</div>
					) : null}
				</div>
			</nav>
		</header>
	);
}
