'use client';
import './landing-layout.css';
import { useState } from 'react';
import ThinInfinityVisual from '@/components/thin-infinity-visual';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  LoaderCircle,
  Mail,
} from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  async function subscribe(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          website: new FormData(form).get('website'),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        message: string;
      };
      if (!response.ok)
        throw new Error(
          result.error || 'Something went wrong. Please try again.',
        );
      setStatus('success');
      setMessage(result.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Please try again.');
    }
  }
  return (
    <main className="landing">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Lupoo home">
          <span className="logo-crop">
            <Image
              src="/lupoo-logo.png"
              alt=""
              width={60}
              height={60}
              unoptimized
              priority
            />
          </span>
          <span>Lupoo</span>
        </Link>
        <a href="#signup" className="header-link">
          Get early access <ArrowUpRight size={16} />
        </a>
      </header>
      <section className="hero hero-centered">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" /> LUPOO IS COMING
          </div>
          <h1>
            Just around
            <br />
            the <span>loop.</span>
          </h1>
          <p className="intro">
            A new beginning. Endless possibilities.
            <br />
            Lupoo is launching soon. Be the first in the loop.
          </p>
          <div id="signup" className="signup-area">
            <p className="form-heading">Your first look starts here.</p>
            {status === 'success' ? (
              <output className="success-card">
                <span className="check-circle">
                  <Check size={19} />
                </span>
                <div>
                  <strong>You&apos;re on the list!</strong>
                  <p>{message}</p>
                </div>
              </output>
            ) : (
              <form onSubmit={subscribe}>
                <label className="sr-only" htmlFor="email">
                  Email address
                </label>
                <div className="email-control">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-describedby="signup-message"
                    disabled={status === 'loading'}
                  />
                  <button type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <>
                        <LoaderCircle className="spinner" size={17} /> Joining
                      </>
                    ) : (
                      <>
                        Notify me <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
                <div className="honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
              </form>
            )}
            <p
              id="signup-message"
              role={status === 'error' ? 'alert' : undefined}
              className="error-message"
            >
              {status === 'error' ? message : ''}
            </p>
          </div>
        </div>
        <div className="hero-art">
          <ThinInfinityVisual />
        </div>
      </section>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Lupoo. All rights reserved.</p>
        <p className="footer-note">
          <span className="status-dot" /> A little anticipation. A lot to look
          forward to.
        </p>
        <span className="footer-tag">
          STAY IN THE LOOP <ArrowUpRight size={13} />
        </span>
      </footer>
    </main>
  );
}
