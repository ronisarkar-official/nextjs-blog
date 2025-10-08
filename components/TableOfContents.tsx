'use client';

import React from 'react';
import { FileText, ListTree, LucideTableOfContents } from 'lucide-react';

type HeadingItem = { id: string; text: string; level: number };

export default function TableOfContents({
	headings,
	className = '',
}: {
	headings: HeadingItem[];
	className?: string;
}) {
	const [open, setOpen] = React.useState(false);
	const [activeId, setActiveId] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!headings?.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) =>
						a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1,
					);
				if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
			},
			{ rootMargin: '0px 0px -60% 0px', threshold: [0, 1] },
		);

		headings.forEach((h) => {
			const el = document.getElementById(h.id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	}, [headings]);

	const scrollTo = (id: string) => {
		setOpen(false);
		const el = document.getElementById(id);
		if (!el) return;
		const y = el.getBoundingClientRect().top + window.scrollY - 80; // offset for sticky headers
		window.scrollTo({ top: y, behavior: 'smooth' });
	};

	if (!headings || headings.length === 0) return null;

	return (
		<>
			{/* Floating toggle button - fixed, no layout shift */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open table of contents"
				className={`fixed right-4 top-38 -translate-y-[60%] translate-x-1/2 z-40 ${className}`}>
				{/* soft halo/indent illusion */}
				<span
					className="absolute inset-0 -left-1 top-1/2 -translate-y-1/2 w-16 h-10 rounded-l-full bg-white/70 dark:bg-gray-900/50 blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
					aria-hidden
				/>

				{/* circular button */}
				<span className="relative inline-flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-200/80 dark:ring-gray-700/70 hover:ring-blue-200 dark:hover:ring-blue-700 transition">
					<LucideTableOfContents
						className="w-5 h-5 text-black dark:text-white"
						aria-hidden
					/>
					{/* live dot */}
					<span className="absolute top-1.5 left-1.5 inline-flex h-2.5 w-2.5">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
					</span>
				</span>
			</button>

			{/* Off-canvas panel */}
			<div
				className={`fixed inset-0 z-50 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
				aria-hidden={!open}
				onClick={() => setOpen(false)}
			/>
			<aside
				role="dialog"
				aria-modal="true"
				aria-label="Table of contents"
				className={`fixed right-0 top-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-out bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl ${open ? 'translate-x-0' : 'translate-x-full'}`}>
				<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
					<div className="text-sm font-semibold">Table of contents</div>
					<button
						type="button"
						className="text-sm px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
						onClick={() => setOpen(false)}>
						Close
					</button>
				</div>
				<nav className="overflow-y-auto h-[calc(100%-49px)] px-4 py-3">
					<ol className="space-y-2 text-sm">
						{headings.map((h, i) => (
							<li
								key={`${h.id}-${i}`}
								className="leading-snug">
								<button
									onClick={() => scrollTo(h.id)}
									className={`block text-left w-full hover:underline ${activeId === h.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
									style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
									{h.text}
								</button>
							</li>
						))}
					</ol>
				</nav>
			</aside>
		</>
	);
}
