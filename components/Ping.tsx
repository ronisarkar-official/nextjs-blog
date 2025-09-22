'use client';
import React from 'react';

const Ping: React.FC = () => {
	return (
		<span
			className="relative flex h-3 w-3"
			aria-hidden>
			{/* pulse ring */}
			<span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
			{/* solid dot */}
			<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-md" />
		</span>
	);
};

export default Ping;
