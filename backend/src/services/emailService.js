const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : '';

  if (!user || !pass) {
    return null;
  }

  if (user.includes('@gmail.com') || (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      },
      connectionTimeout: 5000,
      greetingTimeout: 4000,
      socketTimeout: 6000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: user,
      pass: pass
    },
    connectionTimeout: 5000,
    greetingTimeout: 4000,
    socketTimeout: 6000,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Unified email dispatcher (Brevo API -> Resend API -> Nodemailer SMTP with auto-fallback)
const dispatchEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'accsupportive@gmail.com';

  // 1. Try Brevo HTTP API first (Can send to ANY email address worldwide)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log('📤 Sending email via Brevo HTTP API to:', to);
      const res = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: 'CampusPlacement AI', email: from },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });
      console.log('✅ Brevo email sent successfully:', res.data);
      return { success: true, provider: 'brevo', id: res.data?.messageId };
    } catch (err) {
      console.error('❌ Brevo API error:', err.response?.data || err.message);
    }
  }

  // 2. Try Resend HTTP REST API
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('📤 Sending email via Resend HTTP API to:', to);
      const res = await axios.post('https://api.resend.com/emails', {
        from: process.env.RESEND_FROM || 'CampusPlacement <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      });
      console.log('✅ Resend email sent successfully:', res.data);
      return { success: true, provider: 'resend', id: res.data?.id };
    } catch (err) {
      console.error('❌ Resend API error:', err.response?.data || err.message);
    }
  }

  // 3. Fallback to Nodemailer SMTP
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: from,
        to,
        subject,
        html,
        text
      });
      console.log('✅ SMTP email accepted:', info.messageId);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.error('❌ SMTP Error:', smtpErr.message);
    }
  }

  return { success: false, message: 'All configured email dispatchers failed.' };
};


const sendCredentialsEmail = async (to, username, password, collegeName) => {
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
    '.value { font-family: monospace; background: #f1f3f5; padding: 2px 8px; border-radius: 4px; font-weight: bold; }' +
    '.footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }' +
    '.button { display: inline-block; background: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }' +
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
    '<a href="' + (process.env.FRONTEND_URL || 'https://campusplacement-frontend.onrender.com') + '" class="button">Login Now</a>' +
    '</p>' +
    '<p class="warning">Please change your password after first login.</p>' +
    '</div>' +
    '<div class="footer">' +
    '<p>' + new Date().getFullYear() + ' CampusPlacement AI. All rights reserved.</p>' +
    '</div>' +
    '</div>' +
    '</body>' +
    '</html>';

  const text = `Welcome to CampusPlacement!\nCollege: ${collegeName}\nUsername: ${username}\nPassword: ${password}\nLogin at: ${process.env.FRONTEND_URL || 'https://campusplacement-frontend.onrender.com'}`;

  return await dispatchEmail({ to, subject, html, text });
};

const sendSupportRequestEmail = async ({ recipient, name, email, collegeName, username, message }) => {
  const to = recipient || (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_EMAIL !== 'superadmin@campusplacement.ai'
    ? process.env.SUPER_ADMIN_EMAIL
    : (process.env.EMAIL_USER || 'accsupportive@gmail.com'));

  const subject = 'CampusPlacement - Admin Credentials Help Request';
  const html =
    '<!DOCTYPE html>' +
    '<html>' +
    '<head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;} .container{max-width:600px;margin:0 auto;padding:20px;} .card{background:#f8f9fa;padding:20px;border-radius:10px;border:1px solid #dee2e6;} .label{font-weight:bold;color:#1e3a5f;} .value{margin-left:6px;}</style></head>' +
    '<body><div class="container"><div class="card"><h2>Admin Credentials Help Request</h2><p>An admin has requested help with their CampusPlacement credentials.</p><p><span class="label">Name:</span><span class="value">' + (name || 'N/A') + '</span></p><p><span class="label">Email:</span><span class="value">' + (email || 'N/A') + '</span></p><p><span class="label">College:</span><span class="value">' + (collegeName || 'N/A') + '</span></p><p><span class="label">Username:</span><span class="value">' + (username || 'N/A') + '</span></p><p><span class="label">Request Time:</span><span class="value">' + new Date().toLocaleString() + '</span></p><p><span class="label">Issue:</span><span class="value">' + (message || 'N/A') + '</span></p><p style="margin-top:16px;">Please review this request and help recover or reset the account access.</p></div></div></body></html>';
  
  const text = `Admin Help Request\nName: ${name}\nEmail: ${email}\nCollege: ${collegeName}\nUsername: ${username}\nIssue: ${message}`;

  return await dispatchEmail({ to, subject, html, text });
};


const testSMTP = async (to = 'kireeti213@gmail.com') => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) {
    return {
      success: false,
      configured: false,
      error: 'EMAIL_USER or EMAIL_PASS environment variables are not set in the hosting environment',
      env_user: user ? user : 'missing',
      env_pass_set: !!pass
    };
  }

  const transporter = getTransporter();
  
  try {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || user,
      to: to,
      subject: 'CampusPlacement AI - SMTP Test Email',
      text: 'If you receive this email, your SMTP configuration on Render is working perfectly!'
    });

    return {
      success: true,
      configured: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      user: user
    };
  } catch (error) {
    return {
      success: false,
      configured: true,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    };
  }
};

module.exports = { sendCredentialsEmail, sendSupportRequestEmail, testSMTP };

