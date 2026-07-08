import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.purelymail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'noreply@greentekindonesia.co.id',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendVerificationEmail(to: string, name: string, verificationUrl: string) {
  const mailOptions = {
    from: `"Greentek Inventory" <${process.env.SMTP_USER || 'noreply@greentekindonesia.co.id'}>`,
    to,
    subject: 'Verifikasi Email - Greentek Inventory',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Halo ${name}!</h2>
        <p style="color: #475569;">Terima kasih telah mendaftar di Greentek Inventory.</p>
        <p style="color: #475569;">Silakan klik tombol di bawah untuk memverifikasi alamat email Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 24px; font-weight: 600; display: inline-block;">
            Verifikasi Email
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Link verifikasi ini akan kadaluarsa dalam 60 menit.</p>
        <p style="color: #94a3b8; font-size: 14px;">Jika Anda tidak mendaftar, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px;">Tim Greentek Inventory</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendResetPasswordEmail(to: string, name: string, resetUrl: string) {
  const mailOptions = {
    from: `"Greentek Inventory" <${process.env.SMTP_USER || 'noreply@greentekindonesia.co.id'}>`,
    to,
    subject: 'Reset Password - Greentek Inventory',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0f172a;">Halo ${name}!</h2>
        <p style="color: #475569;">Kami menerima permintaan reset password untuk akun Anda.</p>
        <p style="color: #475569;">Silakan klik tombol di bawah untuk mereset password Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 24px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">Link ini akan kadaluarsa dalam 60 menit.</p>
        <p style="color: #94a3b8; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px;">Tim Greentek Inventory</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
