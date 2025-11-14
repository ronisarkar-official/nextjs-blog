'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

// Main theme toggle without view-transition animations (stable in Chrome)
export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	const toggleTheme = React.useCallback(() => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	}, [theme, setTheme]);

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="size-9"
		>
			<Sun className="h-[1.2rem] w-[1.2rem] dark:hidden" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] hidden dark:block" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}

export default ModeToggle;
