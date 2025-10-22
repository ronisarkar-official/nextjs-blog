'use client';

import React from 'react';
import { User, ArrowRightLeft, Shield, Bell, Palette, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSidebarProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
	isMobileMenuOpen: boolean;
	setIsMobileMenuOpen: (open: boolean) => void;
}

const navigationItems = [
	{
		id: 'profile',
		label: 'Profile',
		icon: User,
		description: 'Manage your account information',
	},
	{
		id: 'redirects',
		label: 'URL Redirects',
		icon: ArrowRightLeft,
		description: 'Manage URL redirects',
	},
	{
		id: 'security',
		label: 'Security',
		icon: Shield,
		description: 'Password and security settings',
		badge: 'Soon',
	},
	{
		id: 'notifications',
		label: 'Notifications',
		icon: Bell,
		description: 'Email and notification preferences',
		badge: 'Soon',
	},
	{
		id: 'appearance',
		label: 'Appearance',
		icon: Palette,
		description: 'Theme and display settings',
		badge: 'Soon',
	},
];

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
	activeSection,
	onSectionChange,
	isMobileMenuOpen,
	setIsMobileMenuOpen,
}) => {
	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
				{isMobileMenuOpen ?
					<X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
				:	<Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />}
			</button>

			{/* Overlay for mobile */}
			{isMobileMenuOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40 transition-transform duration-300 ease-in-out',
					isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
				)}>
				<div className="p-6">
					{/* Header */}
					<div className="mb-8 pt-12 lg:pt-0">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
							Settings
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Manage your account preferences
						</p>
					</div>

					{/* Navigation */}
					<nav className="space-y-1">
						{navigationItems.map((item) => {
							const Icon = item.icon;
							const isActive = activeSection === item.id;
							const isDisabled = !!item.badge;

							return (
								<button
									key={item.id}
									onClick={() => {
										if (!isDisabled) {
											onSectionChange(item.id);
											setIsMobileMenuOpen(false);
										}
									}}
									disabled={isDisabled}
									className={cn(
										'w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200',
										isActive
											? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
											: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
										isDisabled && 'opacity-50 cursor-not-allowed',
									)}>
									<Icon
										className={cn(
											'h-5 w-5 mt-0.5 flex-shrink-0',
											isActive
												? 'text-indigo-700 dark:text-indigo-400'
												: 'text-gray-500 dark:text-gray-400',
										)}
									/>
									<div className="flex-1 text-left">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">{item.label}</span>
											{item.badge && (
												<span className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
													{item.badge}
												</span>
											)}
										</div>
										<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
											{item.description}
										</p>
									</div>
								</button>
							);
						})}
					</nav>
				</div>
			</aside>
		</>
	);
};

export default SettingsSidebar;
