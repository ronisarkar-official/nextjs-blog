'use client';

import React, { useState } from 'react';
import SettingsSidebar from '@/components/SettingsSidebar';
import SettingsForm from '@/components/SettingsForm';
import RedirectManager from '@/components/RedirectManager';
import { Toaster } from 'react-hot-toast';

interface User {
	_id: string;
	id: number;
	name: string;
	username: string;
	email: string;
	image?: string;
	bio?: string;
}

interface SettingsDashboardProps {
	user: User;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ user }) => {
	const [activeSection, setActiveSection] = useState('profile');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const renderContent = () => {
		switch (activeSection) {
			case 'profile':
				return (
					<div>
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								Profile Settings
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								Update your profile information and preferences
							</p>
						</div>
						<SettingsForm user={user} />
					</div>
				);

			case 'redirects':
				return (
					<div>
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								URL Redirects
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								Manage URL redirects to maintain SEO when restructuring your site
							</p>
						</div>
						<RedirectManager />
					</div>
				);

			case 'security':
				return (
					<div>
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								Security Settings
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								Manage your password and security preferences
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
							<div className="text-center py-12">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
									<span className="text-2xl">🔒</span>
								</div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
									Security Settings
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									This feature is coming soon
								</p>
							</div>
						</div>
					</div>
				);

			case 'notifications':
				return (
					<div>
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								Notification Settings
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								Manage your email and notification preferences
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
							<div className="text-center py-12">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
									<span className="text-2xl">🔔</span>
								</div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
									Notification Settings
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									This feature is coming soon
								</p>
							</div>
						</div>
					</div>
				);

			case 'appearance':
				return (
					<div>
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								Appearance Settings
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-2">
								Customize the look and feel of your dashboard
							</p>
						</div>
						<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
							<div className="text-center py-12">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
									<span className="text-2xl">🎨</span>
								</div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
									Appearance Settings
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									This feature is coming soon
								</p>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<>
			<Toaster position="top-right" />
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<div className="flex">
					{/* Sidebar */}
					<SettingsSidebar
						activeSection={activeSection}
						onSectionChange={setActiveSection}
						isMobileMenuOpen={isMobileMenuOpen}
						setIsMobileMenuOpen={setIsMobileMenuOpen}
					/>

					{/* Main Content */}
					<main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
						<div className="max-w-5xl mx-auto">{renderContent()}</div>
					</main>
				</div>
			</div>
		</>
	);
};

export default SettingsDashboard;
