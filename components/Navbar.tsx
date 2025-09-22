// File: app/components/Navbar.tsx (server component)

import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';
import ScrollHideController from './ScrollHideController';

type Session = any;

// Server actions for auth (keeps them server-side so forms can call them)
async function handleSignIn() {
	'use server';
	await signIn('github');
}

async function handleSignOut() {
	'use server';
	await signOut({ redirectTo: '/' });
}

export default async function Navbar() {
	const session: Session = await auth();

	return (
		<header
			data-scroll-hide
			className="bg-white/60 backdrop-blur sticky top-0 z-50 border-b border-gray-200 transform transition-transform duration-300 ease-in-out">
			{/* Client-side controller that hides on scroll-down and shows on scroll-up. */}
			<ScrollHideController />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 gap-4">
					{/* Left: Logo + primary links */}
					<div className="flex items-center gap-6">
						<Link
							href="/"
							className="flex items-center gap-3"
							aria-label="Home">
							<img
								src="/logo.png"
								alt="Logo"
								className="h-9 w-auto"
							/>
						</Link>
					</div>

					{/* Right: actions */}
					<div className="flex items-center gap-3">
						{session && session.user && (
							<Link
								href="/startups/create"
								className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-md shadow-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
									aria-hidden>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								New Post
							</Link>
						)}

						{/* Notifications (stub) */}
						{session && session.user && (
							<button
								type="button"
								className="relative p-2 rounded-md hover:bg-gray-100"
								aria-label="View notifications">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
									aria-hidden>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
									/>
								</svg>
								<span className="sr-only">3 new notifications</span>
								<span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
									3
								</span>
							</button>
						)}

						{/* Profile / Auth */}
						{session && session.user ?
							<details className="relative">
								<summary
									className="flex items-center gap-2 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
									aria-haspopup="true"
									aria-expanded="false">
									<img
										src={session.user.image || '/images/default-avatar.png'}
										alt={session.user.name || 'User'}
										className="h-9 w-9 rounded-full object-cover"
									/>
								</summary>

								<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2">
									<div className="px-3 py-2 border-b border-gray-100">
										<p className="text-sm font-medium">{session.user.name}</p>
										<p className="text-xs text-gray-500">
											{session.user.email}
										</p>
									</div>
									<Link
										href={`/user/${session.id}`}
										className="block px-3 py-2 text-sm hover:bg-gray-50">
										Profile
									</Link>
									<Link
										href="/admin"
										className="block px-3 py-2 text-sm hover:bg-gray-50">
										Admin
									</Link>
									<Link
										href="/settings"
										className="block px-3 py-2 text-sm hover:bg-gray-50">
										Settings
									</Link>
									<form
										action={handleSignOut}
										className="m-0">
										<button
											type="submit"
											className="w-full text-left text-red-600 px-3 py-2 text-sm hover:bg-gray-50">
											Logout
										</button>
									</form>
								</div>
							</details>
						:	<form
								action={handleSignIn}
								className="m-0">
								<button
									type="submit"
									className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50">
									Sign in
								</button>
							</form>
						}

						{/* Mobile menu toggle */}
						<details className="md:hidden relative">
							<summary className="p-2 rounded-md inline-flex items-center justify-center hover:bg-gray-100 cursor-pointer">
								<span className="sr-only">Open menu</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden>
									<path
										fillRule="evenodd"
										d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"
										clipRule="evenodd"
									/>
								</svg>
							</summary>

							<div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4">
								<nav className="flex flex-col gap-2">
									<Link
										href="/admin"
										className="px-2 py-2 rounded hover:bg-gray-50">
										Dashboard
									</Link>
									<Link
										href="/blog"
										className="px-2 py-2 rounded hover:bg-gray-50">
										Posts
									</Link>
									{session && session.user && (
										<Link
											href="/blog/create"
											className="px-2 py-2 rounded hover:bg-gray-50">
											Create
										</Link>
									)}
									<Link
										href="/admin/categories"
										className="px-2 py-2 rounded hover:bg-gray-50">
										Categories
									</Link>
									<Link
										href="/admin/users"
										className="px-2 py-2 rounded hover:bg-gray-50">
										Users
									</Link>

									<div className="mt-2 border-t pt-2">
										{session && session.user ?
											<>
												<Link
													href={`/user/${session.user.id}`}
													className="block px-2 py-2 rounded hover:bg-gray-50">
													Profile
												</Link>
												<form
													action={handleSignOut}
													className="m-0">
													<button
														type="submit"
														className="w-full text-left text-red-600 px-2 py-2 rounded hover:bg-gray-50">
														Logout
													</button>
												</form>
											</>
										:	<form
												action={handleSignIn}
												className="m-0">
												<button
													type="submit"
													className="w-full text-left px-2 py-2 rounded hover:bg-gray-50">
													Sign in
												</button>
											</form>
										}
									</div>
								</nav>
							</div>
						</details>
					</div>
				</div>
			</div>
		</header>
	);
}

