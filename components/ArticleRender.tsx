// ArticleRenderer.server.tsx
// Server-rendered, optimized Article renderer for Next.js (single-file).
// - Sanitizes & transforms HTML on the server using JSDOM + DOMPurify
// - Pre-wraps iframes, tables, code blocks, figures, blockquotes, images
// - Renders static HTML (no heavy client JS). Adds a tiny inline script
//   to wire "Copy" buttons only (minimal client runtime).
// Usage: import ArticleRenderer from './ArticleRenderer.server';

import React from 'react';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const BASE_PROSE =
	'mx-auto max-w-4xl font-work-sans text-gray-800 dark:text-gray-100 prose prose-neutral dark:prose-invert lg:prose-lg ' +
	'[&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:leading-tight ' +
	'[&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:font-bold ' +
	'[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold ' +
	'[&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-bold' +
	'[&_p]:mb-5 [&_p]:leading-relaxed ' +
	// list styling: ul = disc, ol = decimal, padding, marker color, item spacing
	'[&_ul]:mb-5 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:marker:text-gray-600 dark:[&_ul]:marker:text-gray-400 ' +
	'[&_ol]:mb-5 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:marker:text-gray-600 dark:[&_ol]:marker:text-gray-400 ' +
	'[&_li]:mb-2 [&_li]:leading-relaxed ' +
	'[&_blockquote]:my-6 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-200 dark:[&_blockquote]:border-gray-700 ' +
	'[&_img]:mx-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:max-w-full ' +
	'[&_pre]:rounded-lg [&_pre]:bg-gray-50 dark:[&_pre]:bg-gray-800 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 ';

// Minimal server-side HTML processing + sanitization.
function serverProcessHtml(html: string, sanitize = true) {
	if (!html) return '';

	// Setup JSDOM + DOMPurify (server-side)
	const window = new JSDOM('').window as unknown as Window & typeof globalThis;
	const DOMPurify = createDOMPurify(window as any);

	// Basic sanitize first (allow images to keep loading attr)
	let clean =
		sanitize ? DOMPurify.sanitize(html, { ADD_ATTR: ['loading'] }) : html;

	// Use JSDOM to parse and do light transformations server-side so client doesn't
	// need to mutate DOM heavily.
	const doc = new JSDOM(clean).window.document;

	// Responsive iframes: wrap in aspect-ratio container
	doc.querySelectorAll('iframe').forEach((iframe) => {
		const wrapper = doc.createElement('div');
		wrapper.setAttribute(
			'class',
			'relative w-full aspect-video my-6 rounded-lg overflow-hidden shadow-sm',
		);
		// move iframe into wrapper
		iframe.parentNode?.replaceChild(wrapper, iframe);
		iframe.classList.add('w-full', 'h-full');
		wrapper.appendChild(iframe);
	});

	// Tables: make responsive and fit content without scrollbars
	doc.querySelectorAll('table').forEach((table) => {
		const wrapper = doc.createElement('div');
		wrapper.setAttribute('class', 'w-full rounded-xl shadow-sm my-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 overflow-hidden');
		table.parentNode?.replaceChild(wrapper, table);
		wrapper.appendChild(table);
		table.classList.add(
			'w-full',
			'text-sm',
			'text-gray-900',
			'dark:text-gray-100',
			'border-collapse',
			'border-spacing-0'
		);

		// Style table headers
		const headers = table.querySelectorAll('th');
		headers.forEach((th) => {
			th.classList.add(
				'px-3',
				'py-3',
				'md:px-6',
				'md:py-4',
				'text-left',
				'font-semibold',
				'text-gray-900',
				'dark:text-gray-100',
				'bg-gray-50',
				'dark:bg-gray-800',
				'border-b',
				'border-gray-300',
				'dark:border-gray-600',
				'uppercase',
				'tracking-wider',
				'text-xs',
				'md:text-sm'
			);
		});

		// Style table cells
		const cells = table.querySelectorAll('td');
		cells.forEach((td) => {
			td.classList.add(
				'px-3',
				'py-3',
				'md:px-6',
				'md:py-4',
				'text-gray-900',
				'dark:text-gray-100',
				'border-b',
				'border-gray-200',
				'dark:border-gray-700',
				'break-words',
				'hyphens-auto'
			);
		});

		// Style table rows with hover effect
		const rows = table.querySelectorAll('tbody tr');
		rows.forEach((row) => {
			row.classList.add(
				'hover:bg-gray-50',
				'dark:hover:bg-gray-800',
				'transition-colors',
				'duration-150'
			);
		});
	});

	// Code blocks: add copy button markup server-side (client will only attach listener)
	doc.querySelectorAll('pre').forEach((pre, i) => {
		const code = pre.querySelector('code');
		pre.classList.add(
			'relative',
			'rounded-lg',
			'p-4',
			'text-sm',
			'leading-relaxed',
			'my-6',
		);
		if (code) {
			// create copy button
			const btn = doc.createElement('button');
			btn.setAttribute('type', 'button');
			btn.setAttribute('data-copy-target', `#code-block-${i}`);
			btn.setAttribute('aria-label', 'Copy code');
			btn.textContent = 'Copy';
			btn.setAttribute(
				'class',
				'absolute top-2 right-2 text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 border',
			);
			// ensure code has an id
			code.id = `code-block-${i}`;
			pre.appendChild(btn);
		}
	});

	// Figures/figcaptions
	doc.querySelectorAll('figure').forEach((fig) => {
		const img = fig.querySelector('img');
		if (img) {
			img.classList.add('rounded-lg', 'shadow-sm');
			// set lazy loading if not present
			if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
		}
		const caption = fig.querySelector('figcaption');
		if (caption)
			caption.classList.add('text-sm', 'text-gray-500', 'mt-2', 'text-center');
	});

	// Blockquotes
	doc.querySelectorAll('blockquote').forEach((bq) => {
		bq.classList.add('bg-gray-50', 'dark:bg-gray-800', 'p-4', 'rounded-md');
	});

	// Images: lazy loading & responsive classes
	doc.querySelectorAll('img').forEach((img) => {
		if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
		img.classList.add('mx-auto', 'rounded-lg', 'shadow-sm', 'max-w-full');
	});

	return doc.body.innerHTML;
}

// Reusable small server-side presentational components
export function Callout({
	children,
	title,
	tone = 'info',
}: {
	children: React.ReactNode;
	title?: string;
	tone?: 'info' | 'warn' | 'danger' | 'success';
}) {
	const toneStyles = {
		info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20',
		warn: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20',
		danger: 'bg-red-50 border-red-200 dark:bg-red-900/20',
		success: 'bg-green-50 border-green-200 dark:bg-green-900/20',
	};
	return (
		<div
			className={`border-l-4 p-4 my-4 rounded-md ${toneStyles[tone] ?? toneStyles.info}`}>
			{title && <div className="font-semibold mb-1">{title}</div>}
			<div className="text-sm">{children}</div>
		</div>
	);
}

export function PullQuote({
	children,
	author,
}: {
	children: React.ReactNode;
	author?: string;
}) {
	return (
		<blockquote className="my-6 mx-0 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg italic text-lg border-l-4 border-gray-300 dark:border-gray-700">
			<div>{children}</div>
			{author && (
				<cite className="block mt-3 text-sm not-italic">— {author}</cite>
			)}
		</blockquote>
	);
}

export function Figure({
	src,
	alt,
	caption,
	className = '',
}: {
	src: string;
	alt: string;
	caption?: string;
	className?: string;
}) {
	return (
		<figure className={`my-6 ${className}`}>
			<img
				src={src}
				alt={alt}
				loading="lazy"
				className="mx-auto rounded-lg shadow-sm max-w-full"
			/>
			{caption && (
				<figcaption className="text-sm text-gray-500 mt-2 text-center">
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

// Server component (default export). This does the heavy work server-side.
export default function ArticleRenderer({
	html,
	sanitize = true,
	variant = 'default',
	dropcap = false,
}: {
	html: string;
	sanitize?: boolean;
	variant?: 'default' | 'clean';
	dropcap?: boolean;
}) {
	const processedHtml = serverProcessHtml(html, sanitize);
	const dropcapClass =
		dropcap ?
			'[&_p:first-of-type]:text-4xl [&_p:first-of-type]:float-left [&_p:first-of-type]:mr-3 [&_p:first-of-type]:leading-none [&_p:first-of-type]:font-semibold'
		:	'';
	const variantClasses: Record<string, string> = {
		default: BASE_PROSE,
		clean: 'mx-auto max-w-3xl text-gray-800 dark:text-gray-100 leading-7',
	};
	const containerId = `article-${Math.random().toString(36).slice(2, 9)}`;

	// Tiny inline script to wire up copy buttons. Kept minimal to avoid extra client bundle.
	// It uses event delegation and navigator.clipboard.
	const inlineScript = `(()=>{try{const c=document.getElementById("${containerId}");if(!c)return;const btns=c.querySelectorAll('button[data-copy-target]');btns.forEach(b=>{if(b.__wired)return;const target=b.getAttribute('data-copy-target');const codeEl=c.querySelector(target);b.addEventListener('click',async()=>{try{if(codeEl)await navigator.clipboard.writeText(codeEl.innerText);b.innerText='Copied';setTimeout(()=>b.innerText='Copy',1500);}catch(e){b.innerText='Error';setTimeout(()=>b.innerText='Copy',1500);} });b.__wired=true;});}catch(e){console.error(e);}})();`;

	return (
		<>
			<article
				id={containerId}
				className={`${variantClasses[variant] ?? BASE_PROSE} ${dropcapClass}`}
				dangerouslySetInnerHTML={{ __html: processedHtml }}
			/>
			{/* Inline script: tiny, unavoidable client behavior for "Copy" buttons. */}
			<script dangerouslySetInnerHTML={{ __html: inlineScript }} />
		</>
	);
}

// Example usage component (server)
export const ExampleUsage = ({ htmlString }: { htmlString: string }) => {
	return (
		<div>
			<ArticleRenderer
				html={htmlString}
				sanitize={true}
				dropcap={true}
			/>
			<Callout
				tone="warn"
				title="Note">
				This article component renders server-side and includes responsive
				embeds, table wrappers, code copy buttons (wired with a tiny inline
				script), and basic figure/caption treatment.
			</Callout>
		</div>
	);
};
