// api/verify.js — Vercel serverless function
const { supabase, setCors, respond } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const token = req.body?.token || '';

  if (!token) {
    return respond(res, { valid: false, error: 'No token provided' }, 400);
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, user_type, email, phone, gender, department, level, profile_image')
    .eq('session_token', token)
    .gt('token_expiry', new Date().toISOString())
    .single();

  if (error || !user) {
    return respond(res, { valid: false, error: 'Token expired or invalid' }, 401);
  }

  return respond(res, { valid: true, user });
};
