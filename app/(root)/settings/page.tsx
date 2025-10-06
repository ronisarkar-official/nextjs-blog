import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_ID_QUERY } from '@/sanity/lib/queries';
import SettingsForm from '@/components/SettingsForm';

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

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
					<div className="px-6 py-8">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
							Account Settings
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							Update your profile information and preferences
						</p>

						<SettingsForm user={user} />
					</div>
				</div>
			</div>
		</div>
	);
}
