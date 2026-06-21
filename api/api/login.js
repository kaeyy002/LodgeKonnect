// api/login.js — Vercel serverless function
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase, setCors, respond } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const { loginId, password, userType } = req.body || {};

  if (!loginId || !password) {
    return respond(res, { success: false, error: 'Email/phone and password are required.' }, 400);
  }
  if (!['student', 'caretaker'].includes(userType)) {
    return respond(res, { success: false, error: 'Invalid user type.' }, 400);
  }

  // Fetch user by email OR phone + user_type
  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email, phone, password, user_type, gender, department, level, profile_image')
    .eq('user_type', userType)
    .or(`email.eq.${loginId},phone.eq.${loginId}`)
    .limit(1);

  const user = users?.[0];

  if (error || !user || !(await bcrypt.compare(password, user.password))) {
    return respond(res, { success: false, error: 'Incorrect login ID or password.' }, 401);
  }

  // Issue a fresh session token (7-day expiry)
  const token      = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await supabase
    .from('users')
    .update({ session_token: token, token_expiry: tokenExpiry })
    .eq('id', user.id);

  return respond(res, {
    success:       true,
    token,
    user_id:       user.id,
    user_type:     user.user_type,
    user_name:     user.full_name,
    user_email:    user.email,
    user_phone:    user.phone,
    user_gender:   user.gender,
    user_dept:     user.department,
    user_level:    user.level,
    profile_image: user.profile_image,
    redirect:      user.user_type === 'student' ? 'dashboard.html' : 'dashboardcaretaker.html',
    message:       `Welcome back, ${user.full_name}!`,
  });
};
