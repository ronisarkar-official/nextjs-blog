'use client';

import React from 'react';

type BarChartDatum = {
	label: string;
	value: number;
	meta?: string;
};

type BarChartProps = {
	data: BarChartDatum[];
	height?: number; // in px
	maxBars?: number;
	ariaLabel?: string;
};

export default function BarChart({
	data,
	height = 200,
	maxBars = 10,
	ariaLabel = 'Bar chart',
}: BarChartProps) {
	const items = Array.isArray(data) ? data.slice(0, maxBars) : [];
	const max = items.reduce((m, d) => (d.value > m ? d.value : m), 0);
	const safeMax = max > 0 ? max : 1;

	return (
		<div className="w-full">
			<div className="w-full overflow-x-auto">
				<svg
					className="min-w-[560px] w-full"
					style={{ height }}
					role="img"
					aria-label={ariaLabel}>
					{/* Padding for labels */}
					<g transform="translate(120,10)">
						{items.map((d, i) => {
							const y = (i * (height - 20)) / items.length;
							const barHeight = Math.max(12, (height - 20) / items.length - 6);
							const width = (d.value / safeMax) * (600 - 140);
							return (
								<g
									key={d.label + i}
									transform={`translate(0, ${y})`}>
									<title>{`${d.label}: ${d.value}${d.meta ? ` (${d.meta})` : ''}`}</title>
									<rect
										x={0}
										y={0}
										rx={6}
										ry={6}
										width={Math.max(2, width)}
										height={barHeight}
										className="fill-indigo-500/80 hover:fill-indigo-600 transition-colors"
										role="presentation"
									/>
									<text
										x={-8}
										y={barHeight / 2}
										textAnchor="end"
										dominantBaseline="middle"
										className="fill-gray-700 dark:fill-gray-300 text-[11px]">
										{d.label}
									</text>
									<text
										x={Math.max(6, width + 6)}
										y={barHeight / 2}
										textAnchor="start"
										dominantBaseline="middle"
										className="fill-gray-800 dark:fill-gray-100 text-[11px] font-medium">
										{d.value}
									</text>
								</g>
							);
						})}
					</g>
				</svg>
			</div>
		</div>
	);
}
