'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LinkItem {
	href: string;
	label: string;
}

interface SocialLink {
	icon: React.ReactNode;
	href: string;
	label: string;
}

interface FooterProps {
	logo: string;
	brandName: string;
	tagline?: string;
	socialLinks?: SocialLink[];
	mainLinks?: LinkItem[];
	legalLinks?: LinkItem[];
	copyright: {
		text: string;
		license?: string;
	};
}

export default function Footer({
	logo,
	brandName,
	tagline,
	socialLinks = [],
	mainLinks = [],
	legalLinks = [],
	copyright,
}: FooterProps) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('idle');
	const [message, setMessage] = useState('');

	async function handleSubscribe(e: React.FormEvent) {
		e.preventDefault();

		const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		if (!valid) {
			setStatus('error');
			setMessage('Please enter a valid email address.');
			return;
		}

		try {
			setStatus('loading');
			setMessage('');
			const res = await fetch('/api/newsletter', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			if (res.ok) {
				setStatus('success');
				setMessage('Thanks — check your inbox for confirmation.');
				setEmail('');
			} else {
				const data = await res.json().catch(() => ({}));
				setStatus('error');
				setMessage(data?.error || 'Subscription failed.');
			}
		} catch (err) {
			setStatus('error');
			setMessage('Network error. Please try again later.');
		}
	}

	return (
		<footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 text-slate-700 dark:text-slate-300">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-8 items-start">
					{/* Brand */}
					<div className="lg:col-span-4 flex flex-col gap-4">
						<a
							href="/"
							aria-label={brandName}
							className="flex items-center gap-3">
							<div className="relative w-full h-10 flex-shrink-0 ">
								<Image
									src={logo}
									alt={`${brandName} logo`}
									fill
									className="object-contain object-left dark:brightness-0 dark:invert"
								/>
							</div>
							
						</a>

						<p className="text-sm text-muted-foreground max-w-md">
							Clean, focused content and tools for people who want to get things
							done. No fluff, just value.
						</p>

						<div className="flex items-center gap-3">
							

							<div className="flex items-center gap-2">
								{socialLinks.map((s, idx) => (
									<a
										key={idx}
										href={s.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={s.label}
										className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
										{s.icon}
									</a>
								))}
							</div>
						</div>
					</div>

					{/* Links */}
					<div className="lg:col-span-5 grid grid-cols-2 gap-6 md:grid-cols-3">
						<div>
							<h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
								Product
							</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{mainLinks.slice(0, 6).map((l, i) => (
									<li key={i}>
										<a
											href={l.href}
											className="hover:underline">
											{l.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
								Resources
							</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{mainLinks.slice(6, 12).map((l, i) => (
									<li key={i}>
										<a
											href={l.href}
											className="hover:underline">
											{l.label}
										</a>
									</li>
								))}
							</ul>
						</div>

						<div>
							<h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
								Legal
							</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{legalLinks.map((l, i) => (
									<li key={i}>
										<a
											href={l.href}
											className="hover:underline">
											{l.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Subscribe */}
					<div className="lg:col-span-3">
						<h4 className="text-sm font-medium text-slate-900 dark:text-white">
							Subscribe to updates
						</h4>
						<p className="text-sm text-muted-foreground mt-1">
							Monthly newsletter — useful tips, new posts, and product updates.
						</p>

						<form
							onSubmit={handleSubscribe}
							className="mt-4 flex flex-col gap-3"
							aria-live="polite">
							<label
								htmlFor="footer-email"
								className="sr-only">
								Email address
							</label>
							<div className="flex gap-2">
								<Input
									id="footer-email"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="rounded-md"
									aria-invalid={status === 'error'}
								/>
								<Button
									type="submit"
									disabled={status === 'loading'}
									className="rounded-md px-4">
									{status === 'loading' ? 'Subscribing…' : 'Subscribe'}
								</Button>
							</div>

							{message && (
								<p
									className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
									{message}
								</p>
							)}

							<p className="text-xs text-muted-foreground mt-2">
								We respect your privacy. Unsubscribe at any time.
							</p>
						</form>
					</div>
				</div>

				<div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="text-sm text-muted-foreground">
						{copyright.text}{' '}
						{copyright.license && (
							<span className="ml-2">{copyright.license}</span>
						)}
					</div>

					<nav
						aria-label="footer secondary"
						className="flex gap-4">
						{legalLinks.map((l, i) => (
							<a
								key={i}
								href={l.href}
								className="text-sm text-muted-foreground hover:underline">
								{l.label}
							</a>
						))}
					</nav>
				</div>
			</div>
		</footer>
	);
}
