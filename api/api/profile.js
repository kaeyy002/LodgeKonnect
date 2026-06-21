// api/profile.js — Vercel serverless function
// NOTE: Image uploads use Supabase Storage (client uploads directly to Storage,
// then sends the resulting public URL here). No server-side file handling needed.
const { supabase, setCors, respond, requireAuth } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  // GET — return current profile
  if (req.method === 'GET') {
    return respond(res, { success: true, user: authUser });
  }

  // POST — update profile fields
  if (req.method === 'POST') {
    const {
      department, level, bio, matching_bio,
      preferences, available_for_matching,
      profile_image, // public URL from Supabase Storage (uploaded by client)
    } = req.body || {};

    const updates = {
      department:             department?.trim()   || null,
      level:                  level?.trim()        || null,
      bio:                    bio?.trim()           || null,
      matching_bio:           matching_bio?.trim()  || bio?.trim() || null,
      preferences:            preferences           || null,
      available_for_matching: ['yes','no'].includes(available_for_matching)
                                ? available_for_matching
                                : 'no',
    };

    if (profile_image) {
      updates.profile_image = profile_image;
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authUser.id);

    if (error) {
      console.error('Profile update error:', error);
      return respond(res, { success: false, error: 'Profile update failed.' }, 500);
    }

    return respond(res, {
      success:       true,
      profile_image: profile_image || 'unchanged',
      message:       'Profile updated!',
    });
  }

  return respond(res, { success: false, error: 'Method not allowed' }, 405);
};
