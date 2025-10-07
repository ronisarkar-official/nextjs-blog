// File: app/components/Navbar.tsx (server component)

import Link from 'next/link';
import { auth, signIn, signOut } from '@/auth';
// notifications removed
import ScrollHideController from './ScrollHideController';
import React from 'react';
import {
	User,
	Home,
	Settings,
	LogOut,
	LogIn,
	PlusCircle,
	Files,
	Plus,
	ChartNoAxesColumnIncreasing,
} from 'lucide-react';
import { ModeToggle } from './DarkmodeButton';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from './ui/dropdown-menu';

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

	// robust user id (map to Sanity author _id when possible)
	let userId = session?.user?.id ?? session?.user?._id ?? session?.id ?? '';

	// notifications removed

	// nav links (rendered server-side)
	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/about-us', label: 'About Us' },
		{ href: '/terms-and-condition', label: 'Terms and Conditions' },
		{ href: '/privacy-policy', label: 'Privacy Policy' },
		{ href: '/contact-us', label: 'Contact Us' },
	];

	return (
		<header
			data-scroll-hide
			className="bg-white/60 dark:bg-gray-900/60 backdrop-blur sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out">
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
								src="/logo.webp"
								alt="Logo"
								className="h-9 w-auto dark:brightness-0 dark:invert"
							/>
						</Link>

						{/* Nav links: hidden on small screens, visible from md+ */}
					</div>

					<nav
						aria-label="Primary"
						className="hidden md:flex flex-row">
						{navLinks.map((link) => {
							return (
								<Link
									key={link.href}
									href={link.href}
									className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800`}>
									<span>{link.label}</span>
								</Link>
							);
						})}
					</nav>

					{/* Right: actions */}
					<div className="flex items-center gap-4">
						{/* New post CTA - visible for signed-in users */}
						{session?.user && (
							<Link
								href="/startups/create"
								className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded-md shadow-sm transition">
								<Plus className="h-4 w-4" />
								New Post
							</Link>
						)}

						{/* Notifications removed */}

						{/* Profile / Auth */}
						{session?.user ?
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										className="flex items-center gap-2 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
										aria-haspopup="true">
										<img
											src={session.user.image ?? '/images/default-avatar.png'}
											alt={session.user.name ?? 'User'}
											className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
										/>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-56">
									<DropdownMenuLabel>
										<div className="flex flex-col">
											<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
												{session.user.name}
											</span>
											<span className="text-xs text-gray-500 dark:text-gray-400 break-words">
												{session.user.email}
											</span>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<Link href={`/user/${encodeURIComponent(userId)}`}>
										<DropdownMenuItem>
											<User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
											Profile
										</DropdownMenuItem>
									</Link>
									<Link
										href="/startups/create"
										className="md:hidden">
										<DropdownMenuItem>
											<PlusCircle className="h-4 w-4 text-gray-500 dark:text-gray-300" />
											Create
										</DropdownMenuItem>
									</Link>
									<Link href={`/user/posts/${encodeURIComponent(userId)}`}>
										<DropdownMenuItem>
											<Files className="h-4 w-4 text-gray-500 dark:text-gray-300" />
											Posts
										</DropdownMenuItem>
									</Link>
									<Link href={`/user/${encodeURIComponent(userId)}/analytics`}>
										<DropdownMenuItem>
											<ChartNoAxesColumnIncreasing className="h-4 w-4 text-gray-500 dark:text-gray-300" />
											Analytics
										</DropdownMenuItem>
									</Link>
									<Link href="/settings">
										<DropdownMenuItem>
											<Settings className="h-4 w-4 text-gray-500 dark:text-gray-300" />
											Settings
										</DropdownMenuItem>
									</Link>
									<DropdownMenuSeparator />
									<form
										action={handleSignOut}
										className="m-0">
										<DropdownMenuItem asChild>
											<button
												type="submit"
												className="w-full text-left flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
												<LogOut className="h-4 w-4" />
												Logout
											</button>
										</DropdownMenuItem>
									</form>
								</DropdownMenuContent>
							</DropdownMenu>
						:	<form
								action={handleSignIn}
								className="m-0">
								<button
									type="submit"
									className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md text-sm transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-gray-700 dark:text-gray-100">
									<LogIn className="h-4 w-4 text-gray-500 dark:text-gray-300" />
									Sign in
								</button>
							</form>
						}
						<ModeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}
