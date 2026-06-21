// api/roommates.js — Vercel serverless function
const { supabase, setCors, respond } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const { q, gender, level, department, max_budget } = req.query;

  let query = supabase
    .from('users')
    .select('id, full_name, gender, department, level, bio, budget, preferences, profile_image, created_at')
    .eq('available_for_matching', 'yes')
    .order('created_at', { ascending: false });

  if (gender)     query = query.eq('gender', gender);
  if (level)      query = query.eq('level', level);
  if (department) query = query.ilike('department', `%${department}%`);
  if (max_budget) query = query.lte('budget', parseFloat(max_budget));
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,bio.ilike.%${q}%,department.ilike.%${q}%`
    );
  }

  const { data: students, error } = await query;

  if (error) {
    console.error('Roommates error:', error);
    return respond(res, { success: false, error: 'Failed to fetch roommates.' }, 500);
  }

  return respond(res, { success: true, students: students || [] });
};
