// middleware.ts (root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const hostname = req.nextUrl.hostname;
	if (hostname === 'spechype.com') {
		const url = req.nextUrl.clone();
		url.hostname = 'www.spechype.com';
		return NextResponse.redirect(url, 301);
	}
	return NextResponse.next();
}
