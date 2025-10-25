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
	pageSize = 12,
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

	const list = useMemo(() => posts, [posts]);

	return (
		<>
			<section className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 pt-6">
				{list?.length > 0 ?
					list.map((post, idx) => (
						<StartupCard
							key={post._id}
							post={post}
							isLCP={idx < 6}
						/>
					))
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
