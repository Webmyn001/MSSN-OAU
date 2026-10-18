import { useState, type FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { API_BASE } from "~/lib/api/base";

interface ContactFormProps {
	wrapperClass?: string;
	title?: string;
	submitLabel?: string;
	subtitle?: string;
}

interface FormData {
	fname: string;
	lname: string;
	email: string;
	phone: string;
	message: string;
}

const API_URL = `${API_BASE}/public/contact`;

const EMPTY_FORM: FormData = { fname: "", lname: "", email: "", phone: "", message: "" };

function FieldError() {
	return (
		<div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
			<svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
				<path
					fillRule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
					clipRule="evenodd"
				/>
			</svg>
		</div>
	);
}

export function ContactForm({
	wrapperClass = "max-w-lg mx-auto",
	title = "Contact Form",
	submitLabel = "Submit Message",
	subtitle = "We'll try to get back to you as soon as possible Insha'Allah.",
}: ContactFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
	const [touched, setTouched] = useState({
		fname: false,
		lname: false,
		phone: false,
		message: false,
	});

	function setField(field: keyof FormData, value: string) {
		setFormData((prev) => ({ ...prev, [field]: value }));
	}

	function handleBlur(field: keyof typeof touched) {
		setTouched((prev) => ({ ...prev, [field]: true }));
	}

	function getFieldState(field: keyof typeof touched): "" | "valid" | "invalid" {
		if (!touched[field]) return "";
		if (field === "fname" || field === "lname")
			return formData[field].trim().length > 0 ? "valid" : "invalid";
		if (field === "phone") return formData.phone.trim().length > 8 ? "valid" : "invalid";
		if (field === "message") return formData.message.trim().length > 10 ? "valid" : "invalid";
		return "";
	}

	function inputClass(field: keyof typeof touched) {
		const base =
			"py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm";
		const state = getFieldState(field);
		if (state === "invalid") return `${base} border-red-300 focus:border-red-500 focus:ring-red-500`;
		if (state === "valid") return `${base} border-green-300 focus:border-green-500 focus:ring-green-500`;
		return base;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setTouched({ fname: true, lname: true, phone: true, message: true });

		const isValid =
			formData.fname.trim().length > 0 &&
			formData.lname.trim().length > 0 &&
			formData.phone.trim().length > 8 &&
			formData.message.trim().length > 10;

		if (!isValid) {
			setFormError("Please fill in all required fields correctly.");
			return;
		}

		setIsSubmitting(true);
		setFormError(null);

		try {
			const res = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error((err as { message?: string })?.message || "Failed to send message");
			}

			setIsSubmitted(true);
			setFormData(EMPTY_FORM);
			setTouched({ fname: false, lname: false, phone: false, message: false });
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className={wrapperClass}>
			<div
				id="form"
				className="flex flex-col border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-md bg-white/80 backdrop-blur-sm"
			>
				<h2 className="mb-2 text-xl font-semibold font-secondary text-primary-700">{title}</h2>
				<p className="mb-6 text-sm text-gray-600">{subtitle}</p>

				{isSubmitted ? (
					<div className="text-center py-8 px-4">
						<div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-green-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
						<p className="text-gray-600 mb-6">
							Your message has been sent successfully. We'll get back to you soon.
						</p>
						<Button variant="outline" onClick={() => setIsSubmitted(false)}>
							Send Another Message
						</Button>
					</div>
				) : (
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4 lg:gap-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
								<div>
									<label
										htmlFor="fname"
										className="block mb-2 text-sm text-gray-700 font-medium font-primary"
									>
										First Name <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type="text"
											required
											autoComplete="given-name"
											name="fname"
											id="fname"
											className={inputClass("fname")}
											value={formData.fname}
											onChange={(e) => setField("fname", e.target.value)}
											onBlur={() => handleBlur("fname")}
										/>
										{getFieldState("fname") === "invalid" ? <FieldError /> : null}
									</div>
									{getFieldState("fname") === "invalid" ? (
										<p className="mt-1 text-xs text-red-600">Please enter your first name</p>
									) : null}
								</div>

								<div>
									<label
										htmlFor="lname"
										className="block mb-2 text-sm text-gray-700 font-medium font-primary"
									>
										Last Name <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type="text"
											required
											autoComplete="family-name"
											name="lname"
											id="lname"
											className={inputClass("lname")}
											value={formData.lname}
											onChange={(e) => setField("lname", e.target.value)}
											onBlur={() => handleBlur("lname")}
										/>
										{getFieldState("lname") === "invalid" ? <FieldError /> : null}
									</div>
									{getFieldState("lname") === "invalid" ? (
										<p className="mt-1 text-xs text-red-600">Please enter your last name</p>
									) : null}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
								<div>
									<label
										htmlFor="email"
										className="block mb-2 text-sm text-gray-700 font-medium font-primary"
									>
										Email [optional]
									</label>
									<input
										type="email"
										name="email"
										id="email"
										autoComplete="email"
										className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
										value={formData.email}
										onChange={(e) => setField("email", e.target.value)}
									/>
								</div>

								<div>
									<label
										htmlFor="phone"
										className="block mb-2 text-sm text-gray-700 font-medium font-primary"
									>
										Phone Number <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type="tel"
											required
											autoComplete="mobile tel"
											name="phone"
											id="phone"
											className={inputClass("phone")}
											value={formData.phone}
											onChange={(e) => setField("phone", e.target.value)}
											onBlur={() => handleBlur("phone")}
										/>
										{getFieldState("phone") === "invalid" ? <FieldError /> : null}
									</div>
									{getFieldState("phone") === "invalid" ? (
										<p className="mt-1 text-xs text-red-600">Please enter a valid phone number</p>
									) : null}
								</div>
							</div>

							<div>
								<label
									htmlFor="message"
									className="block mb-2 text-sm text-gray-700 font-medium font-primary"
								>
									Message <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<textarea
										id="message"
										required
										name="message"
										rows={5}
										className={inputClass("message")}
										value={formData.message}
										onChange={(e) => setField("message", e.target.value)}
										onBlur={() => handleBlur("message")}
									/>
									{getFieldState("message") === "invalid" ? (
										<div className="absolute top-3 right-3 pointer-events-none">
											<svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
									) : null}
								</div>
								{getFieldState("message") === "invalid" ? (
									<p className="mt-1 text-xs text-red-600">
										Please enter a message (at least 10 characters)
									</p>
								) : null}
							</div>
						</div>

						{formError ? (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
								<div className="flex items-center gap-2">
									<svg className="h-5 w-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									<p>{formError}</p>
								</div>
							</div>
						) : null}

						<div className="mt-6">
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										<span>Processing...</span>
									</>
								) : (
									submitLabel
								)}
							</Button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}
