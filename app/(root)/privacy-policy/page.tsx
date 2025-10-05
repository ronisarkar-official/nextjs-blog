// File: app/(root)/privacy/page.tsx

import Link from 'next/link';
import React from 'react';
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator,
	BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spechype.com';
const siteName = sitename ?? 'SpecHype';

export const metadata = {
	title: `${siteName} — Privacy Policy`,
	description: `Privacy Policy for ${siteName}`,
};

export default function PrivacyPage() {
	return (
		<main className="min-h-screen bg-background text-foreground antialiased transition-colors">
			<div className="max-w-6xl mx-auto px-6 py-12">
				<Breadcrumb className="mb-6">
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href="/">Home</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Privacy Policy</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
					<CardHeader>
						<CardTitle className="text-3xl md:text-4xl">
							Privacy Policy
						</CardTitle>
						<CardDescription>
							Last updated: <time>{new Date().toLocaleDateString()}</time>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<article className="prose prose-neutral prose-headings:scroll-mt-24 dark:prose-invert max-w-none space-y-8">
							<section>
								<h2 className="font-semibold">Introduction</h2>
								<p className="text-muted-foreground">
									At {siteName}, one of our main priorities is the privacy of
									our visitors. This Privacy Policy document contains the types
									of information that are collected and recorded by {siteName}{' '}
									and how we use it.
								</p>
								<p className="text-muted-foreground">
									If you have additional questions or require more information
									about our privacy policy, do not hesitate to{' '}
									<Link
										href="/contact-us"
										className="underline decoration-primary underline-offset-4">
										contact us
									</Link>
									.
								</p>
								<p className="text-muted-foreground">
									This privacy policy applies only to our online activities and
									is valid for visitors to our website with regards to the
									information that they share and/or collect in {siteName}. This
									policy is not applicable to any information collected offline
									or via channels other than this website.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">Consent</h3>
								<p className="text-muted-foreground">
									By using our website, you hereby consent to our privacy policy
									and agree to its terms.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">Information we collect</h3>
								<p className="text-muted-foreground">
									The personal information that you are asked to provide and the
									reasons why you are asked to provide it will be made clear to
									you at the point at which we ask you to provide your personal
									information.
								</p>
								<p className="text-muted-foreground">
									If you contact us directly, we may receive additional
									information about you, such as your name, email address, phone
									number, the contents of the message and/or attachments you may
									send us, and any other information you may choose to provide.
								</p>
								<p className="text-muted-foreground">
									When you register for an account, we may ask for your contact
									information, including items such as your name, company name,
									address, email address, and telephone number.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">
									How we use the data you provide
								</h3>
								<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
									<li>Supplying, running, and maintaining our website</li>
									<li>Enhance, customize, and broaden our website</li>
									<li>Recognize and examine how you utilize our website</li>
									<li>
										Create new goods, services, features, and capabilities
									</li>
									<li>
										Communicate with you directly or via partners for support,
										updates, and promotions
									</li>
									<li>Send you emails</li>
									<li>Find and prevent fraud</li>
								</ul>
							</section>

							<section>
								<h3 className="font-semibold">Log Files</h3>
								<p className="text-muted-foreground">
									{siteName} follows a standard procedure for using log files.
									These files log visitors to websites. All hosting companies do
									this as a part of hosting service analytics. The information
									collected by log files includes IP addresses, browser type,
									ISP, date and time stamp, referring/exit pages, and clicks.
									These are not linked to personally identifiable information.
									The purpose is to analyze trends, administer the site, track
									user movement, and gather demographic data.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">Cookies and Web Beacons</h3>
								<p className="text-muted-foreground">
									Like any other website, {siteName} uses "cookies." These store
									information such as visitor preferences and the pages visited.
									This information customizes the user experience based on
									browser type and other data.
								</p>
								<p className="text-muted-foreground">
									<strong>Google DoubleClick DART Cookie</strong>
									<br />
									Google uses DART cookies to serve ads to our visitors based on
									their visits to this site and others.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">Our Advertising Partners</h3>
								<p className="text-muted-foreground">
									Some advertisers on our site may use cookies and web beacons.
									Below are our advertising partners: Google
								</p>
							</section>

							<section>
								<h3 className="font-semibold">Third Party Privacy Policies</h3>
								<p className="text-muted-foreground">
									Our privacy policy does not apply to other advertisers or
									websites. Please consult their privacy policies for more
									details on data usage and opt-out procedures.
								</p>
								<p className="text-muted-foreground">
									You can disable cookies via your browser settings. More
									detailed information can be found on your browser's official
									site.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">CCPA Privacy Rights</h3>
								<p className="text-muted-foreground">
									Under the CCPA, California consumers have the right to:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
									<li>Know what personal data we collect</li>
									<li>Request deletion of personal data</li>
									<li>Opt-out of sale of personal data</li>
								</ul>
								<p className="text-muted-foreground">
									If you make a request, we have one month to respond. Contact
									us to exercise your rights.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">GDPR Data Protection Rights</h3>
								<p className="text-muted-foreground">
									Users have the right to:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
									<li>Access their data</li>
									<li>Rectify inaccurate data</li>
									<li>Request erasure of data</li>
									<li>Restrict processing</li>
									<li>Object to processing</li>
									<li>Request data portability</li>
								</ul>
								<p className="text-muted-foreground">
									We will respond to such requests within one month. Please
									contact us to exercise any of these rights.
								</p>
							</section>

							<section>
								<h3 className="font-semibold">Children's Resources</h3>
								<p className="text-muted-foreground">
									Protecting children online is a priority. We encourage
									guardians to guide their children’s internet use.
								</p>
								<p className="text-muted-foreground">
									We do not knowingly collect personal identifiable information
									from children under 13. If you believe your child provided
									such data, contact us immediately. We will delete it promptly.
								</p>
							</section>
						</article>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
