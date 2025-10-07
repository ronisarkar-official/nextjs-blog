import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function parseServerActionResponse<T>(response: T) {
	return JSON.parse(JSON.stringify(response));
}

export function addDays(date: Date, days: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d;
}

export function nextViewMilestone(currentViews: number): number | null {
	if (currentViews < 100) return 100;
	const n = Math.floor(currentViews / 100) * 100;
	return n + 100;
}
