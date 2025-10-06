import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import {
	AUTHOR_BY_GITHUB_ID_QUERY,
	AUTHOR_BY_ID_QUERY,
} from '@/sanity/lib/queries';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [GitHub],
	callbacks: {
		async signIn({ user, profile }: any) {
			const { name, email, image } = user;
			const { id, login, bio } = profile;
			const existingUser = await client
				.withConfig({ useCdn: false })
				.fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
					id,
				});

			if (!existingUser) {
				await writeClient.create({
					_type: 'author',
					id,
					name,
					username: login,
					email,
					image,
					bio: bio || '',
				});
			}

			return true;
		},
		async jwt({ token, account, profile }: any) {
			if (account && profile) {
				const user = await client
					.withConfig({ useCdn: false })
					.fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
						id: profile?.id,
					});

				token.id = user?._id;
			}

			return token;
		},
		async session({ session, token }: any) {
			Object.assign(session, { id: token.id });

			// Fetch fresh user data from Sanity to ensure profile updates are reflected
			if (token.id) {
				try {
					const user = await client
						.withConfig({ useCdn: false })
						.fetch(AUTHOR_BY_ID_QUERY, {
							id: token.id,
						});

					if (user) {
						// Update session with fresh user data
						session.user = {
							...session.user,
							name: user.name,
							email: user.email,
							image: user.image,
						};
					}
				} catch (error) {
					console.error('Failed to fetch fresh user data for session:', error);
				}
			}

			return session;
		},
	},
});
