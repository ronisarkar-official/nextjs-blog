'use client';
import { ArrowUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const BackToTopButton: React.FC = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setVisible(window.scrollY > 300);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<button
			onClick={scrollToTop}
			aria-label="Back to top"
			className={`fixed bottom-6 right-6 z-50 p-3 mb-12 rounded-full shadow-lg bg-primary text-white transition-opacity duration-300 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
			style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
			<ArrowUp className="w-4 h-4 dark:text-black" />
		</button>
	);
};

export default BackToTopButton;
