// components/Loaders/DotWaveLoader.tsx
'use client';

import { motion } from 'framer-motion';

const DotWaveLoader = () => {
	const dots = [0, 1, 2, 3];

	return (
		<motion.div
			className="flex space-x-2"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}>
			{dots.map((index) => (
				<motion.div
					key={index}
					className="w-3 h-3 bg-blue-500 rounded-full"
					animate={{
						scale: [1, 1.5, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 1,
						repeat: Infinity,
						delay: index * 0.2,
					}}
				/>
			))}
		</motion.div>
	);
};

export default DotWaveLoader;
