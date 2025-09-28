// components/Greeting.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Part = 'morning' | 'afternoon' | 'evening' | 'night';

const PARTS: { name: Part; startHour: number }[] = [
	{ name: 'morning', startHour: 5 },
	{ name: 'afternoon', startHour: 12 },
	{ name: 'evening', startHour: 17 },
	{ name: 'night', startHour: 21 },
];

function getPart(date = new Date()): Part {
	const h = date.getHours();
	if (h >= 5 && h < 12) return 'morning';
	if (h >= 12 && h < 17) return 'afternoon';
	if (h >= 17 && h < 21) return 'evening';
	return 'night';
}

function getNextBoundary(date = new Date()) {
	const h = date.getHours();
	for (const part of PARTS) {
		if (h < part.startHour) {
			const next = new Date(date);
			next.setHours(part.startHour, 0, 0, 0);
			return next;
		}
	}
	const next = new Date(date);
	next.setDate(date.getDate() + 1);
	next.setHours(PARTS[0].startHour, 0, 0, 0);
	return next;
}

function msUntilNextMinute(date = new Date()) {
	return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds());
}

export default function Greeting({
	className = '',
	name,
	variant = 'white',
	iconVariant = 'filled',
}: {
	className?: string;
	name?: string;
	variant?: 'white' | 'outline' | 'soft';
	iconVariant?: 'filled' | 'outline';
}) {
	const [part, setPart] = useState<Part | null>(null);
	const [timeText, setTimeText] = useState('');
	const shouldReduceMotion = useReducedMotion();

	const update = useCallback(() => {
		const now = new Date();
		setPart(getPart(now));
		setTimeText(
			now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		);
	}, []);

	useEffect(() => {
		let mounted = true;
		let boundaryTimer: ReturnType<typeof setTimeout> | null = null;
		let minuteTimer: ReturnType<typeof setTimeout> | null = null;

		function scheduleBoundary() {
			if (!mounted) return;
			update();
			const next = getNextBoundary(new Date());
			const ms = next.getTime() - Date.now();
			boundaryTimer = setTimeout(() => scheduleBoundary(), ms + 50);
		}

		function scheduleMinuteTick() {
			if (!mounted) return;
			minuteTimer = setTimeout(function tick() {
				if (!mounted) return;
				setTimeText(
					new Date().toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					}),
				);
				minuteTimer = setTimeout(tick, 60_000);
			}, msUntilNextMinute(new Date()));
		}

		scheduleBoundary();
		scheduleMinuteTick();

		return () => {
			mounted = false;
			if (boundaryTimer) clearTimeout(boundaryTimer);
			if (minuteTimer) clearTimeout(minuteTimer);
		};
	}, [update]);

	// Use original emoji set for clear, friendly visual cue.
	const emojis: Record<Part, string> = {
		morning: '🌅',
		afternoon: '☀️',
		evening: '🌇',
		night: '🌙',
	};

	const texts: Record<Part, string> = {
		morning: 'Good morning',
		afternoon: 'Good afternoon',
		evening: 'Good evening',
		night: 'Good night',
	};

	const styles: Record<string, string> = {
		white:
			'bg-white/95 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 shadow-sm',
		outline:
			'bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700',
		soft: 'bg-white/6 dark:bg-white/6 text-gray-900 dark:text-white border border-transparent',
	};

	if (!part) {
		return (
			<div
				className={className}
				suppressHydrationWarning
				aria-hidden={false}>
				<div
					className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-900 border border-gray-100 shadow-sm"
					aria-hidden>
					<span className="text-sm">{emojis.afternoon}</span>
					<span>Good afternoon</span>
				</div>
			</div>
		);
	}

	const Container: any = shouldReduceMotion ? 'div' : motion.button;

	return (
		<Container
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.28, ease: 'easeOut' }}
			className={`${className} inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200  active:translate-y-0`}
			role="status"
			aria-live="polite">
			<span
				className="flex-none text-sm"
				aria-hidden>
				{emojis[part]}
			</span>

			<span className="leading-none text-sm">
				{texts[part]}
				{name ? `, ${name}` : ''}
				<span className="sr-only"> — it is {timeText} local time</span>
			</span>

			{/* tiny premium accent: subtle separator and micro-text time */}
			<span
				className="ml-2 h-4 w-px bg-gray-400 dark:bg-gray-800"
				aria-hidden
			/>
			<span className="text-xs opacity-70 ml-2">{timeText}</span>
		</Container>
	);
}
