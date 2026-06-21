// api/notifications.js — Vercel serverless function
const { supabase, setCors, respond, requireAuth } = require('../lib/supabase');

module.exports = async function handler(req, res) {
  setCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = await requireAuth(req, res);
  if (!authUser) return;

  // GET — fetch notifications for the authenticated user
  if (req.method === 'GET') {
    const { data: notifs, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, is_read, created_at')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return respond(res, { success: false, error: 'Failed to fetch notifications.' }, 500);
    }

    const unread_count = (notifs || []).filter(n => !n.is_read).length;
    return respond(res, { success: true, notifications: notifs || [], unread_count });
  }

  // POST — mark as read
  if (req.method === 'POST') {
    const { action, notification_id } = req.body || {};

    if (action === 'mark_read') {
      const query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', authUser.id);

      if (notification_id) {
        query.eq('id', parseInt(notification_id));
      }

      const { error } = await query;
      if (error) return respond(res, { success: false, error: 'Failed to mark as read.' }, 500);

      return respond(res, { success: true });
    }
  }

  return respond(res, { success: false, error: 'Method not allowed' }, 405);
};
