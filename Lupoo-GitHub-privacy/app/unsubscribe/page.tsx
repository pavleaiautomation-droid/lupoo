'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function Unsubscribe() {
  const [message, setMessage] = useState(
    'You can leave the Lupoo launch list at any time.',
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function leave() {
    setBusy(true);
    try {
      const token = new URLSearchParams(window.location.search).get('token');
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setMessage(
        "You've been unsubscribed. Thanks for being part of the loop.",
      );
      setDone(true);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main style={{ maxWidth: 560, margin: '15vh auto', padding: 28 }}>
      <Link href="/" className="brand">
        lupoo.
      </Link>
      <h1 style={{ fontSize: 48, letterSpacing: -2 }}>
        Your inbox.
        <br />
        Your choice.
      </h1>
      <output className="intro">{message}</output>
      {!done && (
        <button
          onClick={leave}
          disabled={busy}
          style={{
            background: 'var(--primary)',
            padding: '15px 24px',
            border: 0,
            borderRadius: 8,
            marginTop: 24,
            color: '#061526',
          }}
        >
          {busy ? 'Unsubscribing…' : 'Unsubscribe'}
        </button>
      )}
    </main>
  );
}
