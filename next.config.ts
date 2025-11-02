// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

// --- added for PWA ---
import nextPwa from 'next-pwa';
// @ts-expect-error: No types for 'next-pwa/cache'
import runtimeCaching from 'next-pwa/cache.js';

const withPWA = nextPwa({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development', // don't register SW in dev
	register: true,
	skipWaiting: true,
	runtimeCaching,
});
// --- end PWA additions ---

const nextConfig: NextConfig = {
	reactCompiler: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		dangerouslyAllowSVG: true,
		qualities: [25, 50,60, 75],
		// NOTE: unoptimized: true disables Next's image optimization (and hostname checks).
		// Keep it if you want to bypass hostname issues in dev/prod. Remove if you want Next optimizations.
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'ik.imagekit.io',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: '*.cloudfront.net',
				port: '',
				pathname: '/**',
			},
			// add other hosts you actually need...
		],
	},
	// add redirects here instead of a separate CommonJS export
	async redirects() {
		return [
			{
				source: '/games/borderlands-4-requirements.html',

				destination: '/startups/borderlands-4-system-requirements',
				permanent: true,
			},
			{
				source: '/2025/09/battlefield-6-system-requirements.html',
				destination: '/startups/battlefield-6-system-requirements',
				permanent: true,
			},
			{
				source: '/2025/09/arc-raiders-system-requirements.html',
				destination: '/',
				permanent: true,
			},
			{
				source: '/2025/09/borderlands-4-system-requirements.html',
				destination: '/startups/borderlands-4-system-requirements',
				permanent: true,
			},
		];
	},
	experimental: {
		turbopackFileSystemCacheForDev: true,

		// after: true,
	},
	devIndicators: {
		position: 'bottom-right',
	},
};

// wrap with PWA THEN wrap with Sentry (keep your Sentry options unchanged)
export default withSentryConfig(withPWA(nextConfig), {
	org: 'spechype',
	project: 'javascript-nextjs',
	silent: !process.env.CI,
	widenClientFileUpload: true,
	disableLogger: true,
	automaticVercelMonitors: true,
});
