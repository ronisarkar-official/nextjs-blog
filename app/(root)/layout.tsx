import { Metadata } from 'next';
import Navbar from '../../components/Navbar';


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
		</main>
	);
}
