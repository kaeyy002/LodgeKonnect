// api/register.js — Vercel serverless function
const bcrypt = require('bcryptjs');
const { supabase, setCors, respond } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const {
    full_name, email, phone, password, confirm_password,
    user_type, gender, department, level,
    lodge_name, location, lodge_description,
  } = req.body || {};

  const errors = [];

  if (!full_name || full_name.trim().length < 2)          errors.push('Full name is required.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required.');
  if (!phone || !/^\d{10,11}$/.test(phone.replace(/\s/g, ''))) errors.push('Phone must be 10–11 digits.');
  if (!password || password.length < 8)                   errors.push('Password must be at least 8 characters.');
  if (password !== confirm_password)                      errors.push('Passwords do not match.');
  if (!['student', 'caretaker'].includes(user_type))      errors.push('Invalid user type.');
  if (!['male', 'female'].includes(gender))               errors.push('Gender must be male or female.');

  if (user_type === 'student') {
    if (!department) errors.push('Department is required.');
    if (!level)      errors.push('Level is required.');
  }
  if (user_type === 'caretaker') {
    if (!lodge_name)        errors.push('Lodge name is required.');
    if (!['eziobodo','umuchima'].includes(location)) errors.push('Location must be Eziobodo or Umuchima.');
    if (!lodge_description) errors.push('Lodge description is required.');
  }

  if (errors.length) {
    return respond(res, { success: false, error: errors.join(' ') }, 400);
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email.toLowerCase()},phone.eq.${phone}`)
    .limit(1);

  if (existing?.length) {
    return respond(res, { success: false, error: 'Email or phone already registered.' }, 409);
  }

  const hash = await bcrypt.hash(password, 12);

  // Insert user
  const { data: newUser, error: userErr } = await supabase
    .from('users')
    .insert({
      full_name:  full_name.trim(),
      email:      email.toLowerCase().trim(),
      phone:      phone.replace(/\s/g, ''),
      gender,
      department: department || null,
      level:      level      || null,
      password:   hash,
      user_type,
    })
    .select('id')
    .single();

  if (userErr || !newUser) {
    console.error('Register user error:', userErr);
    return respond(res, { success: false, error: 'Registration failed. Please try again.' }, 500);
  }

  // If caretaker, create their initial lodge
  if (user_type === 'caretaker') {
    const { error: lodgeErr } = await supabase
      .from('lodges')
      .insert({
        caretaker_id: newUser.id,
        lodge_name:   lodge_name.trim(),
        location,
        description:  lodge_description.trim(),
        status:       'active',
      });

    if (lodgeErr) {
      console.error('Register lodge error:', lodgeErr);
      // User was created; don't fail the whole registration
    }
  }

  return respond(res, { success: true, message: 'Account created! Please log in.' }, 201);
};
