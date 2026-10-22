import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitApplication } from "~/lib/api/al-mamharah";
import {
	MASAR_OPTIONS,
	START_OPTIONS,
	START_DIRECTION_OPTIONS,
	TAJWEED_TRACK_OPTIONS,
	startPageForSurah,
} from "~/lib/data/al-mamharah";

const inputClass =
	"py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm";
const labelClass = "block mb-2 text-sm text-gray-700 font-medium font-primary";

interface FormData {
	fullName: string;
	email: string;
	phone: string;
	matricNumber: string;
	faculty: string;
	department: string;
	masar: string;
	startSurah: string;
	startDirection: string;
	tajweedTrack: string;
	confirmedMemorisation: boolean;
	confirmedTajweed: boolean;
	agreedGuidelines: boolean;
}

const initialForm: FormData = {
	fullName: "",
	email: "",
	phone: "",
	matricNumber: "",
	faculty: "",
	department: "",
	masar: "",
	startSurah: "",
	startDirection: "",
	tajweedTrack: "",
	confirmedMemorisation: false,
	confirmedTajweed: false,
	agreedGuidelines: false,
};

export function ApplicationForm({
	onSubmitted,
}: {
	onSubmitted?: (payload: any) => void;
}) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormData>(initialForm);

	function update<K extends keyof FormData>(key: K, value: FormData[K]) {
		setFormData((prev) => ({ ...prev, [key]: value }));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);

		if (!formData.masar) {
			setFormError("Please choose a masār (revision track).");
			return;
		}
		if (!formData.startSurah) {
			setFormError("Please choose where you would like to start revising.");
			return;
		}
		if (!formData.startDirection) {
			setFormError("Please choose your revision direction.");
			return;
		}
		if (
			!formData.confirmedMemorisation ||
			!formData.confirmedTajweed ||
			!formData.agreedGuidelines
		) {
			setFormError("Please confirm all eligibility statements and agree to the guidelines.");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await submitApplication({
				fullName: formData.fullName.trim(),
				email: formData.email.trim(),
				phone: formData.phone.trim() || undefined,
				matricNumber: formData.matricNumber.trim(),
				faculty: formData.faculty.trim(),
				department: formData.department.trim(),
				masar: formData.masar,
				startSurah: formData.startSurah,
				startPage: startPageForSurah(formData.startSurah),
				startDirection: formData.startDirection,
				tajweedTrack: formData.tajweedTrack || undefined,
				confirmedMemorisation: formData.confirmedMemorisation,
				confirmedTajweed: formData.confirmedTajweed,
				agreedGuidelines: formData.agreedGuidelines,
			});
			setSubmissionMessage(result.data?.message ?? "Your application has been received.");
			toast.success("Application submitted successfully.");
			onSubmitted?.(result.data);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Something went wrong. Please try again.";
			setFormError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div
			id="apply"
			className="flex flex-col rounded-xl border border-gray-200 bg-white/90 p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8"
		>
			<h2 className="mb-2 font-secondary text-xl font-semibold text-primary-700">
				Apply to Al Mamharah
			</h2>
			<p className="mb-6 text-sm text-gray-600">
				Submit your details and the Programme Manager will review your application.
			</p>

			{submissionMessage ? (
				<div className="py-8 text-center">
					<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
						<CheckCircle2 className="size-8 text-green-600" />
					</div>
					<h3 className="mb-2 text-lg font-medium text-gray-900">Application received</h3>
					<p className="mx-auto mb-6 max-w-md text-sm text-gray-600">{submissionMessage}</p>
					<p className="text-xs text-gray-500">
						Once approved, you will be able to enter the programme using your full name and a
						code sent to your email.
					</p>
				</div>
			) : (
				<form onSubmit={handleSubmit} className="grid gap-4 lg:gap-5">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
						<div>
							<label className={labelClass} htmlFor="almh-fullName">
								Full Name <span className="text-red-500">*</span>
							</label>
							<input
								id="almh-fullName"
								name="fullName"
								type="text"
								required
								autoComplete="name"
								className={inputClass}
								value={formData.fullName}
								onChange={(e) => update("fullName", e.target.value)}
								placeholder="As it should appear on your certificate"
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="almh-matric">
								Matriculation Number <span className="text-red-500">*</span>
							</label>
							<input
								id="almh-matric"
								name="matricNumber"
								type="text"
								required
								className={inputClass}
								value={formData.matricNumber}
								onChange={(e) => update("matricNumber", e.target.value)}
								placeholder="e.g. HCS/2021/001"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
						<div>
							<label className={labelClass} htmlFor="almh-email">
								Email Address <span className="text-red-500">*</span>
							</label>
							<input
								id="almh-email"
								name="email"
								type="email"
								required
								autoComplete="email"
								className={inputClass}
								value={formData.email}
								onChange={(e) => update("email", e.target.value)}
								placeholder="you@example.com"
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="almh-phone">
								Phone Number <span className="text-gray-400">(optional)</span>
							</label>
							<input
								id="almh-phone"
								name="phone"
								type="tel"
								autoComplete="tel"
								className={inputClass}
								value={formData.phone}
								onChange={(e) => update("phone", e.target.value)}
								placeholder="e.g. 0803 000 0000"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
						<div>
							<label className={labelClass} htmlFor="almh-faculty">
								Faculty <span className="text-red-500">*</span>
							</label>
							<input
								id="almh-faculty"
								name="faculty"
								type="text"
								required
								className={inputClass}
								value={formData.faculty}
								onChange={(e) => update("faculty", e.target.value)}
								placeholder="e.g. Faculty of Science"
							/>
						</div>
						<div>
							<label className={labelClass} htmlFor="almh-department">
								Department <span className="text-red-500">*</span>
							</label>
							<input
								id="almh-department"
								name="department"
								type="text"
								required
								className={inputClass}
								value={formData.department}
								onChange={(e) => update("department", e.target.value)}
								placeholder="e.g. Computer Science"
							/>
						</div>
					</div>

					<div>
						<label className={labelClass} htmlFor="almh-masar">
							Masār (Revision Track) <span className="text-red-500">*</span>
						</label>
						<select
							id="almh-masar"
							name="masar"
							required
							className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm appearance-none bg-white"
							value={formData.masar}
							onChange={(e) => update("masar", e.target.value)}
						>
							<option value="" disabled>
								Select your daily target
							</option>
							{MASAR_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className={labelClass} htmlFor="almh-startSurah">
							Where would you like to start revising?{" "}
							<span className="text-red-500">*</span>
						</label>
						<select
							id="almh-startSurah"
							name="startSurah"
							required
							className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm appearance-none bg-white"
							value={formData.startSurah}
							onChange={(e) => update("startSurah", e.target.value)}
						>
							<option value="" disabled>
								Select a surah
							</option>
							{START_OPTIONS.map((option) => (
								<option key={option.number} value={option.value}>
										{option.number}. {option.value} (page {option.page})
								</option>
							))}
						</select>
						<p className="mt-1 text-xs text-gray-500">
							Your daily target will be shown from this point in the mushaf.
						</p>
					</div>

					<div>
						<label className={labelClass} htmlFor="almh-startDirection">
							Revision direction <span className="text-red-500">*</span>
						</label>
						<select
							id="almh-startDirection"
							name="startDirection"
							required
							className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm appearance-none bg-white"
							value={formData.startDirection}
							onChange={(e) => update("startDirection", e.target.value)}
						>
							<option value="" disabled>
								Select your track
							</option>
							{START_DIRECTION_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<p className="mt-1 text-xs text-gray-500">
							Upward moves toward the end of the mushaf; downward walks back toward the
							beginning.
						</p>
					</div>

					<div>
						<label className={labelClass} htmlFor="almh-tajweedTrack">
							Tajweed track <span className="font-normal text-gray-400">(optional)</span>
						</label>
						<select
							id="almh-tajweedTrack"
							name="tajweedTrack"
							className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-primary-600 focus:ring-primary-600 disabled:opacity-50 shadow-sm appearance-none bg-white"
							value={formData.tajweedTrack}
							onChange={(e) => update("tajweedTrack", e.target.value)}
						>
							<option value="">None, muroja&apos;ah only</option>
							{TAJWEED_TRACK_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}, {option.lines} lines
								</option>
							))}
						</select>
						<p className="mt-1 text-xs text-gray-500">
							Optional. You will record one line per day from your matn alongside the
							muroja&apos;ah. Choosing Al Jazariyyah or Shaṭibiyyah requires a short placement
							check on the preceding matn after approval.
						</p>
					</div>

					<div className="space-y-3 rounded-lg border border-primary-100 bg-primary-50/50 p-4">
						<label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
							<input
								type="checkbox"
								className="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
								checked={formData.confirmedMemorisation}
								onChange={(e) => update("confirmedMemorisation", e.target.checked)}
							/>
							<span>I confirm that I have memorised at least 15 ajzāʼ of the Qurʼān.</span>
						</label>
						<label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
							<input
								type="checkbox"
								className="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
								checked={formData.confirmedTajweed}
								onChange={(e) => update("confirmedTajweed", e.target.checked)}
							/>
							<span>
								I confirm that I have studied tajwīd and can recite with correct pronunciation.
							</span>
						</label>
						<label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
							<input
								type="checkbox"
								className="mt-0.5 size-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
								checked={formData.agreedGuidelines}
								onChange={(e) => update("agreedGuidelines", e.target.checked)}
							/>
							<span>I have read and agree to the programme guidelines.</span>
						</label>
					</div>

					{formError ? (
						<div className="mt-1 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							<AlertCircle className="mt-0.5 size-4 shrink-0" />
							<p>{formError}</p>
						</div>
					) : null}

					<div className="mt-2">
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 size-4 animate-spin" />
									<span>Submitting...</span>
								</>
							) : (
								"Submit Application"
							)}
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
