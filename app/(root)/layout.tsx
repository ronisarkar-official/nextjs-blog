import { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import { Footer } from '@/components/footer';
import { Hexagon, Twitter, Github } from 'lucide-react';
const sitename = process.env.NEXT_PUBLIC_SITE_NAME;
const sitetag = process.env.NEXT_PUBLIC_SITE_TAGLINE;
const currentYear = new Date().getFullYear();
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

export const metadata: Metadata = {
	title: `${sitename}: ${sitetag}`,
	description: `On ${sitename}, anyone can share intricate specifications, useful methodologies, and technical expertise with the global developer and engineering community.`,
};
export default function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<main className="font-work-sans">
			<Navbar />

			{children}
			<div className="w-full">
				<Footer
					logo="/logo.png"
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
						{ href: '/feed', label: 'Blogs' },
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
