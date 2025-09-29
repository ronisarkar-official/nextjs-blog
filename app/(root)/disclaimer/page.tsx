// File: app/(root)/disclaimer/page.tsx

import Link from 'next/link';
import React from 'react';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME ?? 'SpecHype';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spechype.com';

export const metadata = {
	title: `${sitename} — Disclaimer`,
	description: `Disclaimer for ${sitename}`,
};

export default function DisclaimerPage() {
	return (
		<main className="min-h-screen bg-white text-black antialiased">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<header className="mb-8 text-center">
					<h1 className="text-4xl font-extrabold text-black">Disclaimer</h1>
					<p className="mt-2 text-sm text-gray-600">
						Last updated: <time>September 29, 2025</time>
					</p>
				</header>

				<article className="prose prose-lg max-w-none space-y-8">
					<section>
						<h2 className="text-black font-bold">Website Disclaimer</h2>
						<p>
							The information provided by {sitename} ("we", "us", or "our") on{' '}
							<a
								href={siteUrl}
								className="underline decoration-indigo-600">
								{siteUrl}
							</a>{' '}
							(the "Site") is for general informational purposes only. All
							information on the Site is provided in good faith; however, we
							make no representation or warranty of any kind, express or
							implied, regarding the accuracy, adequacy, validity, reliability,
							availability, or completeness of any information on the Site.
						</p>
						<p className="font-semibold text-black">
							UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY
							LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE
							SITE OR RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE. YOUR USE
							OF THE SITE AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE IS
							SOLELY AT YOUR OWN RISK.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">External Links Disclaimer</h3>
						<p>
							The Site may contain (or you may be sent through the Site) links
							to other websites or content belonging to or originating from
							third parties or links to websites and features in banners or
							other advertising. Such external links are not investigated,
							monitored, or checked for accuracy, adequacy, validity,
							reliability, availability, or completeness by us.
						</p>
						<p className="font-semibold text-black">
							WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY
							FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION OFFERED BY
							THIRD-PARTY WEBSITES LINKED THROUGH THE SITE OR ANY WEBSITE OR
							FEATURE LINKED IN ANY BANNER OR OTHER ADVERTISING. WE WILL NOT BE
							A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY
							TRANSACTION BETWEEN YOU AND THIRD-PARTY PROVIDERS OF PRODUCTS OR
							SERVICES.
						</p>
					</section>

					<section>
						<h3 className="text-black font-bold">Professional Disclaimer</h3>
						<p>
							The Site cannot and does not contain coding, gaming, or tech
							advice. The coding, gaming, and tech information is provided for
							general informational and educational purposes only and is not a
							substitute for professional advice. Accordingly, before taking any
							actions based upon such information, we encourage you to consult
							with the appropriate professionals. We do not provide any kind of
							coding, gaming, or tech advice.
						</p>
						<p className="font-semibold text-black">
							THE USE OR RELIANCE OF ANY INFORMATION CONTAINED ON THE SITE IS
							SOLELY AT YOUR OWN RISK.
						</p>
					</section>

					
				</article>
			</div>
		</main>
	);
}
