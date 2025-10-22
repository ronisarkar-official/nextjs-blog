/**
 * Utility to clear the redirect cache
 * Call this after creating/updating/deleting redirects to ensure changes take effect immediately
 */

export async function clearRedirectCache() {
	try {
		// Trigger a cache revalidation by making a request to a special endpoint
		if (typeof window !== 'undefined') {
			await fetch('/api/redirects/revalidate', {
				method: 'POST',
			});
		}
	} catch (error) {
		console.error('Error clearing redirect cache:', error);
	}
}
