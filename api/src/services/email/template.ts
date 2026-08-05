/**
 * * Shared branded email layout for all MSSN OAU transactional emails.
 * * Uses the same logo and brand colors as the marketing site so every
 * * email (OTP, password reset, newsletter) looks consistent.
 */

const BRAND = {
	primary: '#115F34', // hsl(147 70% 22%) — site primary-700
	primaryDark: '#0a3d22', // site primary-900
	gold: '#EBB957', // hero accent
	lightBg: '#f0f7f2',
	border: '#e3ece6',
	text: '#1f2937',
	muted: '#6b7280',
	white: '#ffffff'
}

// Logo asset deployed alongside the marketing site. PNG is used for maximum
// email client compatibility (Outlook/GMail render webp inconsistently).
export const EMAIL_LOGO_URL = 'https://mssn-oau.vercel.app/mssn-logo.png'
export const EMAIL_SITE_URL = 'https://mssn-oau.vercel.app'

export function emailHeader(title: string): string {
	return `
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.primaryDark}; border-radius:12px 12px 0 0;">
			<tr>
				<td align="center" style="padding:28px 24px 20px;">
					<img src="${EMAIL_LOGO_URL}" alt="MSSN OAU" width="72" height="72" style="display:block; margin:0 auto 12px; max-width:72px; height:auto; border:0; outline:none; text-decoration:none;" />
					<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:20px; font-weight:700; color:${BRAND.white}; letter-spacing:0.5px;">MSSN OAU</div>
					<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:11px; font-weight:600; color:${BRAND.gold}; letter-spacing:2px; margin-top:4px; text-transform:uppercase;">Muslim Students' Society of Nigeria</div>
				</td>
			</tr>
			<tr>
				<td style="padding:0 24px 16px;" align="center">
					<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td style="border-bottom:2px solid ${BRAND.gold};"></td></tr></table>
				</td>
			</tr>
			<tr>
				<td align="center" style="padding:0 24px 20px;">
					<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; font-weight:600; color:${BRAND.white};">${title}</div>
				</td>
			</tr>
		</table>
	`
}

export function emailFooter(): string {
	return `
		<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightBg}; border-radius:0 0 12px 12px; border-top:1px solid ${BRAND.border};">
			<tr>
				<td align="center" style="padding:20px 24px;">
					<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:11px; color:${BRAND.muted}; line-height:1.7;">
						MSSN OAU Secretariat &middot; Fajuyi Hall &middot; Obafemi Awolowo University &middot; Ile-Ife, Osun State, Nigeria<br/>
						<a href="${EMAIL_SITE_URL}" style="color:${BRAND.primary}; text-decoration:none;">mssn-oau.vercel.app</a>
					</div>
				</td>
			</tr>
		</table>
	`
}

/**
 * * Wraps inner HTML content in the full branded email shell.
 */
export function brandEmail(title: string, content: string): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="x-apple-disable-message-reformatting" />
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
			<title>${title}</title>
		</head>
		<body style="margin:0; padding:0; background-color:${BRAND.lightBg};">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightBg}; padding:24px 12px;">
				<tr>
					<td align="center">
						<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:${BRAND.white}; border-radius:12px; border:1px solid ${BRAND.border}; box-shadow:0 2px 8px rgba(17,95,52,0.06);">
							<tr><td style="padding:0;">${emailHeader(title)}</td></tr>
							<tr>
								<td style="padding:28px 28px 32px; font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; color:${BRAND.text}; line-height:1.7;">
									${content}
								</td>
							</tr>
							<tr><td style="padding:0;">${emailFooter()}</td></tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`
}

export function emailButton(label: string, href: string): string {
	return `
		<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 8px;">
			<tr>
				<td align="center" style="background-color:${BRAND.primary}; border-radius:8px; padding:12px 28px;">
					<a href="${href}" style="display:inline-block; color:${BRAND.white}; font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; font-weight:700; text-decoration:none; letter-spacing:0.3px;">${label}</a>
				</td>
			</tr>
		</table>
	`
}
