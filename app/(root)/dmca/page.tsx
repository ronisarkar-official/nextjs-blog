// File: app/(root)/dmca/page.tsx

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
	title: `${siteName} — DMCA`,
	description: `DMCA for ${siteName}`,
};

export default function DMCAPage() {
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
							<BreadcrumbPage>DMCA</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>

				<Card className="bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
					<CardHeader>
						<CardTitle className="text-3xl md:text-4xl text-center">
							DMCA
						</CardTitle>
						<CardDescription className="text-center">
							Last updated: <time>{new Date().toLocaleDateString()}</time>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<article className="prose prose-neutral prose-headings:scroll-mt-24 dark:prose-invert max-w-none space-y-8">
							<section>
								<h2>
									DMCA for <b>{siteName}</b>
								</h2>
								<p>
									This Digital Millennium Copyright Act Policy ("Policy")
									applies to the <b>{siteUrl}</b> website ("Website" or
									"Service") and any of its related products and services
									(collectively, "Services") and outlines how this Website
									operator ("Operator", "we", "us" or "our") addresses copyright
									infringement notifications and how you ("you" or "your") may
									submit a copyright infringement complaint.
								</p>
								<p>
									Protection of intellectual property is of utmost importance to
									us and we ask our users and their authorized agents to do the
									same. It is our policy to expeditiously respond to clear
									notifications of alleged copyright infringement that comply
									with the United States Digital Millennium Copyright Act
									("DMCA") of 1998, the text of which can be found on the U.S.
									Copyright Office{' '}
									<a
										href="https://www.copyright.gov/"
										target="_blank"
										rel="noreferrer noopener">
										website
									</a>
									.
								</p>
							</section>
							<section>
								<h2>
									What to consider before submitting a copyright complaint
								</h2>
								<p>
									Please note that if you are unsure whether the material you
									are reporting is in fact infringing, you may wish to contact
									an attorney before filing a notification with us. Our DMCA
									page was generated with the help of the RaptorKit's{' '}
									<a href="https://raptorkit.com/dmca-generator/">
										Free DMCA Generator
									</a>
									.
								</p>
								<p>
									The DMCA requires you to provide your personal information in
									the copyright infringement notification. If you are concerned
									about the privacy of your personal information, you may wish
									to{' '}
									<a
										href="https://www.copyrighted.com/professional-takedowns"
										target="_blank"
										rel="noreferrer noopener">
										use an agent
									</a>{' '}
									to report infringing material for you.
								</p>
							</section>
							<section>
								<h2>Notifications of infringement</h2>
								<p>
									If you are a copyright owner or an agent thereof, and you
									believe that any material available on our Services infringes
									your copyrights, then you may submit a written copyright
									infringement notification ("Notification") using the contact
									details below pursuant to the DMCA. All such Notifications
									must comply with the DMCA requirements.
								</p>
								<p>
									Filing a DMCA complaint is the start of a pre-defined legal
									process. Your complaint will be reviewed for accuracy,
									validity, and completeness. If your complaint has satisfied
									these requirements, our response may include the removal or
									restriction of access to the allegedly infringing material.
								</p>
								<p>
									If we remove or restrict access to materials or terminate any
									account in response to a notification of alleged infringement,
									we will make a good faith effort to contact the affected user
									with information concerning the removal or restriction of
									access.
								</p>
								<p>
									Notwithstanding anything to the contrary contained in any
									portion of this Policy, the Operator reserves the right to
									take no action upon receipt of a DMCA copyright infringement
									notification if it fails to comply with all the requirements
									of the DMCA for such notifications.
								</p>
							</section>
							<section>
								<h2>Changes and amendments</h2>
								<p>
									We reserve the right to modify this Policy or its terms
									related to the Website and Services at any time at our
									discretion. When we do, we will post a notification on the
									main page of the Website. We may also provide notice to you in
									other ways at our discretion, such as through the contact
									information you have provided.
								</p>
								<p>
									An updated version of this Policy will be effective
									immediately upon the posting of the revised policy unless
									otherwise specified. Your continued use of the Website and
									Services after the effective date of the revised Policy (or
									such other act specified at that time) will constitute your
									consent to those changes.
								</p>
							</section>
							<section>
								<h2>Reporting copyright infringement</h2>
								<p>
									If you would like to notify us of the infringing material or
									activity, we encourage you to contact us using the details
									below:
								</p>
								<p>
									Visit our Contact us page or mail us on{' '}
									<a
										href="mailto:ronisarkar10938@gmail.com"
										target="_blank"
										rel="noreferrer"
										className="underline">
										ronisarkar10938@gmail.com
									</a>
								</p>
								<p>
									Please allow us 2-5 business working days for an email
									response.
								</p>
							</section>
						</article>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
