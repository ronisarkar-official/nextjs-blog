import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeClient } from '@/sanity/lib/write-client';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_ID_QUERY } from '@/sanity/lib/queries';

export async function PUT(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, username, email, bio, image } = body;

		// Validate required fields
		if (!name || !username || !email) {
			return NextResponse.json(
				{ error: 'Name, username, and email are required' },
				{ status: 400 },
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Invalid email format' },
				{ status: 400 },
			);
		}

		// Validate username format
		const usernameRegex = /^[a-zA-Z0-9_-]+$/;
		if (!usernameRegex.test(username)) {
			return NextResponse.json(
				{
					error:
						'Username can only contain letters, numbers, hyphens, and underscores',
				},
				{ status: 400 },
			);
		}

		// Check if username is already taken by another user
		const existingUser = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "author" && username == $username && _id != $currentUserId][0]`,
				{
					username,
					currentUserId: session.id,
				},
			);

		if (existingUser) {
			return NextResponse.json(
				{ error: 'Username is already taken' },
				{ status: 400 },
			);
		}

		// Check if email is already taken by another user
		const existingEmail = await client
			.withConfig({ useCdn: false })
			.fetch(
				`*[_type == "author" && email == $email && _id != $currentUserId][0]`,
				{
					email,
					currentUserId: session.id,
				},
			);

		if (existingEmail) {
			return NextResponse.json(
				{ error: 'Email is already taken' },
				{ status: 400 },
			);
		}

		// Update user in Sanity
		const updatedUser = await writeClient
			.patch(session.id)
			.set({
				name: name.trim(),
				username: username.trim(),
				email: email.trim(),
				bio: bio?.trim() || '',
				image: image || '',
			})
			.commit();

		return NextResponse.json({
			success: true,
			user: updatedUser,
		});
	} catch (error) {
		console.error('Settings update error:', error);
		return NextResponse.json(
			{ error: 'Failed to update settings' },
			{ status: 500 },
		);
	}
}
