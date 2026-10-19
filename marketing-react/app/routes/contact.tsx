import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { ContactForm } from "~/components/forms/ContactForm";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
import { ORGANIZATION } from "~/lib/config";
import { useSiteData } from "~/lib/hooks/useSiteData";

export default function ContactPage() {
	const [info] = useSiteData("info", {} as any);
	const faqs = ((info as any)?.faqs ?? []) as { question: string; answer: string }[];

	const contactPageSchema = {
		"@type": "ContactPage",
		name: "Contact MSSNOAU",
		description:
			"Get in touch with the Muslim Students Society of Nigeria, OAU Branch. Contact our team for inquiries, feedback, or to join our community.",
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": "https://mssnoau.org/contact",
		},
		publisher: {
			"@type": "Organization",
			name: ORGANIZATION.name,
			logo: {
				"@type": "ImageObject",
				url: "https://mssnoau.sirv.com/mssn-logo.png",
			},
		},
		contactPoint: {
			"@type": "ContactPoint",
			telephone: info?.phone || "+234-000-0000-000",
			contactType: "customer service",
			email: info?.email || ORGANIZATION.email,
			areaServed: "NG",
			availableLanguage: ["English"],
		},
	};

	const faqPageSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	const combinedSchema = [contactPageSchema, faqPageSchema];

	return (
		<>
			<Seo
				title="Contact Us"
				path="/contact"
				description="Muslim Students' Society of Nigeria at Obafemi Awolowo University (OAU) is a vibrant student organization dedicated to promoting Islamic values and fostering a sense of community among Muslim students on campus."
				images={[
					{
						url: "/images/bg-1.webp",
						width: 1200,
						height: 630,
						alt: "Contact MSSNOAU",
					},
				]}
				keywords="contact MSSNOAU, MSSN contact, Muslim students contact, OAU Islamic society contact, MSSN OAU location, MSSN feedback, join MSSN OAU"
				schema={combinedSchema}
			/>

			<PageHeader subtitle="Have a question, suggestion or partnership idea? We'd love to hear from you.">
				Contact Us
			</PageHeader>

			<section className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24">
				<div className="mx-auto mb-8 max-w-3xl text-center md:mb-16">
					<h2 className="mb-4 text-3xl font-bold md:text-5xl">Get in touch with us</h2>
					<p className="mx-auto mb-8 max-w-lg text-gray-600 md:mb-12">
						Have a question, feedback, or want to connect with the Muslim Students Society of
						Nigeria, OAU Branch? We'd love to hear from you!
					</p>
				</div>

				<div className="grid gap-10 overflow-hidden rounded-2xl lg:grid-cols-2">
					<div className="flex flex-col items-center justify-center bg-primary-700/5 p-8 md:p-10">
						<div className="mb-8 flex max-w-md flex-col text-center">
							<div className="w-full font-medium text-[#0b1a2c]">You can contact us at</div>
							<p className="text-gray-600">Our team is here to help you with any questions or concerns.</p>
						</div>

						<div className="mb-8 flex flex-col gap-6 overflow-hidden md:flex-row">
							<div className="flex items-center justify-center">
								<div className="rounded-lg bg-[#f2f3f3] p-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-primary-700 size-8"
									>
										<rect width="20" height="16" x="2" y="4" rx="2" />
										<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
									</svg>
								</div>
							</div>
							<div className="max-w-xs">
								<h3 className="mb-2 text-xl font-bold">Email us</h3>
								<p className="mb-4 text-gray-600">
									Send us an email and we'll get back to you within 48 hours.
								</p>
								<a
									href={`mailto:${info?.email || ORGANIZATION.email}`}
									className="text-primary-700 font-semibold"
								>
									{info?.email || ORGANIZATION.email}
								</a>
							</div>
						</div>

						<div className="mb-8 flex flex-col gap-6 overflow-hidden md:flex-row">
							<div className="flex items-center justify-center">
								<div className="rounded-lg bg-[#f2f3f3] p-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-primary-700 size-8"
									>
										<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
								</div>
							</div>
							<div className="max-w-xs">
								<h3 className="mb-2 text-xl font-bold">Visit us</h3>
								<p className="mb-4 text-gray-600">Come by our secretariat during office hours.</p>
								<p className="font-semibold">
									{ORGANIZATION.address.street}, {ORGANIZATION.address.city},{" "}
									{ORGANIZATION.address.state}
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-6 overflow-hidden md:flex-row">
							<div className="flex items-center justify-center">
								<div className="rounded-lg bg-[#f2f3f3] p-3">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="32"
										height="32"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="text-primary-700 size-8"
									>
										<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
									</svg>
								</div>
							</div>
							<div className="max-w-xs">
								<h3 className="mb-2 text-xl font-bold">Call us</h3>
								<p className="mb-4 text-gray-600">
									Available Monday to Saturday from 9am to 5pm.
								</p>
								{info?.phone ? (
									<a href={`tel:${info.phone}`} className="text-primary-700 font-semibold">
										{info.phone}
									</a>
								) : (
									<p className="text-primary-700 font-semibold">Phone number not available</p>
								)}
							</div>
						</div>
					</div>
					<div>
						<ContactForm />
					</div>
				</div>
			</section>

			<section id="faqs" className="relative z-10 overflow-hidden px-4 py-20 pt-16 sm:px-6 lg:px-8">
				<div className="container mx-auto">
					<div className="flex flex-wrap">
						<div className="w-full px-4">
							<div className="mx-auto mb-[60px] max-w-[520px] text-center">
								<span className="mb-2 block text-lg font-semibold text-primary-700">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="inline-block h-6 w-6 mr-2 align-text-bottom"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
										/>
									</svg>
									FAQ
								</span>
								<h2 className="mb-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-[40px]">
									Frequently Asked Questions
								</h2>
								<p className="text-base text-gray-600">
									Here are the most common questions we get about the Muslim Students Society of
									Nigeria, OAU Branch.
								</p>
							</div>
						</div>
					</div>

					{faqs.length > 0 ? (
						<div className="mx-auto max-w-3xl">
							<Accordion type="multiple" className="w-full space-y-3">
								{faqs.map((faq, i) => (
									<AccordionItem
										key={faq.question}
										value={`item-${i}`}
										className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out bg-white"
									>
										<AccordionTrigger className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-medium text-gray-700 hover:bg-gray-50 rounded-t-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors hover:no-underline">
											<span className="text-base sm:text-lg">{faq.question}</span>
										</AccordionTrigger>
										<AccordionContent className="overflow-hidden text-sm text-gray-600">
											<div
												className="p-4 sm:p-5 pt-0 prose prose-sm max-w-none"
												dangerouslySetInnerHTML={{ __html: faq.answer }}
											/>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					) : (
						<p className="text-center text-gray-500">No FAQs available at the moment.</p>
					)}
				</div>
			</section>
		</>
	);
}
