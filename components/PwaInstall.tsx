'use client';

import { Download, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// components/PwaInstall.tsx
// Client component that listens for the `beforeinstallprompt` event and shows
// a polished Tailwind UI prompt. It remembers dismissals in localStorage.

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaInstall() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [visible, setVisible] = useState(false);
	const storageKey = 'pwaPromptDismissed';
	const dismissDurationDays = 7; // hide for 7 days after dismiss/install

	useEffect(() => {
		function handler(e: Event) {
			// The spec recommends calling preventDefault() so the browser doesn't
			// immediately show its own prompt.
			try {
				(e as Event & { preventDefault?: () => void }).preventDefault?.();
			} catch (err) {
				// ignore
			}

			setDeferredPrompt(e as BeforeInstallPromptEvent);

			// respect stored dismissal timestamp
			try {
				const raw = localStorage.getItem(storageKey);
				if (raw) {
					const ts = parseInt(raw, 10);
					if (!Number.isNaN(ts)) {
						const diffDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
						if (diffDays < dismissDurationDays) {
							return; // don't show right now
						}
					}
				}
			} catch (err) {
				// localStorage might be unavailable; fall through and show
			}

			setVisible(true);
		}

		window.addEventListener('beforeinstallprompt', handler as EventListener);
		return () =>
			window.removeEventListener(
				'beforeinstallprompt',
				handler as EventListener,
			);
	}, []);

	useEffect(() => {
		if (deferredPrompt) setVisible(true);
	}, [deferredPrompt]);

	const handleInstall = async () => {
		if (!deferredPrompt) {
			setVisible(false);
			return;
		}

		try {
			// Show the native prompt
			await deferredPrompt.prompt();
			const choice = await deferredPrompt.userChoice;
			// choice?.outcome is usually 'accepted' or 'dismissed'
			// you can send analytics here if you want
		} catch (err) {
			// non-fatal
			// console.error('PWA install error', err);
		} finally {
			// hide and remember interaction so we don't nag users
			setVisible(false);
			setDeferredPrompt(null);
			try {
				localStorage.setItem(storageKey, String(Date.now()));
			} catch (err) {}
		}
	};

	const handleDismiss = () => {
		setVisible(false);
		try {
			localStorage.setItem(storageKey, String(Date.now()));
		} catch (err) {}
	};

	if (!visible) return null;

	return (
		<div
			aria-live="polite"
			className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-[1000] max-w-sm w-full transition-all duration-300 transform translate-y-0 opacity-100">
			<div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 p-4 flex gap-3 items-start">
				{/* App icon */}
				<div className="flex-shrink-0">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
						<img
							src="/icon.png"
							alt="icon"
						/>
					</div>
				</div>

				{/* Content */}
				<div className="grow">
					<div className="flex items-start gap-2">
						<div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
							Install app for quick access
						</div>
						<button
							aria-label="Close prompt"
							className="ml-auto -mr-1 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
							onClick={handleDismiss}>
							<X />
						</button>
					</div>

					<p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
						Add this app to your home screen for faster access and offline
						support.
					</p>

					<div className="mt-3 flex items-center gap-2">
						<button
							onClick={handleInstall}
							className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
							{/* Install icon */}
							<Download />
							Install
						</button>

						<button
							onClick={handleDismiss}
							className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
							Not now
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
