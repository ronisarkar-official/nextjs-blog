import React from 'react';
import { signIn } from '@/auth';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

async function handleSignIn() {
	'use server';
	await signIn('github');
}

export default function Page() {
	return (
		<div className="flex justify-center items-center h-screen m-0">
			<Card className="max-w-md">
				<CardHeader>
					<CardTitle>Sign in to Admin</CardTitle>
					<CardDescription>
						Sign in with GitHub to access the admin dashboard.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={handleSignIn}>
						<Button type="submit" className="w-full">
							<LogIn className="h-4 w-4" />
							Sign in with GitHub
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
