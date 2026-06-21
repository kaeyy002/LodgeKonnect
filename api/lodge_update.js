// api/lodge_update.js — Vercel serverless function
const { supabase, setCors, respond, requireAuth } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (authUser.user_type !== 'caretaker') {
    return respond(res, { success: false, error: 'Only caretakers can update lodges.' }, 403);
  }

  const {
    lodge_id, lodge_name, location, price, description,
    room_number, gender_preference, amenities, status, photos,
  } = req.body || {};

  if (!lodge_id) return respond(res, { success: false, error: 'Lodge ID required.' }, 400);

  // Confirm ownership
  const { data: existing } = await supabase
    .from('lodges')
    .select('id')
    .eq('id', lodge_id)
    .eq('caretaker_id', authUser.id)
    .single();

  if (!existing) {
    return respond(res, { success: false, error: 'Lodge not found or not yours.' }, 403);
  }

  const validStatuses = ['active', 'occupied', 'unavailable'];
  const { error: updateErr } = await supabase
    .from('lodges')
    .update({
      lodge_name:        lodge_name?.trim(),
      location:          location?.toLowerCase(),
      price:             parseFloat(price),
      description:       description?.trim(),
      room_number:       room_number ? parseInt(room_number) : null,
      gender_preference: (gender_preference || 'any').toLowerCase(),
      amenities:         amenities || null,
      status:            validStatuses.includes(status) ? status : 'active',
    })
    .eq('id', lodge_id);

  if (updateErr) {
    console.error('Lodge update error:', updateErr);
    return respond(res, { success: false, error: 'Update failed.' }, 500);
  }

  // Replace photos if new ones provided (array of public URLs from Supabase Storage)
  if (Array.isArray(photos) && photos.length) {
    await supabase.from('lodge_photos').delete().eq('lodge_id', lodge_id);
    const photoRows = photos.map(url => ({ lodge_id: parseInt(lodge_id), photo_url: url }));
    await supabase.from('lodge_photos').insert(photoRows);
  }

  return respond(res, { success: true, message: 'Lodge updated.' });
};
