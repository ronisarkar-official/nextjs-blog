'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function ClientAccessDenied({
	slug,
	redirectTo,
}: {
	slug: string;
	redirectTo?: string;
}) {
	const router = useRouter();
	
	const duration = 1800;

	useEffect(() => {
		// show a clear, non-interactive toast
		toast.error('You are not the author — you cannot edit this startup.');

		// animate progress and redirect
		
		const redirectTimer = setTimeout(
			() => router.push(redirectTo ?? `/startups/${slug}`),
			duration + 100,
		);

		return () => {
			
			clearTimeout(redirectTimer);
		};
	}, [slug, redirectTo, router]);

	return (
		<>
			<Toaster position="top-right" />

			<div className="min-h-[55vh] flex items-center justify-center p-6">
				<div className="w-full max-w-md p-6 text-center">
					<div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-full bg-red-50 text-red-600">
						<svg
							className="h-6 w-6"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden>
							<path
								d="M12 1a4 4 0 00-4 4v3H7a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2h-1V5a4 4 0 00-4-4z"
								stroke="currentColor"
								strokeWidth="1.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M9 12v1a3 3 0 006 0v-1"
								stroke="currentColor"
								strokeWidth="1.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>

					<h2 className="text-lg font-semibold text-gray-900">Access denied</h2>
					<p className="mt-2 text-sm text-gray-600">
						You don’t have permission to edit this startup. Redirecting…
					</p>

					
					

					
				</div>
			</div>
		</>
	);
}
