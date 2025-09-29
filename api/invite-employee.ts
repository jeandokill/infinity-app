// api/invite-employee.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

    // Verify the caller by asking Supabase for the user associated with the token
    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const caller = await userResp.json();
    if (!caller?.id) return res.status(401).json({ error: 'Invalid token' });

    const { owner_id, email, first_name, last_name, title } = req.body;
    if (!owner_id || !email || !first_name || !last_name || !title) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Ensure caller is the declared owner
    if (caller.id !== owner_id) {
      return res.status(403).json({ error: 'Not authorized to invite employees for this owner' });
    }

    // create a temporary password (or you can send a magic link instead)
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

    // Create auth user (admin API) - service_role required
    const { data: createUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: false,
    });

    if (createUserError) {
      return res.status(500).json({ error: createUserError.message });
    }

    const newUserId = createUserData.user.id;

    // Insert profile tied to owner
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: newUserId,
      email,
      first_name,
      last_name,
      title,
      role: 'employee',
      owner_id,
    });

    if (profileError) {
      // rollback: delete user if profile insert failed
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return res.status(500).json({ error: profileError.message });
    }

    // Create invite record (optional)
    await supabaseAdmin.from('invites').insert({ owner_id, invitee_email: email, role: 'employee', sent: true });

    // TODO: send email with temp password or magic link (use your mail provider)
    // Example: send email containing BASE_APP_URL + '/invite?token=...' so they can set password

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
