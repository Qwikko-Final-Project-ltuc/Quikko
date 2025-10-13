const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetEmail = async (to, link) => {
  await transporter.sendMail({
    from: `"Quikko Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your Quikko password",
    html: `
      <div style="font-family: sans-serif; padding: 16px;">
        <h2>Password Reset</h2>
        <p>You requested to reset your password. Click below to reset:</p>
        <a href="${link}" style="display:inline-block;background:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};

exports.sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Quikko Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
