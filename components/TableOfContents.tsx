'use client';

import React from 'react';
import { FileText, ListTree, LucideTableOfContents, X, ChevronRight } from 'lucide-react';

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

	// Calculate reading progress
	const activeIndex = headings.findIndex(h => h.id === activeId);
	const progress = headings.length > 0 ? ((activeIndex + 1) / headings.length) * 100 : 0;

	if (!headings || headings.length === 0) return null;

	return (
		<>
			{/* Floating toggle button - enhanced design */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open table of contents"
				className={`fixed right-4 top-38 -translate-y-[60%] translate-x-1/2 z-40 group ${className}`}>
				{/* Enhanced halo effect */}
				<span
					className="absolute inset-0 -left-1 top-1/2 -translate-y-1/2 w-16 h-10 rounded-l-full bg-white/80 dark:bg-gray-900/60 blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] transition-shadow duration-300"
					aria-hidden
				/>

				{/* Modern button design */}
				<span className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-blue-300/50 dark:hover:ring-blue-600/50 hover:scale-105 transition-all duration-200">
					<LucideTableOfContents
						className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
						aria-hidden
					/>
					{/* Enhanced live indicator */}
					<span className="absolute top-2 left-2 inline-flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
					</span>
				</span>
			</button>

			

			{/* Professional off-canvas panel */}
			<aside
				role="dialog"
				aria-modal="true"
				aria-label="Table of contents"
				className={`fixed right-0 top-0 h-full rounded-3xl w-80 max-w-[90vw] z-50 transform transition-all duration-300 ease-out bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/80 dark:border-gray-700/80 shadow-2xl ${open ? 'translate-x-0' : 'translate-x-full'}`}>

				{/* Enhanced header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
							<ListTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Table of Contents</h2>
							<p className="text-xs text-gray-500 dark:text-gray-400">{headings.length} sections</p>
						</div>
					</div>
					<button
						type="button"
						className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
						onClick={() => setOpen(false)}
						aria-label="Close table of contents">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Reading progress indicator */}
				<div className="px-6 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
					<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
						<span>Reading Progress</span>
						<span>{Math.round(progress)}%</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
						<div
							className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Enhanced navigation */}
				<nav className="overflow-y-auto h-[calc(100%-120px)] px-6 py-4">
					<ol className="space-y-1">
						{headings.map((h, i) => {
							const isActive = activeId === h.id;
							const indentLevel = (h.level - 1) * 16;

							return (
								<li key={`${h.id}-${i}`} className="relative">
									{/* Active indicator line */}
									{isActive && (
										<div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-blue-500 rounded-r-full z-10" />
									)}

									<button
										onClick={() => scrollTo(h.id)}
										className={`group relative flex items-center w-full text-left py-2 px-3 rounded-lg transition-all duration-200 ${
											isActive
												? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm'
										}`}
										style={{ paddingLeft: `${12 + indentLevel}px` }}>

										{/* Heading text */}
										<span className="flex-1 text-sm leading-snug truncate">
											{h.text}
										</span>

										{/* Chevron indicator */}
										<ChevronRight className={`w-3 h-3 ml-2 transition-transform duration-200 ${
											isActive ? 'text-blue-500 rotate-90' : 'text-gray-400 group-hover:text-gray-600'
										}`} />
									</button>
								</li>
							);
						})}
					</ol>
				</nav>
			</aside>
		</>
	);
}
