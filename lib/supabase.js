const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
const ALLOWED_ORIGINS = ['https://kaeyy002.github.io','http://localhost','http://127.0.0.1','http://localhost:3000'];
function setCors(res, req) { const origin = req.headers['origin'] || ''; if (ALLOWED_ORIGINS.includes(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); } else { res.setHeader('Access-Control-Allow-Origin', 'https://kaeyy002.github.io'); } res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); }
function respond(res, data, status = 200) { res.setHeader('Content-Type', 'application/json'); res.status(status).json(data); }
async function requireAuth(req, res) { const authHeader = req.headers['authorization'] || ''; const match = authHeader.match(/Bearer\s+(.+)/i); const token = match ? match[1] : (req.body?.token || ''); if (!token) { respond(res, { success: false, error: 'Unauthorized — no token' }, 401); return null; } const { data: user, error } = await supabase.from('users').select('id, full_name, email, phone, user_type, gender, department, level').eq('session_token', token).gt('token_expiry', new Date().toISOString()).single(); if (error || !user) { respond(res, { success: false, error: 'Unauthorized — invalid or expired token' }, 401); return null; } return user; }
module.exports = { supabase, setCors, respond, requireAuth };
