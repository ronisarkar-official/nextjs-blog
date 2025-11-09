// File: pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
	render() {
		const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-PLZ9HS9P';
		return (
			<Html>
				<Head>
					{/* Google Tag Manager - head snippet */}
					<script
						dangerouslySetInnerHTML={{
							__html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
						}}
					/>
				</Head>
				<body>
					{/* Google Tag Manager (noscript) */}
					<noscript
						dangerouslySetInnerHTML={{
							__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
						}}
					/>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
