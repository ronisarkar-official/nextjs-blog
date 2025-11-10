import { Metadata } from 'next';
import Footer from '@/components/footer';
import { Twitter, Github } from 'lucide-react';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Spechype';
const sitetag =
	process.env.NEXT_PUBLIC_SITE_TAGLINE ?? 'Gaming specs, news & reviews';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spechype.com';
const ogImage = process.env.NEXT_PUBLIC_OG_IMAGE ?? '/og-default.png';
const twitterHandle = process.env.NEXT_PUBLIC_SOCIAL_TWITTER_HANDLE ?? '';

const SOCIAL = {
	twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER ?? '#',
	linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? '#',
	instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? '#',
	youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? '#',
	github: process.env.NEXT_PUBLIC_SOCIAL_GITHUB ?? '#',
	email:
		process.env.NEXT_PUBLIC_CONTACT_EMAIL ?
			`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`
		:	'#',
};

// Set base URL so Next.js can build absolute asset/url metadata
export const metadataBase = new URL(siteUrl);

export const metadata: Metadata = {
	title: {
		default: `${sitename} — ${sitetag}`,
		template: `%s | ${sitename}`,
	},
	description: `Discover the latest gaming news, system requirements, hardware specs, reviews and in-depth insights on games and PC components.`,
	keywords: [
		'gaming',
		'game system requirements',
		'PC specs',
		'game reviews',
		'hardware benchmarks',
		'GPU requirements',
		'CPU requirements',
		'spechype',
	],
	authors: [{ name: sitename, url: siteUrl }],
	applicationName: sitename,
	metadataBase: new URL(siteUrl),
	alternates: {
		canonical: siteUrl,
	},
	openGraph: {
		title: `${sitename} — ${sitetag}`,
		description: `Discover the latest gaming news, system requirements, hardware specs, reviews and in-depth insights on games and PC components.`,
		url: siteUrl,
		siteName: sitename,
		images: [
			{
				url: `${siteUrl}${ogImage}`,
				width: 1200,
				height: 630,
				alt: `${sitename} preview image`,
			},
		],
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: `${sitename} — ${sitetag}`,
		description: `Gaming news, system requirements, specs, and reviews.`,
		creator: twitterHandle || undefined,
		images: [`${siteUrl}${ogImage}`],
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-touch-icon.png',
	},
	// optional: prefer-reduced-motion, theme color, etc
	other: {
		'theme-color': '#0f172a',
	},
};

export default function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const currentYear = new Date().getFullYear();

	// JSON-LD structured data (Organization + WebSite + potential SearchAction)
	const jsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${siteUrl}#organization`,
				name: sitename,
				url: siteUrl,
				logo: `${siteUrl}/logo.webp`,
				sameAs: [
					SOCIAL.twitter !== '#' ? SOCIAL.twitter : undefined,
					SOCIAL.linkedin !== '#' ? SOCIAL.linkedin : undefined,
					SOCIAL.instagram !== '#' ? SOCIAL.instagram : undefined,
					SOCIAL.youtube !== '#' ? SOCIAL.youtube : undefined,
				].filter(Boolean),
				contactPoint:
					process.env.NEXT_PUBLIC_CONTACT_PHONE ?
						[
							{
								'@type': 'ContactPoint',
								telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
								contactType: 'customer service',
							},
						]
					:	undefined,
			},
			{
				'@type': 'WebSite',
				'@id': `${siteUrl}#website`,
				url: siteUrl,
				name: sitename,
				description: `Gaming news, detailed system requirements, hardware reviews and guides.`,
				publisher: { '@id': `${siteUrl}#organization` },
				potentialAction: {
					'@type': 'SearchAction',
					target: `${siteUrl}/search?q={search_term_string}`,
					'query-input': 'required name=search_term_string',
				},
			},
		],
	};

	return (
		<main
			className="font-work-sans"
			lang="en">
			{/* JSON-LD for structured data (helps rich results & social panels) */}
			<script
				type="application/ld+json"
				// Using dangerouslySetInnerHTML because this is server-rendered layout
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			{children}
			<div className="w-full">
				<Footer
					logo="/logo.webp"
					brandName={sitename ?? 'Default Site Name'}
					socialLinks={[
						{
							icon: <Twitter className="h-5 w-5" />,
							href: SOCIAL.twitter,
							label: 'Twitter',
						},
						{
							icon: <Github className="h-5 w-5" />,
							href: SOCIAL.github,
							label: 'GitHub',
						},
					]}
					mainLinks={[
						{ href: '/disclaimer', label: 'Disclaimer' },
						{ href: '/about-us', label: 'About' },
						{ href: '/contact-us', label: 'Contact Us' },
					]}
					legalLinks={[
						{ href: '/privacy-policy', label: 'Privacy Policy' },
						{ href: '/terms-and-condition', label: 'Terms And Condition' },
					]}
					copyright={{
						text: `© ${currentYear} ${sitename}`,
						license: 'All rights reserved',
					}}
				/>
			</div>
		</main>
	);
}
