import { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import { Footer } from '@/components/footer';
import { Hexagon, Twitter, Github } from 'lucide-react';


export const metadata: Metadata = {
	title: 'Startup Hub',
	description: 'A platform for startup enthusiasts',
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
							href: 'https://twitter.com',
							label: 'Twitter',
						},
						{
							icon: <Github className="h-5 w-5" />,
							href: 'https://github.com',
							label: 'GitHub',
						},
					]}
					mainLinks={[
						{ href: '/products', label: 'Products' },
						{ href: '/about', label: 'About' },
						{ href: '/blog', label: 'Blog' },
						{ href: '/contact', label: 'Contact' },
					]}
					legalLinks={[
						{ href: '/privacy', label: 'Privacy' },
						{ href: '/terms', label: 'Terms' },
					]}
					copyright={{
						text: '© 2024 Awesome Corp',
						license: 'All rights reserved',
					}}
				/>
			</div>
		</main>
	);
}
