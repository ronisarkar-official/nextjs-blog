// sanity/schemaTypes/comment.ts
import { defineField, defineType } from 'sanity';

export const comment = defineType({
	name: 'comment',
	title: 'Comment',
	type: 'document',
	fields: [
		defineField({
			name: 'user',
			type: 'reference',
			to: [{ type: 'author' }],
			title: 'User',
			// User is optional to allow anonymous comments
		}),
		defineField({
			name: 'guestName',
			type: 'string',
			title: 'Guest Name',
			description: 'Name provided by an anonymous commenter',
			validation: (Rule) => Rule.max(50),
		}),
		defineField({
			name: 'startup',
			type: 'reference',
			to: [{ type: 'startup' }],
			title: 'Startup',
			validation: (Rule) => Rule.required().error('Startup is required'),
		}),
		defineField({
			name: 'content',
			type: 'text',
			title: 'Content',
			validation: (Rule) =>
				Rule.required()
					.min(1)
					.max(1000)
					.error('Comment must be between 1 and 1000 characters'),
		}),
		defineField({
			name: 'parentComment',
			type: 'reference',
			to: [{ type: 'comment' }],
			title: 'Parent Comment',
			description: 'Reference to parent comment for nested replies',
		}),
		defineField({
			name: 'isApproved',
			type: 'boolean',
			title: 'Is Approved',
			description: 'Whether the comment is approved for display',
			initialValue: true,
		}),
		defineField({
			name: 'createdAt',
			type: 'datetime',
			title: 'Created At',
			initialValue: () => new Date().toISOString(),
		}),
	],
	preview: {
		select: {
			userName: 'user.name',
			guestName: 'guestName',
			startupTitle: 'startup.title',
			content: 'content',
			createdAt: 'createdAt',
		},
		prepare(selection) {
			const { userName, guestName, startupTitle, content, createdAt } =
				selection as any;
			const displayName = userName || guestName || 'Guest';
			const truncatedContent =
				content && content.length > 50 ?
					content.substring(0, 50) + '...'
				:	content;
			return {
				title: `${displayName} commented on ${startupTitle}`,
				subtitle: `${truncatedContent} - ${createdAt ? new Date(createdAt).toLocaleDateString() : 'No date'}`,
			};
		},
	},
});
