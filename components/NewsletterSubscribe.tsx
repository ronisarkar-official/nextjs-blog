// components/NewsletterSubscribe.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewsletterSubscribeProps {
	className?: string;
	title?: string;
	description?: string;
}

export default function NewsletterSubscribe({
	className,
	title = 'Stay in the loop',
	description = 'Get the best stories, tips, and updates delivered to your inbox.',
}: NewsletterSubscribeProps) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<
		'idle' | 'loading' | 'success' | 'error'
	>('idle');
	const [message, setMessage] = useState('');

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
				setMessage('Thanks for subscribing! Please check your inbox.');
				setEmail('');
			} else {
				const data = await res.json().catch(() => ({}));
				setStatus('error');
				setMessage(data?.error || 'Subscription failed. Try again later.');
			}
		} catch (err) {
			setStatus('error');
			setMessage('Network error. Please try again.');
		}
	}

	return (
		<section
			className={cn(
				'relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-indigo-950 dark:via-gray-900 dark:to-emerald-950 p-6 sm:p-10',
				'shadow-sm',
				className,
			)}
			aria-labelledby="newsletter-heading">
			<div
				className="absolute -top-24 -right-24 size-48 rounded-full bg-indigo-200/30 blur-3xl"
				aria-hidden="true"
			/>
			<div
				className="absolute -bottom-24 -left-24 size-56 rounded-full bg-emerald-200/20 blur-3xl"
				aria-hidden="true"
			/>

			<div className="relative z-10 grid gap-6 lg:grid-cols-2 lg:items-center">
				<div>
					<h2
						id="newsletter-heading"
						className="text-2xl sm:text-3xl font-extrabold tracking-tight">
						{title}
					</h2>
					<p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-prose">
						{description}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col sm:flex-row gap-3">
					<label
						htmlFor="newsletter-email"
						className="sr-only">
						Email address
					</label>
					<Input
						id="newsletter-email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						aria-invalid={status === 'error' ? 'true' : 'false'}
						className="h-11 sm:h-12 rounded-full bg-white/80 dark:bg-gray-900/70 backdrop-blur border-gray-200 dark:border-gray-700"
					/>
					<Button
						type="submit"
						size="lg"
						disabled={status === 'loading'}
						className="h-11 sm:h-12 rounded-full px-6">
						{status === 'loading' ? 'Subscribing…' : 'Subscribe'}
					</Button>
				</form>

				{message && (
					<div
						role={status === 'error' ? 'alert' : 'status'}
						className={cn(
							'relative z-10 -mt-3 lg:mt-0 text-sm',
							status === 'error' ?
								'text-red-600 dark:text-red-400'
							:	'text-emerald-700 dark:text-emerald-400',
						)}>
						{message}
					</div>
				)}
			</div>
		</section>
	);
}
