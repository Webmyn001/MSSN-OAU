import { brandEmail, emailButton } from '../services/email/template'

/**
 * * Generates password reset email content
 * @param name - User's name
 * @param resetLink - Password reset link with token
 * @returns Email content with subject, text, and HTML
 */
export function generatePasswordResetEmail(name: string, resetLink: string) {
	const subject = 'Password Reset Request | MSSN OAU'

	const text = `Hi ${name},

Someone requested a password reset for your MSSN account. If this was you, click the link below to reset your password:

${resetLink}

This link will expire in 15 minutes.

If you didn't request a password reset, please ignore this email or contact the MSSN OAU secretariat if you have concerns.

Thanks,
The MSSN OAU Team`

	const html = brandEmail(
		'Password Reset Request',
		`
			<p style="margin:0 0 16px;">Assalamu 'alaykum ${name},</p>
			<p style="margin:0 0 16px;">We received a request to reset the password for your <strong>MSSN OAU</strong> account. Click the button below to choose a new password:</p>
			${emailButton('Reset Password', resetLink)}
			<p style="margin:20px 0 0; color:#6b7280; font-size:13px;">This link will expire in <strong>15 minutes</strong>.</p>
			<p style="margin:16px 0 0; color:#6b7280; font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
			<p style="margin:8px 0 0; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; word-break:break-all; color:#115F34; background:#f0f7f2; padding:10px 12px; border-radius:6px;">${resetLink}</p>
			<div style="background:#fff8e6; border-left:4px solid #EBB957; padding:14px 16px; margin:20px 0 0;">
				<p style="margin:0; color:#856404; font-size:13px;"><strong>Didn't request this?</strong> You can safely ignore this email — your password won't change unless you use the link above.</p>
			</div>
		`
	)

	return { subject, text, html }
}
