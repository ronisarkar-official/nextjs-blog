'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const ToastEditor = dynamic(
	() => import('@toast-ui/react-editor').then((m) => m.Editor),
	{ ssr: false },
);

type Props = {
	value: string;
	onChange: (val: string) => void;
};

export default function OptimizedToastEditor({ value, onChange }: Props) {
	const { resolvedTheme } = useTheme();
	const editorRef = useRef<any>(null);

	// Sync external value into editor once on mount
	useEffect(() => {
		if (!editorRef.current) return;
		try {
			const inst = editorRef.current.getInstance?.();
			if (inst && typeof inst.setMarkdown === 'function') {
				inst.setMarkdown(value || '');
			}
		} catch {}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChange = () => {
		try {
			const md = editorRef.current?.getInstance?.()?.getMarkdown?.() ?? '';
			onChange(String(md));
		} catch {}
	};

	const getInst = () => editorRef.current?.getInstance?.();

	const ensureWysiwyg = () => {
		try {
			const inst = getInst();
			if (inst?.getCurrentMode?.() !== 'wysiwyg') {
				inst?.changeMode?.('wysiwyg', true);
			}
		} catch {}
	};

	const wrapSelection = (before: string, after: string = '') => {
		try {
			const inst = getInst();
			const sel = inst?.getSelectedText?.() ?? '';
			if (!sel) return;
			ensureWysiwyg();
			// operate on full HTML to avoid literal HTML text insertion
			const html = inst?.getHTML?.() ?? '';
			const wrapped = `${before}${sel}${after}`;
			const idx = html.indexOf(sel);
			if (idx >= 0) {
				const next =
					html.slice(0, idx) + wrapped + html.slice(idx + sel.length);
				inst?.setHTML?.(next, false);
			} else {
				// fallback to replaceSelection (markdown mode)
				inst?.replaceSelection?.(wrapped);
			}
			handleChange();
		} catch {}
	};

	const insertHtml = (html: string) => {
		try {
			const inst = getInst();
			ensureWysiwyg();
			// append at caret position is complex; append to end as a safe default
			const curr = inst?.getHTML?.() ?? '';
			inst?.setHTML?.(curr + html, false);
			handleChange();
		} catch {}
	};

	const handleClearFormatting = () => {
		try {
			const inst = getInst();
			const sel = inst?.getSelectedText?.() ?? '';
			if (!sel) return;
			// Basic strip of HTML and common markdown chars
			const plain = sel
				.replace(/<[^>]*>/g, '')
				.replace(/[\*_`~>#\[\]!\(\)\-]+/g, '')
				.replace(/\s{2,}/g, ' ');
			inst?.replaceSelection?.(plain);
			handleChange();
		} catch {}
	};

	// removed: video insert, text color, text align per request

	// Keep theme classes on container for better contrast
	const containerClass = useMemo(
		() =>
			`w-full h-fit rounded-md border shadow-inner overflow-auto ${
				resolvedTheme === 'dark' ?
					'bg-gray-900 border-gray-800'
				:	'bg-white border-gray-300'
			}`,
		[resolvedTheme],
	);

	return (
		<div className={containerClass}>
			{/* Utility toolbar: only Clear formatting */}
			<div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-800">
				<button
					onClick={handleClearFormatting}
					type="button"
					className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
					Clear formatting
				</button>
			</div>

			<ToastEditor
				key={`toast-${resolvedTheme}`}
				ref={editorRef}
				initialValue={value}
				previewStyle="vertical"
				height="500px"
				initialEditType="wysiwyg"
				theme={resolvedTheme === 'dark' ? 'dark' : 'default'}
				useCommandShortcut
				usageStatistics={false}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['hr', 'quote'],
					['ul', 'ol', 'task', 'indent', 'outdent'],
					['table', 'image', 'link'],
					['code', 'codeblock'],
				]}
				placeholder="Write your startup pitch — problem, solution, traction, ask..."
				onChange={handleChange}
			/>
		</div>
	);
}
