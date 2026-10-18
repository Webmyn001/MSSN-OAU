import { useState } from "react";
import { Seo } from "~/components/seo";
import { PageHeader } from "~/components/layout/PageHeader";
import { mockCommittees } from "~/lib/mocks/committees";

export default function AboutPage() {
	const [showAll, setShowAll] = useState(false);
	const committees = mockCommittees.committees;

	return (
		<>
			<Seo
				title="About Us"
				path="/about"
				description="Learn about the Muslim Students Society of Nigeria at OAU - our mission, vision, committees, and how we support Muslim students in their academic, spiritual, and personal growth."
				images={[
					{
						url: "https://i.ibb.co/H7t1bv3/about.webp",
						width: 1200,
						height: 640,
						alt: "About MSSNOAU",
					},
				]}
				keywords={[
					"MSSN OAU",
					"about MSSNOAU",
					"Muslim student community",
					"Islamic student organization",
					"MSSN committees",
					"Jihad Week Committee",
					"An-Nur Press",
					"Muslim students OAU",
					"Islamic mission and vision",
				]}
				schema={{
					"@type": "AboutPage",
					name: "About MSSNOAU",
					description:
						"Learn about the Muslim Students Society of Nigeria at OAU - our mission, vision, committees, and how we support Muslim students in their academic, spiritual, and personal growth.",
					mainEntityOfPage: {
						"@type": "WebPage",
						"@id": "https://mssnoau.org/about",
					},
					publisher: {
						"@type": "Organization",
						name: "MSSNOAU",
						logo: {
							"@type": "ImageObject",
							url: "https://mssnoau.sirv.com/mssn-logo.png",
						},
					},
				}}
			/>

			<PageHeader subtitle="Welcome to the Muslim Students' Society of Nigeria, OAU Branch — a community rooted in faith, knowledge and service.">
				About MSSNOAU
			</PageHeader>

			<div className="mt-8 mx-[10dvw] flex items-center flex-col">
				<h3 className="font-semibold text-2xl sm:text-3xl font-secondary mb-4 text-primary">
					WHO WE ARE
				</h3>
				<p className="font-primary w-full text-center">
					The Muslim Students Society of Nigeria (MSSN), Obafemi Awolowo University (MSSNOAU) is a
					branch among MSSN higher institution branches and is an inclusive platform for all Muslim
					students in the university to find spiritual expression, islamic knowledge, and fellowship
					irrespective of their backgrounds and orientation.
				</p>
				<br />
				<br />
				<p className="font-primary w-full text-center">
					At MSSNOAU, we foster a vibrant and inclusive community where every member is encouraged to
					grow and excel. Our diverse programs and activities are designed to cater to the holistic
					development of our members, ensuring they achieve academic excellence while maintaining
					strong spiritual and moral values.
				</p>
			</div>

			<div className="w-full mx-auto flex items-center flex-col mt-8 px-[10dvw]">
				<img
					src="/mssn-logo.png"
					alt="MSSNOAU Logo"
					className="w-[40dvw] max-w-[300px] p-6 border border-gray-200 rounded-xl shadow-md"
				/>
				<div className="grid grid-rows-1 sm:grid-cols-2 gap-8 text-center mt-8">
					<div className="flex flex-col gap-2">
						<h4 className="font-secondary text-primary-700 text-2xl font-semibold mb-2">
							Our Mission
						</h4>
						<p className="font-primary text-center leading-relaxed">
							To work relentlessly towards the establishment of a society that fosters all-around
							human development. To achieve this, MSSN will continuously strive towards
							strengthening Ummah educationally, emotionally, spiritually and politically through a
							wide spectrum of activities in the university and the larger society in partnership
							with like-minded organizations. To succeed, MSSN must ensure that its members are
							God-fearing, knowledgeable, united and with superior moral values.
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<h4 className="font-secondary text-primary-700 text-2xl font-semibold mb-2">
							Our Vision
						</h4>
						<p className="font-primary text-center leading-relaxed">
							To establish an Islamic Ummah governed by the principles and rules of the Shariah. To
							become a leading student organization that inspires Muslim students to become dynamic
							leaders, passionate about their faith, knowledge, and community, and to create a
							supportive environment that nurtures their overall well-being and success.
						</p>
					</div>
				</div>
			</div>

			<div className="mt-16 mb-12 px-4 md:px-8 max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="font-semibold text-3xl sm:text-4xl font-secondary mb-4 text-primary-700">
						Our Committees
					</h2>
					<p className="font-primary max-w-3xl mx-auto text-gray-600">
						The Muslim Students&apos; Society of Nigeria (MSSN), Obafemi Awolowo University Branch,
						has established various committees to cater to the diverse needs of Muslim students on
						campus. Students can join these committees to develop valuable skills and contribute
						meaningfully to the community.
					</p>
				</div>

				{committees.length > 0 ? (
					<>
						<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
							{(showAll ? committees : committees.slice(0, 3)).map((committee) => (
								<div
									key={committee.id}
									className="rounded-xl shadow-md border border-gray-100 bg-white hover:shadow-lg transition-shadow duration-300"
								>
									<div className="p-5">
										<h3 className="text-xl font-semibold font-secondary text-primary-800 mb-3">
											{committee.name}
										</h3>
										<p className="text-gray-600 text-sm mb-4">{committee.description}</p>

										{committee.objectives && committee.objectives.length > 0 ? (
											<div className="mb-4">
												<h4 className="text-sm font-semibold text-primary-700 mb-2">
													Main Objectives:
												</h4>
												<ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
													{committee.objectives.map((objective) => (
														<li key={objective}>{objective}</li>
													))}
												</ul>
											</div>
										) : null}

										<a
											href={`https://wa.me/2347076412101?text=${encodeURIComponent(
												`Assalāmu 'alaykum wa raḥmatullāhi wa barakātuh.\n\nI would like to express my interest in serving as a member of the ${committee.name}. I would be grateful if my application could be considered.\n\n\nJazākumullāhu khayran.`
											)}`}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-600"
										>
											Join this committee
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</a>
									</div>
								</div>
							))}
						</div>

						{committees.length > 3 ? (
							<div className="text-center mt-10">
								<button
									onClick={() => setShowAll((v) => !v)}
									className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-6 py-3 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
								>
									{showAll ? "Show Less" : "View All Committees"}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4 ml-2"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</button>
							</div>
						) : null}
					</>
				) : (
					<div className="text-center py-10">
						<div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-12 w-12 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-medium text-gray-800 mb-2">No Committees Available</h3>
						<p className="text-gray-500 max-w-md mx-auto">
							Committee information is currently unavailable. Please check back later.
						</p>
					</div>
				)}
			</div>
		</>
	);
}
