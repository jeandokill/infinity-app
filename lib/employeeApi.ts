// lib/employeeApi.ts
import { API_BASE_URL } from '@/constants/api'; // make sure constants/api.ts exists
import { supabase } from './supabaseClient'; // adjust path if your supabaseClient is elsewhere

// Invite an employee (calls your Vercel endpoint)
export async function inviteEmployee(
  email: string,
  ownerId: string,
  firstName = 'First',
  lastName = 'Last',
  title = 'Mr'
) {
  // get session token
  const { data: sessionResp } = await supabase.auth.getSession();
  const token = sessionResp?.session?.access_token;

  if (!token) throw new Error('Not authenticated (no session token)');

  const res = await fetch(`${API_BASE_URL}/invite-employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      owner_id: ownerId,
      email,
      first_name: firstName,
      last_name: lastName,
      title,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Invite failed (status ${res.status})`);
  }

  return res.json();
}

// Delete an employee (calls your Vercel endpoint)
export async function deleteEmployee(employeeId: string, ownerId: string) {
  const { data: sessionResp } = await supabase.auth.getSession();
  const token = sessionResp?.session?.access_token;

  if (!token) throw new Error('Not authenticated (no session token)');

  const res = await fetch(`${API_BASE_URL}/delete-employee`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      owner_id: ownerId,
      employee_id: employeeId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed (status ${res.status})`);
  }

  return res.json();
}
