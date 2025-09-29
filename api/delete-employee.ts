// api/delete-employee.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Req = {
  method?: string;
  headers: Record<string, string | undefined>;
  body: any;
};

type Res = {
  status: (code: number) => Res;
  json: (obj: any) => void;
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

    const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const caller = await userResp.json();
    if (!caller?.id) return res.status(401).json({ error: 'Invalid token' });

    const { employee_id, owner_id } = req.body;
    if (!employee_id || !owner_id) return res.status(400).json({ error: 'Missing employee_id or owner_id' });

    if (caller.id !== owner_id) return res.status(403).json({ error: 'Not authorized' });

    const { error: profileErr } = await supabaseAdmin.from('profiles').delete().eq('id', employee_id);
    if (profileErr) return res.status(500).json({ error: profileErr.message });

    const { error: deleteUserErr } = await supabaseAdmin.auth.admin.deleteUser(employee_id);
    if (deleteUserErr) return res.status(500).json({ error: deleteUserErr.message });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
}
