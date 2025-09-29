// File: app/(root)/contact/page.tsx

import React from 'react';
import Link from 'next/link';
import {
	Twitter,
	Linkedin,
	Instagram,
	Facebook,
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

export default function ContactPage() {
	return (
		<main className="min-h-screen bg-white text-black antialiased">
			<div className="max-w-3xl mx-auto px-6 py-20">
				<header className="text-center mb-10">
					<h1 className="text-4xl font-extrabold tracking-tight">
						Get in touch
					</h1>
					<p className="mt-3 text-gray-600">
						Follow {sitename} on social media — we&apos;d love to connect.
					</p>
				</header>

				<section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<a
							href={SOCIAL.twitter}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1"
							aria-label="Twitter">
							<div className="p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100">
								<Twitter className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<div className="font-semibold">Twitter</div>
								<div className="text-sm text-gray-500">Every Time Updated</div>
							</div>
						</a>

						<a
							href={SOCIAL.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1"
							aria-label="LinkedIn">
							<div className="p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100">
								<Linkedin className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<div className="font-semibold">LinkedIn</div>
								<div className="text-sm text-gray-500">Company profile</div>
							</div>
						</a>

						<a
							href={SOCIAL.instagram}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1"
							aria-label="Instagram">
							<div className="p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100">
								<Instagram className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<div className="font-semibold">Instagram</div>
								<div className="text-sm text-gray-500">Follow Us</div>
							</div>
						</a>

						<a
							href={SOCIAL.youtube}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1"
							aria-label="YouTube">
							<div className="p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100">
								<Youtube className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<div className="font-semibold">YouTube</div>
								<div className="text-sm text-gray-500">
									Subscribe for updates
								</div>
							</div>
						</a>

						<a
							href={SOCIAL.github}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1"
							aria-label="GitHub">
							<div className="p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100">
								<Github className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<div className="font-semibold">GitHub</div>
								<div className="text-sm text-gray-500">
									Open-source projects
								</div>
							</div>
						</a>

						<a
							href={SOCIAL.email}
							target={SOCIAL.email === '#' ? '_self' : '_blank'}
							rel="noopener noreferrer"
							className="group flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1"
							aria-label="Email">
							<div className="p-3 rounded-md bg-indigo-50 group-hover:bg-indigo-100">
								<Mail className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<div className="font-semibold">Email</div>
								<div className="text-sm text-gray-500">Contact us directly</div>
							</div>
						</a>
					</div>

					<div className="mt-8 text-center text-sm text-gray-500">
						<p>
							Prefer something else?{' '}
							<Link
								href="/"
								className="underline decoration-indigo-600">
								Visit {sitename}
							</Link>
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
