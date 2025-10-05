'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadButtonProps {
	onImageUploaded: (url: string) => void;
	onImageRemoved?: () => void;
	className?: string;
	disabled?: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
	onImageUploaded,
	onImageRemoved,
	className = '',
	disabled = false,
}) => {
	const [uploadStatus, setUploadStatus] = useState<
		'idle' | 'uploading' | 'success' | 'error'
	>('idle');
	const [uploadedUrl, setUploadedUrl] = useState<string>('');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setErrorMessage('Please select a valid image file');
			setUploadStatus('error');
			return;
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			setErrorMessage('File size must be less than 10MB');
			setUploadStatus('error');
			return;
		}

		uploadImage(file);
	};

	const uploadImage = async (file: File) => {
		setUploadStatus('uploading');
		setErrorMessage('');

		try {
			// Create FormData for file upload
			const formData = new FormData();
			formData.append('file', file);
			formData.append('fileName', `startup-${Date.now()}-${file.name}`);
			formData.append('folder', '/startups/');

			// Upload file to our API endpoint
			const response = await fetch('/api/imagekit/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Upload failed');
			}

			const result = await response.json();

			if (result.url) {
				// Add WebP transformation to the URL
				const webpUrl = `${result.url}?tr=f-webp,q-80`;
				setUploadedUrl(webpUrl);
				setUploadStatus('success');
				onImageUploaded(webpUrl);
				console.log('Image uploaded successfully:', webpUrl);
			} else {
				throw new Error('Upload failed - no URL returned');
			}
		} catch (error) {
			console.error('Image upload error:', error);
			setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
			setUploadStatus('error');
		}
	};

	const handleRemoveImage = () => {
		setUploadedUrl('');
		setUploadStatus('idle');
		setErrorMessage('');
		onImageRemoved?.();
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleButtonClick = () => {
		if (uploadStatus === 'success') {
			handleRemoveImage();
		} else {
			fileInputRef.current?.click();
		}
	};

	const getButtonContent = () => {
		switch (uploadStatus) {
			case 'uploading':
				return (
					<>
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						<span>Uploading...</span>
					</>
				);
			case 'success':
				return (
					<>
						<CheckCircle className="h-4 w-4" />
						<span>Image uploaded</span>
					</>
				);
			case 'error':
				return (
					<>
						<AlertCircle className="h-4 w-4" />
						<span>Upload failed</span>
					</>
				);
			default:
				return (
					<>
						<Upload className="h-4 w-4" />
						<span>Upload Image</span>
					</>
				);
		}
	};

	const getButtonVariant = () => {
		switch (uploadStatus) {
			case 'success':
				return 'bg-green-600 hover:bg-green-700 text-white';
			case 'error':
				return 'bg-red-600 hover:bg-red-700 text-white';
			default:
				return 'bg-indigo-600 hover:bg-indigo-700 text-white';
		}
	};

	return (
		<div className={`space-y-3 ${className}`}>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled}
			/>

			<Button
				type="button"
				onClick={handleButtonClick}
				disabled={disabled || uploadStatus === 'uploading'}
				className={`w-full py-2 rounded-md font-medium disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${getButtonVariant()}`}>
				{getButtonContent()}
			</Button>

			{uploadStatus === 'success' && uploadedUrl && (
				<div className="space-y-2">
					<div className="text-xs text-green-600 dark:text-green-400">
						✓ Image uploaded successfully
					</div>
					<div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 h-28 flex items-center justify-center">
						<img
							src={uploadedUrl}
							alt="Uploaded preview"
							className="object-cover w-full h-full"
						/>
					</div>
					<div className="text-xs text-gray-500 dark:text-gray-400 break-all">
						{uploadedUrl}
					</div>
				</div>
			)}

			{uploadStatus === 'error' && errorMessage && (
				<div className="text-xs text-red-500 dark:text-red-400">
					{errorMessage}
				</div>
			)}

			{uploadStatus === 'uploading' && (
				<div className="text-xs text-gray-500 dark:text-gray-400">
					Converting to WebP format...
				</div>
			)}
		</div>
	);
};

export default ImageUploadButton;
