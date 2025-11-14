'use client';

import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import StartupCard, {
	StartupTypeCard,
	StartupCardSkeleton,
} from './StartupCard';

export type FeedClientProps = {
	initialPosts: StartupTypeCard[];
	initialNextCursor: string | null;
	query: string;
	pageSize?: number;
};

export default function FeedClient({
	initialPosts,
	initialNextCursor,
	query,
	pageSize = 3,
}: FeedClientProps): React.JSX.Element {
	const [posts, setPosts] = useState<StartupTypeCard[]>(
		() => initialPosts || [],
	);
	const [nextCursor, setNextCursor] = useState<string | null>(
		initialNextCursor || null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isDone, setIsDone] = useState(!initialNextCursor);

	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const loadingRef = useRef<boolean>(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	// simple windowed virtualization indices
	const [startIndex, setStartIndex] = useState(0);
	const [endIndex, setEndIndex] = useState(24); // roughly 2 pages by default

	// Reset when query changes
	useEffect(() => {
		setPosts(initialPosts || []);
		setNextCursor(initialNextCursor || null);
		setIsDone(!initialNextCursor);
	}, [initialPosts, initialNextCursor, query]);

	const fetchMore = useCallback(async () => {
		if (loadingRef.current || isDone || !nextCursor) return;
		loadingRef.current = true;
		setIsLoading(true);
		try {
			const params = new URLSearchParams();
			if (query) params.set('q', query);
			if (nextCursor) params.set('cursor', nextCursor);
			params.set('limit', String(pageSize));
			const res = await fetch(`/api/startups?${params.toString()}`);
			if (!res.ok) throw new Error('Failed to load');
			const data = (await res.json()) as {
				posts: StartupTypeCard[];
				nextCursor: string | null;
			};
			setPosts((prev) => {
				const existing = new Set(prev.map((p) => p._id));
				const merged = [...prev];
				for (const p of data.posts || []) {
					if (!existing.has(p._id)) merged.push(p);
				}
				return merged;
			});
			setNextCursor(data.nextCursor || null);
			if (!data.nextCursor || (data.posts || []).length === 0) setIsDone(true);
		} catch (e) {
			// swallow; keep existing content
			setIsDone(true);
		} finally {
			loadingRef.current = false;
			setIsLoading(false);
		}
	}, [isDone, nextCursor, pageSize, query]);

	// IntersectionObserver to trigger fetching more
	useEffect(() => {
		if (!sentinelRef.current || isDone) return;
		const el = sentinelRef.current;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						fetchMore();
						break;
					}
				}
			},
			{ rootMargin: '1200px 0px 1200px 0px', threshold: 0 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [fetchMore, isDone]);

	// Virtualization: track scroll and only render a slice of posts
	useEffect(() => {
		const container = containerRef.current ?? window;
		const isWindow = container === window;

		const handleScroll = () => {
			if (!posts || posts.length === 0) return;

			// Estimate items per row based on breakpoints
			let perRow = 1;
			if (window.innerWidth >= 1024) perRow = 3; // md:grid-cols-3
			else if (window.innerWidth >= 640) perRow = 2; // sm:grid-cols-2

			// Approximate card height; adjust if needed
			const CARD_HEIGHT = 320; // px

			const scrollTop = isWindow
				? window.scrollY
				: (container as HTMLElement).scrollTop;
			const viewportHeight = isWindow
				? window.innerHeight
				: (container as HTMLElement).clientHeight;

			// Compute which rows are visible
			const firstVisibleRow = Math.max(
				0,
				Math.floor(scrollTop / CARD_HEIGHT) - 2, // small buffer above
			);
			const lastVisibleRow = Math.floor(
				(scrollTop + viewportHeight) / CARD_HEIGHT,
			) + 2; // small buffer below

			const totalRows = Math.ceil(posts.length / perRow);
			const clampedFirstRow = Math.min(firstVisibleRow, totalRows);
			const clampedLastRow = Math.min(lastVisibleRow, totalRows);

			const newStartIndex = clampedFirstRow * perRow;
			const newEndIndex = clampedLastRow * perRow + perRow; // inclusive buffer

			setStartIndex((prev) => (prev === newStartIndex ? prev : newStartIndex));
			setEndIndex((prev) =>
				prev === newEndIndex ? prev : Math.min(newEndIndex, posts.length + perRow),
			);
		};

		handleScroll();
		container.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll);

		return () => {
			container.removeEventListener('scroll', handleScroll as any);
			window.removeEventListener('resize', handleScroll as any);
		};
	}, [posts]);

	const list = useMemo(() => posts, [posts]);
	const virtualizedList = useMemo(() => {
		if (!list || list.length === 0) return list;
		const start = Math.max(0, startIndex);
		const end = Math.max(start, endIndex);
		return list.slice(start, end);
	}, [list, startIndex, endIndex]);

	return (
		<>
			<section
				ref={containerRef}
				className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6"
			>
				{list?.length > 0 ?
					virtualizedList?.map((post, idx) => {
						const absoluteIndex = startIndex + idx;
						return (
							<StartupCard
								key={post._id}
								post={post}
								isLCP={absoluteIndex < 6}
							/>
						);
					})
				:	<p className="no-results">No posts found</p>}
			</section>
			{/* loader */}
			<div
				ref={sentinelRef}
				className="h-8"
			/>
			{isLoading && (
				<ul className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6">
					<StartupCardSkeleton />
				</ul>
			)}
		</>
	);
}
