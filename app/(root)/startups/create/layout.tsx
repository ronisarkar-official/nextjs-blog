import { Metadata } from 'next';
 // if you installed codemirror


export const metadata: Metadata = {
	title: 'Startup Hub',
	description: 'A platform for startup enthusiasts',
};
export default function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<main className="font-work-sans">
			

			{children}
		</main>
	);
}
