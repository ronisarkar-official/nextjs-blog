'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, User, Mail, Image as ImageIcon } from 'lucide-react';
import ImageUploadButton from '@/components/ImageUploadButton';
import toast, { Toaster } from 'react-hot-toast';

interface User {
	_id: string;
	id: number;
	name: string;
	username: string;
	email: string;
	image?: string;
	bio?: string;
}

interface SettingsFormProps {
	user: User;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ user }) => {
	const [formData, setFormData] = useState({
		name: user.name || '',
		username: user.username || '',
		email: user.email || '',
		bio: user.bio || '',
		image: user.image || '',
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleInputChange = useCallback(
		(field: string, value: string) => {
			// Limit bio to 500 characters
			if (field === 'bio' && value.length > 500) {
				return;
			}

			setFormData((prev) => ({ ...prev, [field]: value }));
			// Clear error when user starts typing
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: '' }));
			}
		},
		[errors],
	);

	const handleImageUploaded = useCallback((url: string) => {
		setFormData((prev) => ({ ...prev, image: url }));
		toast.success('Profile image uploaded successfully!');
	}, []);

	const handleImageRemoved = useCallback(() => {
		setFormData((prev) => ({ ...prev, image: '' }));
	}, []);

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		}

		if (!formData.username.trim()) {
			newErrors.username = 'Username is required';
		} else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
			newErrors.username =
				'Username can only contain letters, numbers, hyphens, and underscores';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fix the errors below');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch('/api/user/settings', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update settings');
			}

			toast.success('Settings updated successfully!');

			// Refresh the page to show updated data
			window.location.reload();
		} catch (error) {
			console.error('Settings update error:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to update settings',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Toaster position="top-right" />

			<form
				onSubmit={handleSubmit}
				className="space-y-6">
				{/* Profile Image Section */}
				<Card className="p-6">
					<div className="flex items-center gap-4 mb-4">
						<ImageIcon className="h-5 w-5 text-gray-500" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Profile Image
						</h3>
					</div>

					<div className="flex items-start gap-6">
						{formData.image && (
							<div className="flex-shrink-0">
								<img
									src={formData.image}
									alt="Profile"
									className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
								/>
							</div>
						)}

						<div className="flex-1">
							<ImageUploadButton
								onImageUploaded={handleImageUploaded}
								onImageRemoved={handleImageRemoved}
								className="max-w-xs"
								disabled={isSubmitting}
							/>
							<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
								Upload a profile image. Recommended size: 200x200px
							</p>
						</div>
					</div>
				</Card>

				{/* Basic Information Section */}
				<Card className="p-6">
					<div className="flex items-center gap-4 mb-4">
						<User className="h-5 w-5 text-gray-500" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							Basic Information
						</h3>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Full Name *
							</label>
							<Input
								id="name"
								type="text"
								value={formData.name}
								onChange={(e) => handleInputChange('name', e.target.value)}
								placeholder="Enter your full name"
								className={errors.name ? 'border-red-500' : ''}
								disabled={isSubmitting}
							/>
							{errors.name && (
								<p className="text-sm text-red-500 mt-1">{errors.name}</p>
							)}
						</div>

						<div>
							<label
								htmlFor="username"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Username *
							</label>
							<Input
								id="username"
								type="text"
								value={formData.username}
								onChange={(e) => handleInputChange('username', e.target.value)}
								placeholder="Enter your username"
								className={errors.username ? 'border-red-500' : ''}
								disabled={isSubmitting}
							/>
							{errors.username && (
								<p className="text-sm text-red-500 mt-1">{errors.username}</p>
							)}
						</div>
					</div>

					<div className="mt-4">
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Email Address *
						</label>
						<div className="flex items-center gap-2">
							<Mail className="h-4 w-4 text-gray-400" />
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								placeholder="Enter your email address"
								className={`flex-1 ${errors.email ? 'border-red-500' : ''}`}
								disabled={isSubmitting}
							/>
						</div>
						{errors.email && (
							<p className="text-sm text-red-500 mt-1">{errors.email}</p>
						)}
					</div>
				</Card>

				{/* Bio Section */}
				<Card className="p-6">
					<div className="flex items-center gap-4 mb-4">
						<User className="h-5 w-5 text-gray-500" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
							About You
						</h3>
					</div>

					<div>
						<label
							htmlFor="bio"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Bio
						</label>
						<Textarea
							id="bio"
							value={formData.bio}
							onChange={(e) => handleInputChange('bio', e.target.value)}
							placeholder="Tell us about yourself..."
							rows={4}
							className="resize-none"
							disabled={isSubmitting}
						/>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
							{formData.bio.length}/500 characters
						</p>
					</div>
				</Card>

				{/* Submit Button */}
				<div className="flex justify-end">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2">
						{isSubmitting ?
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Saving...
							</>
						:	<>
								<Save className="h-4 w-4 mr-2" />
								Save Changes
							</>
						}
					</Button>
				</div>
			</form>
		</>
	);
};

export default SettingsForm;
