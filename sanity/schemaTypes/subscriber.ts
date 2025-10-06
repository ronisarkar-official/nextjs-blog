import { defineField, defineType } from 'sanity';

export const subscriber = defineType({
	name: 'subscriber',
	title: 'Subscriber',
	type: 'document',
	fields: [
		defineField({
			name: 'email',
			type: 'string',
			title: 'Email',
			validation: (Rule) =>
				Rule.required().email().error('Valid email is required'),
		}),
		defineField({
			name: 'status',
			type: 'string',
			title: 'Status',
			options: {
				list: [
					{ title: 'Subscribed', value: 'subscribed' },
					{ title: 'Unsubscribed', value: 'unsubscribed' },
				],
				layout: 'radio',
			},
			initialValue: 'subscribed',
		}),
	],
});
