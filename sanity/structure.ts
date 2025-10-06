import type { StructureResolver } from 'sanity/structure';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
	S.list()
		.title('Content')
		.items([
			S.documentTypeListItem('author').title('Authors'),
			S.documentTypeListItem('startup').title('Startups'),
			S.divider(),
			S.documentTypeListItem('comment').title('Comments'),
			S.divider(),
			...S.documentTypeListItems().filter(
				(item) =>
					item.getId() &&
					!['author', 'startup', 'comment'].includes(item.getId()!),
			),
		]);
