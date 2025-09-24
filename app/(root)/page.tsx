// app/page.tsx  (server component)
import React from 'react';
import { auth } from '@/auth'; // must be a server-side helper
import { redirect } from 'next/navigation';
import HomeClient from '@/components/HomeClient'; // client component (no server calls)

export default async function Page() {
	// server-side: check session
	const session = await auth(); // <-- must be usable on server

	if (session) {
		// server redirect (no client flash)
		redirect('/feed');
	}

	// not logged in -> render client UI
	return <HomeClient />;
}
