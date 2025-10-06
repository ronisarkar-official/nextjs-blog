'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import Image from 'next/image';

interface FooterProps {
	logo: string;
	brandName: string;
	socialLinks: Array<{
		icon: React.ReactNode;
		href: string;
		label: string;
	}>;
	mainLinks: Array<{
		href: string;
		label: string;
	}>;
	legalLinks: Array<{
		href: string;
		label: string;
	}>;
	copyright: {
		text: string;
		license?: string;
	};
}

export function Footer({
	logo,
	brandName,
	socialLinks,
	mainLinks,
	legalLinks,
	copyright,
}: FooterProps) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('idle');
	const [message, setMessage] = useState('');

	async function handleSubscribe(e: React.FormEvent) {
		e.preventDefault();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setStatus('error');
			setMessage('Enter a valid email');
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
				setMessage('Subscribed! Please check your inbox.');
				setEmail('');
			} else {
				const data = await res.json().catch(() => ({}));
				setStatus('error');
				setMessage(data?.error || 'Subscription failed');
			}
		} catch (err) {
			setStatus('error');
			setMessage('Network error');
		}
	}
	return (
		<footer className="pb-6 pt-16 lg:pb-8 lg:pt-24">
			<div className="px-4 lg:px-8">
				<div className="md:flex md:items-start md:justify-between gap-6">
					<a
						href="/"
						className="flex items-center gap-x-2"
						aria-label={brandName}>
						<img
							src="/logo.png"
							alt="Logo"
							className="h-9 w-auto"
						/>
					</a>
					{/* Subscribe compact form */}
					<div className="mt-6 md:mt-0 w-full md:max-w-md">
						<h3 className="text-sm font-semibold tracking-wide">Subscribe</h3>
						<p className="text-sm text-muted-foreground mt-1">
							Get updates in your inbox.
						</p>
						<form
							onSubmit={handleSubscribe}
							className="mt-3 flex gap-2">
							<label
								htmlFor="footer-subscribe"
								className="sr-only">
								Email
							</label>
							<Input
								id="footer-subscribe"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								aria-invalid={status === 'error' ? 'true' : 'false'}
								className="h-10 rounded-full"
							/>
							<Button
								type="submit"
								size="sm"
								disabled={status === 'loading'}
								className="h-10 rounded-full px-4">
								{status === 'loading' ? 'Subscribing…' : 'Subscribe'}
							</Button>
						</form>
						{message && (
							<p
								className={`mt-2 text-xs ${status === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
								{message}
							</p>
						)}
					</div>
					<ul className="flex list-none mt-6 md:mt-0 space-x-3">
						{socialLinks.map((link, i) => (
							<li key={i}>
								<Button
									variant="secondary"
									size="icon"
									className="h-10 w-10 rounded-full"
									asChild>
									<a
										href={link.href}
										target="_blank"
										aria-label={link.label}>
										{link.icon}
									</a>
								</Button>
							</li>
						))}
					</ul>
				</div>

				<div className="border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
					<div className=" text-sm leading-6 text-muted-foreground whitespace-nowrap flex flex-row gap-2 ">
						<div>{copyright.text}</div>
						{copyright.license && <div>{copyright.license}</div>}
					</div>
					<nav className="lg:mt-0 lg:col-[4/11]">
						<ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
							{mainLinks.map((link, i) => (
								<li
									key={i}
									className="my-1 mx-2 shrink-0">
									<a
										href={link.href}
										className="text-sm text-primary underline-offset-4 hover:underline">
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</footer>
	);
}
