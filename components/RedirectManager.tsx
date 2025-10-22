'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	ArrowRightLeft,
	Plus,
	Trash2,
	Edit2,
	Save,
	X,
	Link,
	ToggleLeft,
	ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Redirect {
	_id: string;
	source: string;
	destination: string;
	permanent: boolean;
	active: boolean;
	createdAt: string;
}

const RedirectManager: React.FC = () => {
	const [redirects, setRedirects] = useState<Redirect[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		source: '',
		destination: '',
		permanent: true,
		active: true,
	});

	// Edit form state
	const [editFormData, setEditFormData] = useState({
		source: '',
		destination: '',
		permanent: true,
		active: true,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		fetchRedirects();
	}, []);

	const fetchRedirects = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/redirects');
			const data = await response.json();

			if (response.ok) {
				setRedirects(data.redirects || []);
			} else {
				toast.error(data.error || 'Failed to fetch redirects');
			}
		} catch (error) {
			console.error('Error fetching redirects:', error);
			toast.error('Failed to fetch redirects');
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (data: typeof formData) => {
		const newErrors: Record<string, string> = {};

		if (!data.source.trim()) {
			newErrors.source = 'Source URL is required';
		} else if (!data.source.startsWith('/')) {
			newErrors.source = 'Source URL must start with /';
		} else if (data.source.includes('://')) {
			newErrors.source = 'Source URL should not include http:// or https://';
		}

		if (!data.destination.trim()) {
			newErrors.destination = 'Destination URL is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddRedirect = async () => {
		if (!validateForm(formData)) {
			toast.error('Please fix the errors below');
			return;
		}

		try {
			const response = await fetch('/api/redirects', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to add redirect');
			}

			// Clear redirect cache
			await fetch('/api/redirects/revalidate', { method: 'POST' });

			toast.success('Redirect added successfully!');
			setFormData({ source: '', destination: '', permanent: true, active: true });
			setShowAddForm(false);
			fetchRedirects();
		} catch (error) {
			console.error('Error adding redirect:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to add redirect',
			);
		}
	};

	const handleEditRedirect = async (id: string) => {
		if (!validateForm(editFormData)) {
			toast.error('Please fix the errors below');
			return;
		}

		try {
			const response = await fetch(`/api/redirects/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(editFormData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update redirect');
			}

			// Clear redirect cache
			await fetch('/api/redirects/revalidate', { method: 'POST' });

			toast.success('Redirect updated successfully!');
			setEditingId(null);
			fetchRedirects();
		} catch (error) {
			console.error('Error updating redirect:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to update redirect',
			);
		}
	};

	const handleDeleteRedirect = async (id: string) => {
		if (!confirm('Are you sure you want to delete this redirect?')) {
			return;
		}

		try {
			const response = await fetch(`/api/redirects?id=${id}`, {
				method: 'DELETE',
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to delete redirect');
			}

			// Clear redirect cache
			await fetch('/api/redirects/revalidate', { method: 'POST' });

			toast.success('Redirect deleted successfully!');
			fetchRedirects();
		} catch (error) {
			console.error('Error deleting redirect:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete redirect',
			);
		}
	};

	const startEditing = (redirect: Redirect) => {
		setEditingId(redirect._id);
		setEditFormData({
			source: redirect.source,
			destination: redirect.destination,
			permanent: redirect.permanent,
			active: redirect.active,
		});
		setErrors({});
	};

	const cancelEditing = () => {
		setEditingId(null);
		setErrors({});
	};

	const cancelAdding = () => {
		setShowAddForm(false);
		setFormData({ source: '', destination: '', permanent: true, active: true });
		setErrors({});
	};

	if (loading) {
		return (
			<Card className="p-6">
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<ArrowRightLeft className="h-5 w-5 text-gray-500" />
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						URL Redirects
					</h3>
				</div>
				<Button
					onClick={() => setShowAddForm(!showAddForm)}
					className="bg-indigo-600 hover:bg-indigo-700 text-white">
					<Plus className="h-4 w-4 mr-2" />
					Add Redirect
				</Button>
			</div>

			<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
				Manage URL redirects to redirect old URLs to new ones. This is useful for
				maintaining SEO when restructuring your site.
			</p>

			{/* Add Form */}
			{showAddForm && (
				<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
					<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
						Add New Redirect
					</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Source URL (Old) *
							</label>
							<Input
								type="text"
								value={formData.source}
								onChange={(e) =>
									setFormData({ ...formData, source: e.target.value })
								}
								placeholder="/old-page"
								className={errors.source ? 'border-red-500' : ''}
							/>
							{errors.source && (
								<p className="text-sm text-red-500 mt-1">{errors.source}</p>
							)}
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Destination URL (New) *
							</label>
							<Input
								type="text"
								value={formData.destination}
								onChange={(e) =>
									setFormData({ ...formData, destination: e.target.value })
								}
								placeholder="/new-page or https://example.com"
								className={errors.destination ? 'border-red-500' : ''}
							/>
							{errors.destination && (
								<p className="text-sm text-red-500 mt-1">{errors.destination}</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-6 mb-4">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.permanent}
								onChange={(e) =>
									setFormData({ ...formData, permanent: e.target.checked })
								}
								className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
							/>
							<span className="text-sm text-gray-700 dark:text-gray-300">
								Permanent (301)
							</span>
						</label>

						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={formData.active}
								onChange={(e) =>
									setFormData({ ...formData, active: e.target.checked })
								}
								className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
							/>
							<span className="text-sm text-gray-700 dark:text-gray-300">
								Active
							</span>
						</label>
					</div>

					<div className="flex gap-2">
						<Button
							onClick={handleAddRedirect}
							className="bg-indigo-600 hover:bg-indigo-700 text-white">
							<Save className="h-4 w-4 mr-2" />
							Save Redirect
						</Button>
						<Button
							onClick={cancelAdding}
							variant="outline">
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
					</div>
				</div>
			)}

			{/* Redirects List */}
			<div className="space-y-3">
				{redirects.length === 0 ? (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						<Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No redirects configured yet.</p>
						<p className="text-sm mt-2">
							Click "Add Redirect" to create your first URL redirect.
						</p>
					</div>
				) : (
					redirects.map((redirect) => (
						<div
							key={redirect._id}
							className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
							{editingId === redirect._id ? (
								// Edit Mode
								<div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Source URL *
											</label>
											<Input
												type="text"
												value={editFormData.source}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														source: e.target.value,
													})
												}
												placeholder="/old-page"
												className={errors.source ? 'border-red-500' : ''}
											/>
											{errors.source && (
												<p className="text-sm text-red-500 mt-1">
													{errors.source}
												</p>
											)}
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Destination URL *
											</label>
											<Input
												type="text"
												value={editFormData.destination}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														destination: e.target.value,
													})
												}
												placeholder="/new-page"
												className={errors.destination ? 'border-red-500' : ''}
											/>
											{errors.destination && (
												<p className="text-sm text-red-500 mt-1">
													{errors.destination}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-6 mb-4">
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={editFormData.permanent}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														permanent: e.target.checked,
													})
												}
												className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
											/>
											<span className="text-sm text-gray-700 dark:text-gray-300">
												Permanent (301)
											</span>
										</label>

										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={editFormData.active}
												onChange={(e) =>
													setEditFormData({
														...editFormData,
														active: e.target.checked,
													})
												}
												className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
											/>
											<span className="text-sm text-gray-700 dark:text-gray-300">
												Active
											</span>
										</label>
									</div>

									<div className="flex gap-2">
										<Button
											onClick={() => handleEditRedirect(redirect._id)}
											className="bg-indigo-600 hover:bg-indigo-700 text-white"
											size="sm">
											<Save className="h-4 w-4 mr-2" />
											Save Changes
										</Button>
										<Button
											onClick={cancelEditing}
											variant="outline"
											size="sm">
											<X className="h-4 w-4 mr-2" />
											Cancel
										</Button>
									</div>
								</div>
							) : (
								// View Mode
								<div>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
													{redirect.source}
												</span>
												<ArrowRightLeft className="h-4 w-4 text-gray-400" />
												<span className="text-sm text-gray-600 dark:text-gray-400">
													{redirect.destination}
												</span>
											</div>

											<div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
												<span
													className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
														redirect.active
															? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
															: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
													}`}>
													{redirect.active ?
														<ToggleRight className="h-3 w-3" />
													:	<ToggleLeft className="h-3 w-3" />}
													{redirect.active ? 'Active' : 'Inactive'}
												</span>
												<span
													className={`px-2 py-1 rounded-full ${
														redirect.permanent
															? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
															: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
													}`}>
													{redirect.permanent ? '301 Permanent' : '302 Temporary'}
												</span>
											</div>
										</div>

										<div className="flex gap-2 ml-4">
											<Button
												onClick={() => startEditing(redirect)}
												variant="outline"
												size="sm">
												<Edit2 className="h-4 w-4" />
											</Button>
											<Button
												onClick={() => handleDeleteRedirect(redirect._id)}
												variant="outline"
												size="sm"
												className="text-red-600 hover:text-red-700 hover:border-red-600">
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</Card>
	);
};

export default RedirectManager;
