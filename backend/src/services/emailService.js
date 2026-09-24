const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ SMTP Warning: EMAIL_USER or EMAIL_PASS environment variables are not set.');
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, '')
    }
  });
};

const sendCredentialsEmail = async (to, username, password, collegeName) => {
  const transporter = getTransporter();
  const supportSender = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SUPER_ADMIN_EMAIL || 'support@campusplacement.ai';

  // If no transporter configured, log and return
  if (!transporter) {
    console.log('❌ Email not sent: SMTP transporter not configured.');
    console.log('To:', to, '| Username:', username, '| Password:', password);
    return { success: false, message: 'Credentials generated, but email was not sent because SMTP is not configured in environment variables.' };
  }


  try {
    const subject = 'CampusPlacement - Login Credentials for ' + collegeName;
    const html = 
      '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }' +
      '.container { max-width: 600px; margin: 0 auto; padding: 20px; }' +
      '.header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }' +
      '.content { padding: 20px; background: #f8f9fa; border-radius: 0 0 8px 8px; }' +
      '.credentials { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #dee2e6; }' +
      '.credential-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }' +
      '.credential-item:last-child { border-bottom: none; }' +
      '.label { font-weight: bold; color: #1e3a5f; }' +
      '.value { font-family: monospace; background: #f1f3f5; padding: 2px 8px; border-radius: 4px; }' +
      '.footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }' +
      '.button { display: inline-block; background: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }' +
      '.warning { color: #dc3545; font-size: 13px; }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<div class="container">' +
      '<div class="header">' +
      '<h1>CampusPlacement</h1>' +
      '<p>Your college has been approved!</p>' +
      '</div>' +
      '<div class="content">' +
      '<h2>Welcome to CampusPlacement!</h2>' +
      '<p>Your college <strong>' + collegeName + '</strong> has been successfully approved and onboarded to the CampusPlacement platform.</p>' +
      '<p>Here are your login credentials:</p>' +
      '<div class="credentials">' +
      '<div class="credential-item">' +
      '<span class="label">Username:</span>' +
      '<span class="value">' + username + '</span>' +
      '</div>' +
      '<div class="credential-item">' +
      '<span class="label">Password:</span>' +
      '<span class="value">' + password + '</span>' +
      '</div>' +
      '</div>' +
      '<p style="margin-top: 20px;">' +
      '<a href="' + (process.env.FRONTEND_URL || 'http://localhost:3000') + '" class="button">Login Now</a>' +
      '</p>' +
      '<p class="warning">Please change your password after first login.</p>' +
      '<p>If you have any questions, contact support at <a href="mailto:support@campusplacement.ai">support@campusplacement.ai</a></p>' +
      '</div>' +
      '<div class="footer">' +
      '<p>' + new Date().getFullYear() + ' CampusPlacement. All rights reserved.</p>' +
      '</div>' +
      '</div>' +
      '</body>' +
      '</html>';

    const mailOptions = {
      from: supportSender,
      to,
      replyTo: process.env.EMAIL_REPLY_TO || supportSender,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    const accepted = info.accepted || [];
    const rejected = info.rejected || [];

    if (!accepted.includes(to) || rejected.includes(to)) {
      console.error('Email recipient rejected:', { to, accepted, rejected });
      return {
        success: false,
        message: 'SMTP rejected the recipient address',
        accepted,
        rejected
      };
    }

    console.log('Email accepted by SMTP:', { to, messageId: info.messageId });
    return {
      success: true,
      message: 'Email accepted by SMTP; check the recipient inbox or spam folder',
      messageId: info.messageId,
      accepted,
      rejected
    };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const sendSupportRequestEmail = async ({ recipient, name, email, collegeName, username, message }) => {
  const transporter = getTransporter();
  const supportSender = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SUPER_ADMIN_EMAIL || 'support@campusplacement.ai';
  const to = recipient || (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_EMAIL !== 'superadmin@campusplacement.ai'
    ? process.env.SUPER_ADMIN_EMAIL
    : (process.env.EMAIL_USER || 'accsupportive@gmail.com'));

  if (!transporter) {
    console.log('Support request email not sent (no transporter configured)');
    console.log('To:', to, '| From:', supportSender);
    return { success: false, message: 'Support request received, but email was not sent because SMTP is not configured' };
  }

  try {
    const subject = 'CampusPlacement - Admin Credentials Help Request';
    const html =
      '<!DOCTYPE html>' +
      '<html>' +
      '<head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;} .container{max-width:600px;margin:0 auto;padding:20px;} .card{background:#f8f9fa;padding:20px;border-radius:10px;border:1px solid #dee2e6;} .label{font-weight:bold;color:#1e3a5f;} .value{margin-left:6px;}</style></head>' +
      '<body><div class="container"><div class="card"><h2>Admin Credentials Help Request</h2><p>An admin has requested help with their CampusPlacement credentials.</p><p><span class="label">Name:</span><span class="value">' + (name || 'N/A') + '</span></p><p><span class="label">Email:</span><span class="value">' + (email || 'N/A') + '</span></p><p><span class="label">College:</span><span class="value">' + (collegeName || 'N/A') + '</span></p><p><span class="label">Username:</span><span class="value">' + (username || 'N/A') + '</span></p><p><span class="label">Request Time:</span><span class="value">' + new Date().toLocaleString() + '</span></p><p><span class="label">Issue:</span><span class="value">' + (message || 'N/A') + '</span></p><p style="margin-top:16px;">Please review this request and help recover or reset the account access.</p></div></div></body></html>';

    const info = await transporter.sendMail({
      from: supportSender,
      to,
      replyTo: email || supportSender,
      subject,
      html
    });

    const accepted = info.accepted || [];
    const rejected = info.rejected || [];
    if (!accepted.includes(to) || rejected.includes(to)) {
      console.error('Support email recipient rejected:', { to, accepted, rejected });
      return { success: false, message: 'SMTP rejected the recipient address', accepted, rejected };
    }

    return {
      success: true,
      message: 'Support request accepted by SMTP',
      messageId: info.messageId,
      accepted,
      rejected
    };
  } catch (error) {
    console.error('Support email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendCredentialsEmail, sendSupportRequestEmail };
