// File: app/components/ScrollHideController.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function ScrollHideController() {
	const lastY = useRef<number>(0);
	const ticking = useRef<boolean>(false);
	const hidden = useRef<boolean>(false);

	useEffect(() => {
		const el = document.querySelector<HTMLElement>('[data-scroll-hide]');
		if (!el) return;

		// Performance hints
		el.style.willChange = 'transform';
		// Ensure header has transition styles in the server component:
		// className includes: transform transition-transform duration-300 ease-in-out
		// (That is already present in your Navbar.)

		const SCROLL_THRESHOLD = 20; // px delta before toggling
		const SHOW_AT_TOP = 60; // always show when near top

		// initialize lastY and initial shadow
		lastY.current = window.scrollY || 0;
		if (lastY.current > 0) el.classList.add('shadow-md');

		const update = (currentY: number) => {
			const delta = currentY - lastY.current;

			// always show when near top
			if (currentY <= SHOW_AT_TOP) {
				if (hidden.current) {
					el.style.transform = 'translateY(0)';
					el.style.pointerEvents = 'auto';
					el.classList.add('shadow-md');
					hidden.current = false;
				}
			} else if (delta > SCROLL_THRESHOLD && !hidden.current) {
				// scrolled down: hide
				el.style.transform = 'translateY(-110%)';
				el.style.pointerEvents = 'none'; // prevent clicks while hidden
				el.classList.remove('shadow-md');
				hidden.current = true;
			} else if (delta < -SCROLL_THRESHOLD && hidden.current) {
				// scrolled up: show
				el.style.transform = 'translateY(0)';
				el.style.pointerEvents = 'auto';
				el.classList.add('shadow-md');
				hidden.current = false;
			}

			lastY.current = currentY;
		};

		const onScroll = () => {
			const currentY = window.scrollY || window.pageYOffset;
			if (!ticking.current) {
				window.requestAnimationFrame(() => {
					update(currentY);
					ticking.current = false;
				});
				ticking.current = true;
			}
		};

		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			// clean up inline styles
			el.style.willChange = '';
			el.style.transform = '';
			el.style.pointerEvents = '';
			el.classList.remove('shadow-md');
		};
	}, []);

	return null;
}
