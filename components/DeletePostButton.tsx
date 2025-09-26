'use client';

import { TrashIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
	slug: string;
	onDeleted?: (deletedId?: string) => void;
	className?: string;
	children?: React.ReactNode;
};

export default function DeletePostButton({
	slug,
	onDeleted,
	className,
	children,
}: Props) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [open, setOpen] = useState(false);
	const cancelRef = useRef<HTMLButtonElement | null>(null);

	// move focus to the cancel button when dialog opens (simple accessibility improvement)
	useEffect(() => {
		if (open) cancelRef.current?.focus();
	}, [open]);

	async function confirmDelete() {
		setIsDeleting(true);
		const toastId = toast.loading('Deleting startup...');

		try {
			const res = await fetch('/api/startups/delete', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ slug }),
			});

			const json = await res.json();
			if (!res.ok) throw new Error(json?.error || 'Delete failed');

			// success
			toast.success('Startup deleted.', { id: toastId });
			onDeleted?.(json.deletedId);
		} catch (err: any) {
			console.error(err);
			toast.error(err?.message ?? 'Failed to delete. Check console.', {
				id: toastId,
			});
		} finally {
			setIsDeleting(false);
			setOpen(false);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				disabled={isDeleting}
				className={className}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls="delete-startup-dialog"
				aria-busy={isDeleting}>
				{isDeleting ? 'Deleting…' : (children ?? 'Delete')}
				
			</button>

			{open && (
				// Lightweight alert dialog (accessible props included)
				<div
					id="delete-startup-dialog"
					role="alertdialog"
					aria-labelledby="delete-startup-title"
					aria-describedby="delete-startup-desc"
					aria-modal="true"
					className="fixed inset-0 z-50 flex items-center justify-center p-4">
					{/* backdrop */}
					<div
						className="fixed inset-0 bg-black/50"
						onClick={() => !isDeleting && setOpen(false)}
						aria-hidden="true"
					/>

					<div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
						<h2
							id="delete-startup-title"
							className="text-lg font-semibold">
							Delete Post
						</h2>

						<p
							id="delete-startup-desc"
							className="mt-2 text-sm">
							Are you sure you want to delete <strong>{slug}</strong>? This
							action cannot be undone.
						</p>

						<div className="mt-6 flex justify-end gap-3">
							<button
								ref={cancelRef}
								type="button"
								className="rounded-md px-3 py-2 text-sm"
								onClick={() => setOpen(false)}
								disabled={isDeleting}>
								Cancel
							</button>

							<button
								type="button"
								className="rounded-md bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
								onClick={confirmDelete}
								disabled={isDeleting}
								aria-disabled={isDeleting}>
								{isDeleting ? 'Deleting…' : 'Delete'}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
