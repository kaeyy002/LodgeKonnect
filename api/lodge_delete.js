// api/lodge_delete.js — Vercel serverless function
const { supabase, setCors, respond, requireAuth } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return respond(res, { success: false, error: 'Method not allowed' }, 405);

  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  if (authUser.user_type !== 'caretaker') {
    return respond(res, { success: false, error: 'Only caretakers can delete lodges.' }, 403);
  }

  const { lodge_id } = req.body || {};

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

  // Delete photos from Supabase Storage (if you stored paths in photo_url)
  const { data: photoRows } = await supabase
    .from('lodge_photos')
    .select('photo_url')
    .eq('lodge_id', lodge_id);

  if (photoRows?.length) {
    const paths = photoRows
      .map(r => {
        // Extract storage path from the public URL
        // URL format: https://<project>.supabase.co/storage/v1/object/public/lodge-photos/<path>
        const match = r.photo_url.match(/lodge-photos\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (paths.length) {
      await supabase.storage.from('lodge-photos').remove(paths);
    }
  }

  // Delete lodge (cascade will remove lodge_photos rows)
  const { error } = await supabase.from('lodges').delete().eq('id', lodge_id);

  if (error) {
    console.error('Lodge delete error:', error);
    return respond(res, { success: false, error: 'Delete failed.' }, 500);
  }

  return respond(res, { success: true, message: 'Lodge deleted.' });
};
