const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,  // e.g. "example@gmail.com"
    pass: process.env.EMAIL_PASS
  }
});

exports.sendStudentAbsenceEmail = async (toEmail, recentAbsences) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Attendance Warning',
    text: `You have been absent ${recentAbsences} times in the last 7 days. Please contact the admin if there's an issue.`
  };

  await transporter.sendMail(mailOptions);
};

// Send email function
exports.sendEmail = async (to, subject, text, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender address
      to, // Recipient(s)
      subject, // Subject line
      text, // Plain text body
      html, // HTML body
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error('Email sending failed.');
  }
};