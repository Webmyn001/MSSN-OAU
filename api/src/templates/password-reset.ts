/**
 * * Generates password reset email content
 * @param name - User's name
 * @param resetLink - Password reset link with token
 * @returns Email content with subject, text, and HTML
 */
export function generatePasswordResetEmail(name: string, resetLink: string) {
	const subject = 'Password Reset Request | MSSN Website'

	const text = `Hi ${name},

Someone requested a password reset for your MSSN account. If this was you, click here to reset your password:

${resetLink}

This link will expire in 15 minutes.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Thanks,
The MSSN Website Team`

	const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      
      <p>Hi ${name},</p>
      
      <p>Someone requested a password reset for your MSSN account. If this was you, click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      
      <p style="color: #666; font-size: 14px;">This link will expire in <strong>15 minutes</strong>.</p>
      
      <p style="color: #666; font-size: 14px;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${resetLink}</p>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;"><strong>⚠ If you didn't request a password reset:</strong></p>
        <p style="margin: 5px 0 0 0; color: #856404;">Please ignore this email or contact support if you have concerns.</p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">Thanks,<br>The MSSN Website Team</p>
    </div>
  `

	return { subject, text, html }
}
