// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

// --- added for PWA ---
import nextPwa from 'next-pwa';
// @ts-expect-error: No types for 'next-pwa/cache'
import runtimeCaching from 'next-pwa/cache';

const withPWA = nextPwa({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development', // don't register SW in dev
	register: true,
	skipWaiting: true,
	runtimeCaching,
});
// --- end PWA additions ---

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		dangerouslyAllowSVG: true,
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
				destination: '/',
				permanent: true,
			},
		];
	},
	experimental: {
		ppr: 'incremental',
		after: true,
	},
	devIndicators: {
		appIsrStatus: true,
		buildActivity: true,
		buildActivityPosition: 'bottom-right',
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
