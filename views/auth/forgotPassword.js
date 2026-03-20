import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Admin client uses the service role key — bypasses RLS so it can update any user's password.
const supabaseAdmin = createAdminClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.get('/forgotPassword', (req, res) => {
  res.render('auth/forgotPassword', { error: null, success: null });
});

// POST /forgotPassword — look up user by username, generate token, email it
app.post('/forgotPassword', async (req, res) => {
  const { username } = req.body;

  const renderError = (msg) =>
    res.render('auth/forgotPassword', { error: msg, success: null });

  if (!username || !username.trim()) {
    return renderError('Please enter your username.');
  }

  try {
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const matchedUser = users.find(
      (u) => u.user_metadata?.display_name?.toLowerCase() === username.trim().toLowerCase()
    );

   
    const successMsg = 'If that username exists, a reset email has been sent.';

    if (!matchedUser) {
      return res.render('auth/forgotPassword', { error: null, success: successMsg });
    }
    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // 3. Invalidate any existing unused tokens for this user
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('user_id', matchedUser.id)
      .eq('used', false);

    // 4. Insert new token
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert([{ user_id: matchedUser.id, token, expires_at: expiresAt.toISOString() }]);

    if (insertError) throw insertError;

    // 5. Build reset link (token pre-filled in the URL for convenience)
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/resetPassword?token=${token}`;

    // 6. Send the email
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: matchedUser.email,
      subject: 'AI JobCoach — Password Reset',
      text: `Hi ${username},\n\nYou requested a password reset.\n\nYour reset token is:\n\n  ${token}\n\nOr click this link to reset directly:\n${resetLink}\n\nThis token expires in 1 hour. If you didn't request this, you can ignore this email.\n\n— AI JobCoach`,
      html: `
        <p>Hi <strong>${username}</strong>,</p>
        <p>You requested a password reset for your AI JobCoach account.</p>
        <p><strong>Your reset token:</strong></p>
        <pre style="background:#f4f4f4;padding:12px;border-radius:6px;font-size:14px;">${token}</pre>
        <p>Or click the button below to open the reset page with the token pre-filled:</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;">Reset My Password</a>
        <p style="color:#888;font-size:12px;margin-top:20px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return res.render('auth/forgotPassword', { error: null, success: successMsg });

  } catch (err) {
    console.error('[forgotPassword] Error:', err.message);
    return renderError('Something went wrong. Please try again.');
  }
});

// GET /resetPassword — show the reset form (token pre-filled from URL if provided)
app.get('/resetPassword', (req, res) => {
  res.render('auth/resetPassword', {
    error: null,
    success: null,
    token: req.query.token || '',
  });
});

// POST /resetPassword — validate token, update password
app.post('/resetPassword', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  const renderError = (msg) =>
    res.render('auth/resetPassword', { error: msg, success: null, token: token || '' });

  if (!token || !newPassword || !confirmPassword) {
    return renderError('All fields are required.');
  }

  if (newPassword !== confirmPassword) {
    return renderError('Passwords do not match.');
  }

  if (newPassword.length < 6) {
    return renderError('Password must be at least 6 characters.');
  }

  try {
    // 1. Look up the token in the database
    const { data: rows, error: fetchError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .limit(1);

    if (fetchError) throw fetchError;

    if (!rows || rows.length === 0) {
      return renderError('Invalid or already-used token. Please request a new one.');
    }

    const resetRecord = rows[0];

    // 2. Check expiry
    if (new Date(resetRecord.expires_at) < new Date()) {
      return renderError('This token has expired. Please request a new one.');
    }

    // 3. Update the user's password via Supabase Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      resetRecord.user_id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    // 4. Mark token as used so it can't be reused
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetRecord.id);

    return res.render('auth/resetPassword', {
      error: null,
      success: 'Password updated successfully! You can now log in.',
      token: '',
    });

  } catch (err) {
    console.error('[resetPassword] Error:', err.message);
    return renderError('Something went wrong. Please try again.');
  }
});
