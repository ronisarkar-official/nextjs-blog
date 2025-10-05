import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const fileName = formData.get('fileName') as string;
		const folder = formData.get('folder') as string;

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			return NextResponse.json(
				{ error: 'File must be an image' },
				{ status: 400 },
			);
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			return NextResponse.json(
				{ error: 'File size must be less than 10MB' },
				{ status: 400 },
			);
		}

		// Get ImageKit credentials
		const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
		const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
		const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

		if (!publicKey || !privateKey || !urlEndpoint) {
			return NextResponse.json(
				{ error: 'ImageKit credentials not configured' },
				{ status: 500 },
			);
		}

		// Initialize ImageKit
		const imagekit = new ImageKit({
			publicKey,
			privateKey,
			urlEndpoint,
		});

		// Convert file to base64
		const bytes = await file.arrayBuffer();
		const base64 = Buffer.from(bytes).toString('base64');

		// Upload to ImageKit
		const result = await new Promise<any>((resolve, reject) => {
			imagekit.upload(
				{
					file: base64,
					fileName: fileName || `upload-${Date.now()}`,
					folder: folder || '/uploads/',
					useUniqueFileName: true,
				},
				(error, result) => {
					if (error) {
						reject(error);
					} else {
						resolve(result);
					}
				},
			);
		});

		return NextResponse.json({
			url: result.url,
			fileId: result.fileId,
			name: result.name,
		});
	} catch (error) {
		console.error('ImageKit upload error:', error);
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
	}
}
