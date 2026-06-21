// api/logout.js — Vercel serverless function
const { supabase, setCors, respond } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const token = req.body?.token || '';

  if (token) {
    await supabase
      .from('users')
      .update({ session_token: null, token_expiry: null })
      .eq('session_token', token);
  }

  return respond(res, { success: true, message: 'Logged out.' });
};
