// components/IosAddToHome.tsx
'use client';
import React, { useEffect, useState } from 'react';

function isIos() {
	if (typeof navigator === 'undefined') return false;
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
	);
}

export default function IosAddToHome() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (!isIos()) return;
		try {
			if (!localStorage.getItem('iosAddToHomeDismissed')) {
				setShow(true);
			}
		} catch (e) {}
	}, []);

	if (!show) return null;

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 16,
				left: 16,
				right: 16,
				zIndex: 999,
				display: 'flex',
				justifyContent: 'center',
			}}>
			<div
				style={{
					background: 'white',
					padding: 12,
					borderRadius: 8,
					boxShadow: '0 6px 20px rgba(0,0,0,.12)',
				}}>
				<div style={{ marginBottom: 6, fontWeight: 600 }}>
					Add this app to your Home Screen
				</div>
				<div style={{ fontSize: 13, marginBottom: 8 }}>
					Tap the browser Share button and choose{' '}
					<strong>"Add to Home Screen"</strong>.
				</div>
				<div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
					<button
						onClick={() => {
							setShow(false);
							try {
								localStorage.setItem('iosAddToHomeDismissed', '1');
							} catch (e) {}
						}}>
						Got it
					</button>
				</div>
			</div>
		</div>
	);
}
