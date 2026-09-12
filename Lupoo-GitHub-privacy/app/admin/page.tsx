'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
type Row = {
  id: string;
  email: string;
  created_at: number;
  unsubscribed_at: number | null;
};
type Page = { rows: Row[]; total: number; next: string | null };
export default function AdminPage() {
  const secret = useRef('');
  const [password, setPassword] = useState('');
  const [page, setPage] = useState<Page | null>(null);
  const [cursor, setCursor] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function read(after = '', key = secret.current): Promise<Page> {
    const response = await fetch(
      `/api/admin/subscribers?after=${encodeURIComponent(after)}`,
      { headers: { Authorization: `Bearer ${key}` }, cache: 'no-store' },
    );
    const data = (await response.json()) as Page & { error?: string };
    if (!response.ok)
      throw new Error(data.error || 'Unable to load subscribers.');
    return data;
  }
  async function navigate(after: string, previous: string[]) {
    setBusy(true);
    setError('');
    try {
      setPage(await read(after));
      setCursor(after);
      setHistory(previous);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    setError('');
    try {
      const lines = ['Email,Signup date,Status'];
      const cell = (value: string) =>
        `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
      let after = '';
      do {
        const batch = await read(after);
        for (const row of batch.rows)
          lines.push(
            [
              row.email,
              new Date(row.created_at).toISOString(),
              row.unsubscribed_at === null ? 'Subscribed' : 'Unsubscribed',
            ]
              .map(cell)
              .join(','),
          );
        after = batch.next || '';
      } while (after);
      const url = URL.createObjectURL(
        new Blob(['\uFEFF' + lines.join('\r\n')], {
          type: 'text/csv;charset=utf-8',
        }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lupoo-subscribers.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="subscriber-admin">
      <Link href="/" className="admin-brand">
        Lupoo
      </Link>
      <h1>Subscribers</h1>
      <p className="admin-muted">Your launch waitlist, in one place.</p>
      {!page ? (
        <form
          className="admin-login"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              const result = await read('', password);
              secret.current = password;
              setPassword('');
              setPage(result);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Unable to sign in.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
          />
          <button disabled={busy}>
            {busy ? 'Opening…' : 'View subscribers'}
          </button>
        </form>
      ) : (
        <>
          <div className="admin-toolbar">
            <strong>
              {page.total} saved email{page.total === 1 ? '' : 's'}
            </strong>
            <div>
              <button disabled={busy} onClick={() => navigate('', [])}>
                Refresh
              </button>
              <button disabled={busy} onClick={download}>
                Download CSV
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  secret.current = '';
                  setPage(null);
                  setCursor('');
                  setHistory([]);
                  setError('');
                }}
              >
                Lock
              </button>
            </div>
          </div>
          {page.total === 0 ? (
            <p className="admin-empty">
              No signups yet. New email addresses will appear here.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Signed up</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {page.rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.email}</td>
                      <td>{new Date(row.created_at).toLocaleString()}</td>
                      <td>
                        {row.unsubscribed_at === null
                          ? 'Subscribed'
                          : 'Unsubscribed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="admin-pages">
            <button
              disabled={busy || !history.length}
              onClick={() =>
                navigate(history[history.length - 1], history.slice(0, -1))
              }
            >
              Previous
            </button>
            <span>Page {history.length + 1}</span>
            <button
              disabled={busy || !page.next}
              onClick={() => navigate(page.next!, [...history, cursor])}
            >
              Next
            </button>
          </div>
          <p className="admin-muted">
            Email sending is off. This page only displays and downloads your
            list.
          </p>
        </>
      )}
      <p role="alert" className="admin-error">
        {error}
      </p>
    </main>
  );
}
