import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffWeek = Math.floor(diffDay / 7);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffDay / 365);

	if (diffSec < 60) return 'just now';
	if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
	if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
	if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
	if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
	if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
	return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
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
