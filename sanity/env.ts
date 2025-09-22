// sanity/env.ts
import 'dotenv/config'; // ensure .env is loaded for scripts that run outside Next.js

// Prefer explicit API-version string fallback
export const apiVersion: string =
	process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-17';

// Helper that asserts a named env var exists and is not an empty string
function assertEnv(name: string): string {
	const value = process.env[name];
	if (value === undefined || value === '') {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
}

// Required values — will throw early with a clear error if missing
export const dataset: string = assertEnv('NEXT_PUBLIC_SANITY_DATASET');
export const projectId: string = assertEnv('NEXT_PUBLIC_SANITY_PROJECT_ID');

// Optional token — keep undefined if not provided (use assertEnv if you want to force it)
export const token: string | undefined = process.env.SANITY_WRITE_TOKEN;
