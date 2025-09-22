import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SearchForm from '@/components/SearchForm';
import StartupForm from '@/components/StartupForm';

export default async function page() {
  const session = await auth();
  if(!session) redirect('/') 
	return (
		<StartupForm />
	);
}
