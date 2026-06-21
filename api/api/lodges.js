// api/lodges.js — Vercel serverless function
const { supabase, setCors, respond, requireAuth } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: list / filter lodges ────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { location, min_price, max_price, gender, q, caretaker_id } = req.query;

    let query = supabase
      .from('lodges')
      .select(`
        *,
        caretaker:users!caretaker_id (full_name, phone),
        photos:lodge_photos (photo_url)
      `)
      .order('created_at', { ascending: false });

    if (location)     query = query.eq('location', location.toLowerCase());
    if (min_price)    query = query.gte('price', parseFloat(min_price));
    if (max_price)    query = query.lte('price', parseFloat(max_price));
    if (gender)       query = query.eq('gender_preference', gender.toLowerCase());
    if (caretaker_id) query = query.eq('caretaker_id', parseInt(caretaker_id));
    if (q) {
      query = query.or(
        `lodge_name.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
      );
    }

    const { data: lodges, error } = await query;

    if (error) {
      console.error('Lodges GET error:', error);
      return respond(res, { success: false, error: 'Failed to fetch lodges.' }, 500);
    }

    // Flatten caretaker fields and photos array to match old PHP response shape
    const formatted = (lodges || []).map(l => ({
      ...l,
      caretaker_name:  l.caretaker?.full_name  || '',
      caretaker_phone: l.caretaker?.phone       || '',
      photos:          (l.photos || []).map(p => p.photo_url),
      caretaker:       undefined,
    }));

    return respond(res, { success: true, lodges: formatted });
  }

  // ── POST: create lodge (caretaker only) ──────────────────────────────────────
  if (req.method === 'POST') {
    const authUser = await requireAuth(req, res);
    if (!authUser) return; // requireAuth already sent the 401

    if (authUser.user_type !== 'caretaker') {
      return respond(res, { success: false, error: 'Only caretakers can post lodges.' }, 403);
    }

    const {
      lodge_name, location, price, description,
      room_number, gender_preference, amenities, photos,
    } = req.body || {};

    if (!lodge_name || !location || !price || !description) {
      return respond(res, {
        success: false,
        error: 'Lodge name, location, price, and description are required.',
      }, 400);
    }
    if (!['eziobodo', 'umuchima'].includes(location.toLowerCase())) {
      return respond(res, { success: false, error: 'Location must be Eziobodo or Umuchima.' }, 400);
    }

    const { data: lodge, error: lodgeErr } = await supabase
      .from('lodges')
      .insert({
        caretaker_id:     authUser.id,
        lodge_name:       lodge_name.trim(),
        location:         location.toLowerCase(),
        price:            parseFloat(price),
        description:      description.trim(),
        room_number:      room_number ? parseInt(room_number) : null,
        gender_preference: (gender_preference || 'any').toLowerCase(),
        amenities:        amenities || null,
        status:           'active',
      })
      .select('id')
      .single();

    if (lodgeErr || !lodge) {
      console.error('Lodge insert error:', lodgeErr);
      return respond(res, { success: false, error: 'Failed to post lodge.' }, 500);
    }

    // photos is an array of Supabase Storage public URLs sent from the client
    if (Array.isArray(photos) && photos.length) {
      const photoRows = photos.map(url => ({ lodge_id: lodge.id, photo_url: url }));
      await supabase.from('lodge_photos').insert(photoRows);
    }

    return respond(res, { success: true, lodge_id: lodge.id, message: 'Lodge posted successfully!' }, 201);
  }

  return respond(res, { success: false, error: 'Method not allowed' }, 405);
};
