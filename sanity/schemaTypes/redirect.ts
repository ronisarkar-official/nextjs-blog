import { icons } from 'lucide-react';
import { defineField, defineType } from 'sanity';

export const redirect = defineType({
	name: 'redirect',
	title: 'URL Redirect',
	type: 'document',
	icon: icons.ArrowRightLeft,
	fields: [
		defineField({
			name: 'source',
			title: 'Source URL (Old URL)',
			type: 'string',
			description: 'The old URL path that should redirect (e.g., /old-page)',
			validation: (Rule) =>
				Rule.required()
					.custom((source) => {
						if (!source) return true;
						// Must start with /
						if (!source.startsWith('/')) {
							return 'Source URL must start with /';
						}
						// No domain/protocol allowed
						if (source.includes('://')) {
							return 'Source URL should be a path only (no http:// or https://)';
						}
						return true;
					}),
		}),
		defineField({
			name: 'destination',
			title: 'Destination URL (New URL)',
			type: 'string',
			description: 'The new URL to redirect to (e.g., /new-page or https://example.com)',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'permanent',
			title: 'Permanent Redirect',
			type: 'boolean',
			description: '301 (permanent) or 302 (temporary) redirect',
			initialValue: true,
		}),
		defineField({
			name: 'active',
			title: 'Active',
			type: 'boolean',
			description: 'Enable or disable this redirect',
			initialValue: true,
		}),
		defineField({
			name: 'authorId',
			title: 'Author ID',
			type: 'string',
			description: 'The author who created this redirect',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'createdAt',
			title: 'Created At',
			type: 'datetime',
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			source: 'source',
			destination: 'destination',
			active: 'active',
		},
		prepare({ source, destination, active }) {
			return {
				title: source,
				subtitle: `→ ${destination} ${active ? '(Active)' : '(Inactive)'}`,
			};
		},
	},
});
