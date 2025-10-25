// File: app/(root)/terms/page.tsx

import Link from 'next/link';
import React from 'react';

const sitename = process.env.NEXT_PUBLIC_SITE_NAME;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.spechype.com';
const siteName = sitename ?? 'SpecHype';
const siteNameUpper = siteName.toUpperCase();

export const metadata = {
	title: `${siteName} — Terms & Conditions`,
	description: `Terms and Conditions for ${siteName}`,
};

export default function TermsPage() {
	return (
		<main className="min-h-screen  antialiased transition-colors">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<header className="mb-10 text-center">
					<h1 className="text-4xl font-extrabold center text-black dark:text-white">
						Terms And Condition
					</h1>
				</header>

				<article className="prose prose-lg max-w-none dark:prose-invert">
					<section>
						<h2 className="text-indigo-600 dark:text-indigo-400">
							Welcome to {siteName}!
						</h2>
						<p className="text-gray-800 dark:text-gray-200">
							By accessing this website we assume you accept these terms and
							conditions. Do not continue to use {siteName} if you do not agree
							to take all of the terms and conditions stated on this page.
						</p>
					</section>

					<section className="mb-2 mt-2">
						<h3 className="text-2xl font-extrabold center mb-2 text-black dark:text-white">
							Terminology
						</h3>
						<p className="text-gray-800 dark:text-gray-200">
							The following terminology applies to these Terms and Conditions,
							Privacy Statement and Disclaimer Notice and all Agreements:
							"Client", "You" and "Your" refers to you, the person log on this
							website and compliant to the Company's terms and conditions. "The
							Company", "Ourselves", "We", "Our" and "Us", refers to our
							Company. "Party", "Parties", or "Us", refers to both the Client
							and ourselves. All terms refer to the offer, acceptance and
							consideration of payment necessary to undertake the process of our
							assistance to the Client in the most appropriate manner for the
							express purpose of meeting the Client's needs in respect of
							provision of the Company's stated services, in accordance with and
							subject to, prevailing law of Netherlands. Any use of the above
							terminology or other words in the singular, plural, capitalization
							and/or he/she or they, are taken as interchangeable and therefore
							as referring to same.
						</p>
					</section>

					<section className="mb-2 mt-2">
						<h3 className="text-2xl font-extrabold mb-2 text-black dark:text-white">
							Cookies
						</h3>
						<p className="text-gray-800 dark:text-gray-200">
							We employ the use of cookies. By accessing {siteName}, you agreed
							to use cookies in agreement with the privacy policy of {siteName}.
						</p>
						<p className="text-gray-800 dark:text-gray-200">
							Most interactive websites use cookies to let us retrieve the
							user's details for each visit. Cookies are used by our website to
							enable the functionality of certain areas to make it easier for
							people visiting our website. Some of our affiliate/advertising
							partners may also use cookies.
						</p>
					</section>

					<section className="mb-2 mt-2">
						<h3 className="text-2xl font-extrabold mb-2 text-black dark:text-white">
							License
						</h3>
						<p className="text-gray-800 dark:text-gray-200">
							Unless otherwise stated, {siteNameUpper} and/or its licensors own
							the intellectual property rights for all material on {siteName}.
							All intellectual property rights are reserved. You may access this
							from {siteName} for your own personal use subjected to
							restrictions set in these terms and conditions.
						</p>
						<p className="text-gray-800 dark:text-gray-200">You must not:</p>
						<ul className="list-disc pl-6 space-y-1 text-gray-800 dark:text-gray-200">
							<li>Republish material from {siteName}</li>
							<li>Sell, rent or sub-license material from {siteName}</li>
							<li>Reproduce, duplicate or copy material from {siteName}</li>
							<li>Redistribute content from {siteName}</li>
						</ul>
						<p className="text-gray-800 dark:text-gray-200">
							This Agreement shall begin on the date hereof. Our Terms and
							Conditions were created with the help of the ToolsPrince Terms And
							Conditions Generator.
						</p>
					</section>

					<section className="mb-2 mt-2">
						<h3 className="text-2xl font-extrabold center mb-2 text-black dark:text-white">
							User Comments
						</h3>
						<p className="text-gray-800 dark:text-gray-200">
							Parts of this website offer an opportunity for users to post and
							exchange opinions and information in certain areas of the website.{' '}
							{siteName} does not filter, edit, publish or review Comments prior
							to their presence on the website. Comments do not reflect the
							views and opinions of {siteName}, its agents and/or affiliates.
							Comments reflect the views and opinions of the person who post
							their views and opinions. To the extent permitted by applicable
							laws, {siteName} shall not be liable for the Comments or for any
							liability, damages or expenses caused and/or suffered as a result
							of any use of and/or posting of and/or appearance of the Comments
							on this website.
						</p>
						<p className="text-gray-800 dark:text-gray-200">
							{siteName} reserves the right to monitor all Comments and to
							remove any Comments which can be considered inappropriate,
							offensive or causes breach of these Terms and Conditions.
						</p>
						<p className="text-gray-800 dark:text-gray-200">
							You warrant and represent that:
						</p>
						<ul className="list-disc pl-6 space-y-1 text-gray-800 dark:text-gray-200">
							<li>
								You are entitled to post the Comments on our website and have
								all necessary licenses and consents to do so;
							</li>
							<li>
								The Comments do not invade any intellectual property right,
								including without limitation copyright, patent or trademark of
								any third party;
							</li>
							<li>
								The Comments do not contain any defamatory, libelous, offensive,
								indecent or otherwise unlawful material which is an invasion of
								privacy;
							</li>
							<li>
								The Comments will not be used to solicit or promote business or
								custom or present commercial activities or unlawful activity.
							</li>
						</ul>
						<p className="text-gray-800 dark:text-gray-200">
							You hereby grant {siteName} a non-exclusive license to use,
							reproduce, edit and authorize others to use, reproduce and edit
							any of your Comments in any and all forms, formats or media.
						</p>
					</section>

					<section className="mb-2 mt-2">
						<h3 className="text-2xl font-extrabold center mb-2 text-black dark:text-white">
							Hyperlinking to our Content
						</h3>
						<p className="text-gray-800 dark:text-gray-200">
							The following organizations may link to our Website without prior
							written approval:
						</p>
						<ul className="list-disc pl-6 space-y-1 text-gray-800 dark:text-gray-200">
							<li>Government agencies;</li>
							<li>Search engines;</li>
							<li>News organizations;</li>
							<li>
								Online directory distributors may link to our Website in the
								same manner as they hyperlink to the Websites of other listed
								businesses; and
							</li>
							<li>
								System wide Accredited Businesses except soliciting non-profit
								organizations, charity shopping malls, and charity fundraising
								groups which may not hyperlink to our Web site.
							</li>
						</ul>
						<p className="text-gray-800 dark:text-gray-200">
							These organizations may link to our home page, to publications or
							to other Website information so long as the link: (a) is not in
							any way deceptive; (b) does not falsely imply sponsorship,
							endorsement or approval of the linking party and its products
							and/or services; and (c) fits within the context of the linking
							party's site.
						</p>
					</section>

					<section className="mb-2 mt-2">
						<h3 className="text-2xl font-extrabold center mb-2 text-black dark:text-white">
							Disclaimer
						</h3>
						<p className="text-gray-800 dark:text-gray-200">
							To the maximum extent permitted by applicable law, we exclude all
							representations, warranties and conditions relating to our website
							and the use of this website. Nothing in this disclaimer will:
						</p>
						<ul className="list-disc pl-6 space-y-1 text-gray-800 dark:text-gray-200">
							<li>
								limit or exclude our or your liability for death or personal
								injury;
							</li>
							<li>
								limit or exclude our or your liability for fraud or fraudulent
								misrepresentation;
							</li>
							<li>
								limit any of our or your liabilities in any way that is not
								permitted under applicable law; or
							</li>
							<li>
								exclude any of our or your liabilities that may not be excluded
								under applicable law.
							</li>
						</ul>
						<p className="text-gray-800 dark:text-gray-200">
							The limitations and prohibitions of liability set in this Section
							and elsewhere in this disclaimer: (a) are subject to the preceding
							paragraph; and (b) govern all liabilities arising under the
							disclaimer, including liabilities arising in contract, in tort and
							for breach of statutory duty.
						</p>
						<p className="text-gray-800 dark:text-gray-200">
							As long as the website and the information and services on the
							website are provided free of charge, we will not be liable for any
							loss or damage of any nature.
						</p>
					</section>
				</article>
			</div>
		</main>
	);
}
