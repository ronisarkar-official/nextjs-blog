// sanity/schemaTypes/startup.ts
import { defineField, defineType } from 'sanity';

export const startup = defineType({
	name: 'startup',
	title: 'Startup',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			title: 'Title',
			validation: (Rule) => Rule.required().error('Title is required'),
		}),
		defineField({
			name: 'slug',
			type: 'slug',
			title: 'Slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required().error('Slug is required'),
		}),
		defineField({
			name: 'author',
			type: 'reference',
			to: [{ type: 'author' }],
		}),
		defineField({
			name: 'views',
			type: 'number',
		}),
		defineField({
			name: 'description',
			type: 'text',
		}),
		defineField({
			name: 'category',
			type: 'string',
			validation: (Rule) =>
				Rule.min(1).max(20).required().error('Please enter a category'),
		}),
		defineField({
			name: 'image',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'pitch',
			type: 'markdown',
		}),
	],

	preview: {
		select: {
			title: 'title',
			slug: 'slug.current',
			media: 'image',
		},
		prepare(selection) {
			const { title, slug } = selection;
			return {
				title,
				subtitle: slug ? `/startups/${slug}` : 'no slug',
				media: selection.media,
			};
		},
	},
});
