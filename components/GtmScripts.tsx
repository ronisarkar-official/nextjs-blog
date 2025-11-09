// File: app/components/GtmScripts.tsx
'use client';
import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function GtmScripts() {
	return (
		<>
			{/* Head snippet */}
			<Script
				id="gtm-head"
				strategy="afterInteractive">
				{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
			</Script>

			{/* noscript fallback (rendered in body) */}
			<noscript
				// note: Next.js doesn't allow dangerouslySetInnerHTML on noscript easily in server components,
				// but in a client component you can use innerHTML via dangerouslySetInnerHTML if needed. Simpler:
				dangerouslySetInnerHTML={{
					__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
				}}
			/>
		</>
	);
}
