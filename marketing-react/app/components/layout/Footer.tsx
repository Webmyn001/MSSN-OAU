import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Image } from "~/components/ui/image";
import { API_BASE } from "~/lib/api/base";

const ABOUT_LINKS = [
	{ href: "/about", label: "About Us" },
	{ href: "/our-excos", label: "Our Excos" },
	{ href: "/our-advisors", label: "Our Advisors" },
	{ href: "/programmes", label: "Programmes" },
	{ href: "/al-mamharah", label: "Al Mamharah" },
	{ href: "/events", label: "Events" },
	{ href: "/contact", label: "FAQs & Contact Us" },
];

const QUICK_LINKS = [
	{ href: "/blog", label: "Blog" },
	{ href: "/#prayer-times", label: "Prayer Times" },
	{ href: "https://status.mssnoau.org/", label: "Status" },
];

const SOCIALS = [
	{
		label: "Facebook",
		href: "https://facebook.com/mssnoau",
		path: "M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z",
	},
	{
		label: "X (formerly twitter)",
		href: "https://x.com/Mssngreatife1",
		path: "M18.42,14.009L27.891,3h-2.244l-8.224,9.559L10.855,3H3.28l9.932,14.455L3.28,29h2.244l8.684-10.095,6.936,10.095h7.576l-10.301-14.991h0Zm-3.074,3.573l-1.006-1.439L6.333,4.69h3.447l6.462,9.243,1.006,1.439,8.4,12.015h-3.447l-6.854-9.804h0Z",
	},
	{
		label: "Instagram",
		href: "https://www.instagram.com/mssn_oau",
		path: "M10.202,2.098c-1.49,.07-2.507,.308-3.396,.657-.92,.359-1.7,.84-2.477,1.619-.776,.779-1.254,1.56-1.61,2.481-.345,.891-.578,1.909-.644,3.4-.066,1.49-.08,1.97-.073,5.771s.024,4.278,.096,5.772c.071,1.489,.308,2.506,.657,3.396,.359,.92,.84,1.7,1.619,2.477,.779,.776,1.559,1.253,2.483,1.61,.89,.344,1.909,.579,3.399,.644,1.49,.065,1.97,.08,5.771,.073,3.801-.007,4.279-.024,5.773-.095s2.505-.309,3.395-.657c.92-.36,1.701-.84,2.477-1.62s1.254-1.561,1.609-2.483c.345-.89,.579-1.909,.644-3.398,.065-1.494,.081-1.971,.073-5.773s-.024-4.278-.095-5.771-.308-2.507-.657-3.397c-.36-.92-.84-1.7-1.619-2.477s-1.561-1.254-2.483-1.609c-.891-.345-1.909-.58-3.399-.644s-1.97-.081-5.772-.074-4.278,.024-5.771,.096m.164,25.309c-1.365-.059-2.106-.286-2.6-.476-.654-.252-1.12-.557-1.612-1.044s-.795-.955-1.05-1.608c-.192-.494-.423-1.234-.487-2.599-.069-1.475-.084-1.918-.092-5.656s.006-4.18,.071-5.656c.058-1.364,.286-2.106,.476-2.6,.252-.655,.556-1.12,1.044-1.612s.955-.795,1.608-1.05c.493-.193,1.234-.422,2.598-.487,1.476-.07,1.919-.084,5.656-.092,3.737-.008,4.181,.006,5.658,.071,1.364,.059,2.106,.285,2.599,.476,.654,.252,1.12,.555,1.612,1.044s.795,.954,1.051,1.609c.193,.492,.422,1.232,.486,2.597,.07,1.476,.086,1.919,.093,5.656,.007,3.737-.006,4.181-.071,5.656-.06,1.365-.286,2.106-.476,2.601-.252,.654-.556,1.12-1.045,1.612s-.955,.795-1.608,1.05c-.493,.192-1.234,.422-2.597,.487-1.476,.069-1.919,.084-5.657,.092s-4.18-.007-5.656-.071M21.779,8.517c.002,.928,.755,1.679,1.683,1.677s1.679-.755,1.677-1.683c-.002-.928-.755-1.679-1.683-1.677,0,0,0,0,0,0-.928,.002-1.678,.755-1.677,1.683m-12.967,7.496c.008,3.97,3.232,7.182,7.202,7.174s7.183-3.232,7.176-7.202c-.008-3.97-3.233-7.183-7.203-7.175s-7.182,3.233-7.174,7.203m2.522-.005c-.005-2.577,2.08-4.671,4.658-4.676,2.577-.005,4.671,2.08,4.676,4.658,.005,2.577-2.08,4.671-4.658,4.676-2.577,.005-4.671-2.079-4.676-4.656h0",
	},
	{
		label: "YouTube",
		href: "/",
		path: "M31.331,8.248c-.368-1.386-1.452-2.477-2.829-2.848-2.496-.673-12.502-.673-12.502-.673,0,0-10.007,0-12.502,.673-1.377,.37-2.461,1.462-2.829,2.848-.669,2.512-.669,7.752-.669,7.752,0,0,0,5.241,.669,7.752,.368,1.386,1.452,2.477,2.829,2.847,2.496,.673,12.502,.673,12.502,.673,0,0,10.007,0,12.502-.673,1.377-.37,2.461-1.462,2.829-2.847,.669-2.512,.669-7.752,.669-7.752,0,0,0-5.24-.669-7.752ZM12.727,20.758V11.242l8.364,4.758-8.364,4.758Z",
	},
];

export function Footer() {
	const [email, setEmail] = useState("");

	async function subscribe(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const userEmail = email.trim().toLowerCase();
		if (!userEmail || !userEmail.includes("@")) {
			toast.error("Please enter a valid email address.");
			return;
		}
		try {
			const res = await fetch(`${API_BASE}/public/newsletter/subscribe`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: userEmail }),
			});
			const json = await res.json();
			if (json.success) {
				toast.success(json.data?.message || "Successfully subscribed to our newsletter!");
				setEmail("");
			} else {
				toast.error(json.error || "Subscription failed. Try again.");
			}
		} catch {
			toast.error("Unable to connect to subscription server.");
		}
	}

	return (
		<footer className="mt-auto relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-white to-primary-50" />
			<div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
			<div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/5 rounded-full blur-3xl" />
			<div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-[0.03] mix-blend-overlay" />

			<div className="relative mt-auto w-full max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 lg:pt-20 mx-auto">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
					<div className="col-span-full lg:col-span-1">
						<Link
							className="flex-none text-xl font-semibold focus:outline-none focus:opacity-80 group"
							to="/"
							aria-label="MSSNOAU Logo"
						>
							<div className="relative">
								<Image
									src="/mssn-logo.webp"
									className="h-12 w-auto transform transition-transform duration-300 group-hover:scale-105"
									alt="MSSNOAU Logo"
									width={240}
									height={45}
								/>
								<div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary-600 rounded-full" />
							</div>
						</Link>

						<p className="mt-6 text-gray-600 text-sm leading-relaxed">
							The Muslim Students' Society of Nigeria (MSSN) at Obafemi Awolowo University (Great
							Ìfẹ́) is a strong and vibrant student organization dedicated to promoting Islamic
							values and strengthening the bonds of brotherhood and community.
						</p>
					</div>

					<div className="col-span-1">
						<h2 className="font-semibold text-primary-700 font-primary mb-4 relative inline-block">
							About Us
							<span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-700/70 rounded-full" />
						</h2>
						<div className="mt-3 grid space-y-3 font-secondary">
							{ABOUT_LINKS.map((link) => (
								<p key={link.href}>
									<Link
										className="inline-flex gap-x-2 text-gray-700 hover:text-primary-700 transition-colors"
										to={link.href}
									>
										{link.label}
									</Link>
								</p>
							))}
						</div>
					</div>

					<div className="col-span-1">
						<h2 className="font-semibold text-primary-700 font-primary mb-4 relative inline-block">
							Quick Links
							<span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-700/70 rounded-full" />
						</h2>
						<div className="mt-3 grid space-y-3 font-secondary">
							{QUICK_LINKS.map((link) => (
								<p key={link.href}>
									{link.href.startsWith("http") ? (
										<a
											className="inline-flex gap-x-2 text-gray-700 hover:text-primary-700 transition-colors"
											href={link.href}
											target="_blank"
											rel="noreferrer"
										>
											{link.label}
										</a>
									) : (
										<Link
											className="inline-flex gap-x-2 text-gray-700 hover:text-primary-700 transition-colors"
											to={link.href}
										>
											{link.label}
										</Link>
									)}
								</p>
							))}
						</div>
					</div>

					<div className="col-span-2">
						<h2 className="font-semibold text-primary-700 font-primary mb-4 relative inline-block">
							Join our Newsletter
							<span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary-700/70 rounded-full" />
						</h2>

							<form onSubmit={subscribe}>
								<div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm border border-primary-100/50">
									<div className="w-full">
										<label htmlFor="footer-email-input" className="sr-only">
											Subscribe
										</label>
										<input
											type="email"
											id="footer-email-input"
											name="email"
											required
											className="py-3 px-4 block w-full border-transparent rounded-xl text-sm focus:border-primary-700 focus:ring-primary-700 disabled:opacity-50 disabled:pointer-events-none"
											placeholder="Enter your email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<button
										type="submit"
										className="w-full font-secondary sm:w-auto whitespace-nowrap p-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-xl border border-transparent bg-primary-700 text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-all"
									>
										Subscribe
									</button>
								</div>
								<p className="mt-3 text-sm font-secondary text-gray-600">
									Only Events, Blog Posts and Press Releases.
								</p>
							</form>
					</div>
				</div>

				<div className="mt-8 sm:mt-12 grid gap-y-2 sm:gap-y-0 sm:flex sm:justify-between sm:items-center pt-8 border-t border-primary-100/30">
					<div className="flex justify-between items-center">
						<p className="text-sm text-primary-800 font-secondary">
							© {new Date().getFullYear()} MSSNOAU - The Muslim Student Society of Nigeria, Great
							Ìfẹ́.
						</p>
					</div>

					<div className="flex gap-2">
						{SOCIALS.map((social) => (
							<a
								key={social.label}
								aria-label={social.label}
								className="size-10 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-primary-700 hover:bg-primary-50 focus:outline-none focus:bg-primary-50 disabled:opacity-50 disabled:pointer-events-none transition-colors duration-200"
								href={social.href}
							>
								<svg
									className="shrink-0 size-5"
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 32 32"
								>
									<path d={social.path} />
								</svg>
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
