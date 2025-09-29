// File: app/(root)/privacy/page.tsx

import Link from 'next/link';
import React from 'react';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spechype.com';
const siteName = sitename ?? 'SpecHype';

export const metadata = {
	title: `${siteName} — Privacy Policy`,
	description: `Privacy Policy for ${siteName}`,
};

export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-white text-black antialiased">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<header className="mb-10 text-center">
					<h1 className="text-4xl font-extrabold text-black">Privacy Policy</h1>
					<p className="mt-2 text-sm text-gray-600">
						Last updated: <time>{new Date().toLocaleDateString()}</time>
					</p>
				</header>

				<article className="prose prose-lg max-w-none space-y-8">
					<section>
						<h2 className="text-black font-bold">Introduction</h2>
						<p>
							At {siteName}, one of our main priorities is the privacy of our
							visitors. This Privacy Policy document contains the types of
							information that are collected and recorded by {siteName} and how
							we use it.
						</p>
						<p>
							If you have additional questions or require more information about
							our privacy policy, do not hesitate to{' '}
							<Link
								href="/contact"
								className="underline decoration-indigo-600">
								contact us
							</Link>
							.
						</p>
						<p>
							This privacy policy applies only to our online activities and is
							valid for visitors to our website with regards to the information
							that they share and/or collect in {siteName}. This policy is not
							applicable to any information collected offline or via channels
							other than this website.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">Consent</h3>
						<p>
							By using our website, you hereby consent to our privacy policy and
							agree to its terms.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">Information we collect</h3>
						<p>
							The personal information that you are asked to provide and the
							reasons why you are asked to provide it will be made clear to you
							at the point at which we ask you to provide your personal
							information.
						</p>
						<p>
							If you contact us directly, we may receive additional information
							about you, such as your name, email address, phone number, the
							contents of the message and/or attachments you may send us, and
							any other information you may choose to provide.
						</p>
						<p>
							When you register for an account, we may ask for your contact
							information, including items such as your name, company name,
							address, email address, and telephone number.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">
							How we use the data you provide
						</h3>
						<ul className="list-disc pl-6 space-y-2">
							<li>Supplying, running, and maintaining our website</li>
							<li>Enhance, customize, and broaden our website</li>
							<li>Recognize and examine how you utilize our website</li>
							<li>Create new goods, services, features, and capabilities</li>
							<li>
								Communicate with you directly or via partners for support,
								updates, and promotions
							</li>
							<li>Send you emails</li>
							<li>Find and prevent fraud</li>
						</ul>
					</section>

					<section>
						<h3 className="text-black font-bold">Log Files</h3>
						<p>
							{siteName} follows a standard procedure for using log files. These
							files log visitors to websites. All hosting companies do this as a
							part of hosting service analytics. The information collected by
							log files includes IP addresses, browser type, ISP, date and time
							stamp, referring/exit pages, and clicks. These are not linked to
							personally identifiable information. The purpose is to analyze
							trends, administer the site, track user movement, and gather
							demographic data.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">Cookies and Web Beacons</h3>
						<p>
							Like any other website, {siteName} uses "cookies." These store
							information such as visitor preferences and the pages visited.
							This information customizes the user experience based on browser
							type and other data.
						</p>
						<p>
							<strong>Google DoubleClick DART Cookie</strong>
							<br />
							Google uses DART cookies to serve ads to our visitors based on
							their visits to this site and others.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">Our Advertising Partners</h3>
						<p>
							Some advertisers on our site may use cookies and web beacons.
							Below are our advertising partners: Google
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">
							Third Party Privacy Policies
						</h3>
						<p>
							Our privacy policy does not apply to other advertisers or
							websites. Please consult their privacy policies for more details
							on data usage and opt-out procedures.
						</p>
						<p>
							You can disable cookies via your browser settings. More detailed
							information can be found on your browser's official site.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">CCPA Privacy Rights</h3>
						<p>Under the CCPA, California consumers have the right to:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Know what personal data we collect</li>
							<li>Request deletion of personal data</li>
							<li>Opt-out of sale of personal data</li>
						</ul>
						<p>
							If you make a request, we have one month to respond. Contact us to
							exercise your rights.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">
							GDPR Data Protection Rights
						</h3>
						<p>Users have the right to:</p>
						<ul className="list-disc pl-6 space-y-2">
							<li>Access their data</li>
							<li>Rectify inaccurate data</li>
							<li>Request erasure of data</li>
							<li>Restrict processing</li>
							<li>Object to processing</li>
							<li>Request data portability</li>
						</ul>
						<p>
							We will respond to such requests within one month. Please contact
							us to exercise any of these rights.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">Children's Resources</h3>
						<p>
							Protecting children online is a priority. We encourage guardians
							to guide their children’s internet use.
						</p>
						<p>
							We do not knowingly collect personal identifiable information from
							children under 13. If you believe your child provided such data,
							contact us immediately. We will delete it promptly.
						</p>
					</section>

					
				</article>
			</div>
		</main>
	);
}
