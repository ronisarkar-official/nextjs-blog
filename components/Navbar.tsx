// File: app/components/Navbar.tsx (server component)

import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';
import ScrollHideController from './ScrollHideController';
import React from 'react';
import {
	User,
	Home,
	Settings,
	LogOut,
	LogIn,
	PlusCircle,
	Bell,
	BellOff,
	Files,
	Plus,
	ChartNoAxesColumnIncreasing,
} from 'lucide-react';

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

	// robust user id (sanity/session differences)
	const userId = session?.user?.id ?? session?.user?._id ?? session?.id ?? '';

	// nav links (rendered server-side)
	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/about-us', label: 'About Us' },
		{
			href: '/terms-and-condition',
			label: 'Terms and Conditions',
		},

		{ href: '/privacy-policy', label: 'Privacy Policy' },
		{ href: '/contact-us', label: 'Contact Us' },
	];

	return (
		<header
			data-scroll-hide
			className="bg-white/60 backdrop-blur sticky top-0 z-50 border-b border-gray-200 transform transition-transform duration-300 ease-in-out">
			{/* Client-side controller that hides on scroll-down and shows on scroll-up. */}
			<ScrollHideController />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 gap-4">
					{/* Left: Logo */}
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

						{/* Nav links: hidden on small screens, visible from md+ */}
					</div>
					<nav
						aria-label="Primary"
						className="hidden md:flex flex-row ">
						{navLinks.map((link) => {
							
							return (
								<Link
									key={link.href}
									href={link.href}
									className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none  ">
									
									<span>{link.label}</span>
								</Link>
							);
						})}
					</nav>

					{/* Right: actions */}
					<div className="flex items-center gap-3">
						{/* New post CTA - visible for signed-in users */}
						{session?.user && (
							<Link
								href="/startups/create"
								className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-md shadow-sm">
								<Plus className="h-4 w-4" />
								New Post
							</Link>
						)}

						{/* Notifications (stub) */}
						{session?.user && (
							<details className="relative hidden md:block">
								<summary
									className="relative flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition"
									aria-haspopup="true"
									aria-expanded="false"
									aria-controls="notification-panel"
									aria-label="Notifications">
									<Bell
										className="h-5 w-5 text-gray-600"
										aria-hidden="true"
									/>
								</summary>

								<div
									id="notification-panel"
									role="menu"
									aria-label="Notifications panel"
									className="absolute right-0 mt-2 w-80 max-w-[92vw] sm:max-w-[62vw] bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-2 z-50">
									<div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
										<h3 className="text-sm font-medium text-gray-900">
											Notifications
										</h3>
										<span className="text-xs text-gray-500">Recent</span>
									</div>

									<div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
										<BellOff
											className="h-6 w-6 text-gray-400"
											aria-hidden="true"
										/>
										<p className="text-sm text-gray-600">No notifications</p>
										<p className="text-xs text-gray-500">
											You're all caught up
										</p>
									</div>

									<div className="hidden overflow-y-auto max-h-64 divide-y divide-gray-100">
										{/* Map notifications here when available; role="menuitem" for items */}
									</div>
								</div>
							</details>
						)}

						{/* Profile / Auth */}
						{session?.user ?
							<details className="relative">
								<summary
									className="flex items-center gap-2 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
									aria-haspopup="true"
									aria-expanded="false">
									<img
										src={session.user.image ?? '/images/default-avatar.png'}
										alt={session.user.name ?? 'User'}
										className="h-9 w-9 rounded-full object-cover"
									/>
								</summary>

								<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-2">
									<div className="px-3 py-2 border-b border-gray-100">
										<p className="text-sm font-medium">{session.user.name}</p>
										<p className="text-xs text-gray-500 break-words">
											{session.user.email}
										</p>
									</div>

									<Link
										href={`/user/${encodeURIComponent(userId)}`}
										className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
										<User className="h-4 w-4 text-gray-500" />
										Profile
									</Link>

									<Link
										href="/startups/create"
										className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 md:hidden">
										<PlusCircle className="h-4 w-4 text-gray-500" />
										Create
									</Link>

									<Link
										href={`/user/posts/${encodeURIComponent(userId)}`}
										className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
										<Files className="h-4 w-4 text-gray-500" />
										Posts
									</Link>

									<Link
										href="/views"
										className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
										<ChartNoAxesColumnIncreasing className="h-4 w-4 text-gray-500" />
										Analytics
									</Link>

									<Link
										href="/settings"
										className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100">
										<Settings className="h-4 w-4 text-gray-500" />
										Settings
									</Link>

									<form
										action={handleSignOut}
										className="m-0 border-t border-gray-100">
										<button
											type="submit"
											className="w-full text-left flex items-center gap-2 text-red-600 px-3 py-2 text-sm hover:bg-gray-50">
											<LogOut className="h-4 w-4" />
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
									className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
									<LogIn className="h-4 w-4 text-gray-500" />
									Sign in
								</button>
							</form>
						}
					</div>
				</div>
			</div>
		</header>
	);
}
