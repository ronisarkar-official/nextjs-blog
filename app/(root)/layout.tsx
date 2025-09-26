import { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import { Footer } from '@/components/footer';
import { Hexagon, Twitter, Github } from 'lucide-react';

export const metadata: Metadata = {
	title: 'SpecHype: Read, write, and share technical insights.',
	description:
		'On SpecHype, anyone can share intricate specifications, useful methodologies, and technical expertise with the global developer and engineering community.',
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
					brandName="SpecHype"
					socialLinks={[
						{
							icon: <Twitter className="h-5 w-5" />,
							href: 'https://x.com/ronisarkarDev',
							label: 'Twitter',
						},
						{
							icon: <Github className="h-5 w-5" />,
							href: 'https://github.com/ronisarkar-official',
							label: 'GitHub',
						},
					]}
					mainLinks={[
						{ href: '/products', label: 'Products' },
						{ href: '/about', label: 'About' },
						{ href: '/feed', label: 'Blog' },
						{ href: '/contact', label: 'Contact' },
					]}
					legalLinks={[
						{ href: '/privacy', label: 'Privacy' },
						{ href: '/terms', label: 'Terms' },
					]}
					copyright={{
						text: '© 2025 SpecHype',
						license: 'All rights reserved',
					}}
				/>
			</div>
		</main>
	);
}
