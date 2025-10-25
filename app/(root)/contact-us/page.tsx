// File: app/(root)/contact-us/page.tsx
import React from 'react';
import Link from 'next/link';
import {
	Twitter,
	Linkedin,
	Instagram,
	Youtube,
	Github,
	Mail,
} from 'lucide-react';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME ?? 'SpecHype';

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

export const metadata = {
	title: `${sitename} — Contact`,
	description: `Get in touch with ${sitename} — social links`,
};

const ITEM_BASE =
	'group flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-transform transform hover:-translate-y-1';
const ITEM_BORDER = 'border-gray-100 dark:border-gray-700';
const CONTAINER =
	'p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100 dark:bg-indigo-900/25 dark:group-hover:bg-indigo-900/30';
const ICON = 'w-6 h-6 text-indigo-600 dark:text-indigo-300';
const TEXT_MUTED = 'text-sm text-gray-500 dark:text-gray-300';

const socials = [
	{
		key: 'twitter',
		label: 'Twitter',
		href: SOCIAL.twitter,
		desc: 'Every Time Updated',
		Icon: Twitter,
	},
	{
		key: 'linkedin',
		label: 'LinkedIn',
		href: SOCIAL.linkedin,
		desc: 'Company profile',
		Icon: Linkedin,
	},
	{
		key: 'instagram',
		label: 'Instagram',
		href: SOCIAL.instagram,
		desc: 'Follow Us',
		Icon: Instagram,
	},
	{
		key: 'youtube',
		label: 'YouTube',
		href: SOCIAL.youtube,
		desc: 'Subscribe for updates',
		Icon: Youtube,
	},
	{
		key: 'github',
		label: 'GitHub',
		href: SOCIAL.github,
		desc: 'Open-source projects',
		Icon: Github,
	},
	{
		key: 'email',
		label: 'Email',
		href: SOCIAL.email,
		desc: 'Contact us directly',
		Icon: Mail,
	},
];

export default function ContactPage() {
	return (
		<main className="min-h-screen  antialiased transition-colors duration-200">
			<div className="max-w-3xl mx-auto px-6 py-20">
				<header className="text-center mb-10">
					<h1 className="text-4xl font-extrabold tracking-tight">
						Get in touch
					</h1>
					<p className="mt-3 text-gray-600 dark:text-gray-300">
						Follow {sitename} on social media — we&apos;d love to connect.
					</p>
				</header>

				<section className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-8 border-gray-100 dark:border-gray-700">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{socials.map((s) => {
							const Icon = s.Icon;
							const isEmail = s.key === 'email';
							const target =
								isEmail ?
									s.href === '#' ?
										'_self'
									:	'_blank'
								:	'_blank';

							return (
								<a
									key={s.key}
									href={s.href}
									target={target}
									rel="noopener noreferrer"
									aria-label={s.label}
									className={`${ITEM_BASE} ${ITEM_BORDER}`}>
									<div className={`${CONTAINER}`}>
										<Icon className={ICON} />
									</div>

									<div>
										<div className="font-semibold text-black dark:text-white">
											{s.label}
										</div>
										<div className={TEXT_MUTED}>{s.desc}</div>
									</div>
								</a>
							);
						})}
					</div>

					<div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-300">
						<p>
							Prefer something else?{' '}
							<Link
								href="/"
								className="underline decoration-indigo-600 dark:decoration-indigo-400">
								Visit {sitename}
							</Link>
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
