import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_ID_QUERY } from '@/sanity/lib/queries';
import SettingsDashboard from '@/components/SettingsDashboard';

export default async function SettingsPage() {
	const session = await auth();

	if (!session?.id) {
		redirect('/');
	}

	// Fetch user data from Sanity
	const user = await client
		.withConfig({ useCdn: false })
		.fetch(AUTHOR_BY_ID_QUERY, {
			id: session.id,
		});

	if (!user) {
		redirect('/');
	}

	return <SettingsDashboard user={user} />;
}
