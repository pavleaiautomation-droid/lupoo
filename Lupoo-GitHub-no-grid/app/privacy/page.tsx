import Link from 'next/link';
import { ShieldCheck, ArrowUpRight, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import '../landing-layout.css';

export const metadata: Metadata = { title: 'Privacy Policy | Lupoo' };

export default function Privacy() {
  return (
    <main className="privacy-page">
      <div className="privacy-ambient" aria-hidden="true" /><nav><Link href="/" className="privacy-brand">Lupoo</Link><Link href="/" className="privacy-back">Back to home <ArrowUpRight size={15} /></Link></nav>
      <article>
        <header className="privacy-hero"><div className="privacy-emblem"><ShieldCheck size={28} strokeWidth={1.3} /></div>
        <h1>Privacy Policy</h1>
        <p className="privacy-lead">Your information. Your choice.</p><p className="privacy-date">Last updated: September 12, 2026</p></header>
        <p>This policy covers the Lupoo coming soon website and its launch waiting list. For questions about your information, contact the Lupoo team at <a href="mailto:pavle.ai.automation@gmail.com">pavle.ai.automation@gmail.com</a>.</p>
        <section className="privacy-section"><h2>Information we collect</h2><p>When you join the list, we store your email address, signup time, a subscriber identifier, and a private token for managing your subscription. If you leave the list, we record that status. To limit spam, we also temporarily store hashed values derived from your IP address and email, request counts, and expiry times. Our hosting providers may process technical request information to operate and secure the website.</p></section>
        <section className="privacy-section"><h2>How we use it</h2><p>We use your email to save your place and notify you about the Lupoo launch, based on your request to join. Email delivery is currently disabled: submitting the form saves your address without sending a confirmation email. We use abuse-prevention information to protect the site and keep the signup service working.</p></section>
        <section className="privacy-section"><h2>Storage and service providers</h2><p>The launch list is stored in a Cloudflare D1 database through our Sites hosting service. The Vercel version forwards signups to the same backend. Hosting and infrastructure providers process information as needed to run these services, potentially in countries outside your own. We do not sell your email address.</p></section>
        <section className="privacy-section"><h2>How long we keep it</h2><p>We keep signup records while they are needed to manage the launch list, unless you request deletion sooner. We review their continued need when the launch is complete. Spam-prevention records expire after ten minutes and are cleared during subsequent signup requests. Removal from the launch list and deletion of your stored record are separate requests.</p></section>
        <section className="privacy-section"><h2>Your choices</h2><p>You can contact us to leave the list, withdraw your request for launch notifications, or request access, correction, or deletion of your information. Depending on the law that applies to you, you may also have rights to restrict or object to processing, receive a portable copy, or complain to your local data protection authority.</p></section>
        <section className="privacy-section"><h2>Cookies and changes</h2><p>The signup form does not use advertising cookies or analytics trackers. Our hosting services may use essential security technologies. We will update this page when the way this website handles information changes, including when new Lupoo features launch.</p></section>
      <aside className="privacy-contact"><Mail size={22} strokeWidth={1.4} /><div><h2>Here to help.</h2><p>Questions or a request about your data? Get in touch.</p><a href="mailto:pavle.ai.automation@gmail.com">Contact the Lupoo team <ArrowUpRight size={15} /></a></div></aside></article>
    </main>
  );
}
