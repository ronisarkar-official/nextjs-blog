import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
	try {
		const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

		if (!privateKey) {
			return NextResponse.json(
				{ error: 'ImageKit private key not configured' },
				{ status: 500 },
			);
		}

		const token = request.nextUrl.searchParams.get('token');
		const expire = request.nextUrl.searchParams.get('expire');
		const signature = request.nextUrl.searchParams.get('signature');

		if (!token || !expire || !signature) {
			return NextResponse.json(
				{ error: 'Missing required parameters' },
				{ status: 400 },
			);
		}

		// Verify the signature
		const expectedSignature = crypto
			.createHmac('sha1', privateKey)
			.update(token + expire)
			.digest('hex');

		if (signature !== expectedSignature) {
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
		}

		// Generate authentication parameters
		const expireTime = Math.floor(Date.now() / 1000) + 2400; // 40 minutes
		const signatureForAuth = crypto
			.createHmac('sha1', privateKey)
			.update(token + expireTime)
			.digest('hex');

		return NextResponse.json({
			signature: signatureForAuth,
			expire: expireTime,
			token: token,
		});
	} catch (error) {
		console.error('ImageKit auth error:', error);
		return NextResponse.json(
			{ error: 'Authentication failed' },
			{ status: 500 },
		);
	}
}
