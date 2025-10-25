'use client';

import * as React from 'react';
import { ThemeToggleButton } from './skiper26';

// Main theme toggle using Skiper26 with animated transitions
export function ModeToggle() {
	return (
		<ThemeToggleButton
			variant="circle-blur"
			start="top-right"
			blur={true}
			className="size-9"
		/>
	);
}

export default ModeToggle;
