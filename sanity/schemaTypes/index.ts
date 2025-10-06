import { type SchemaTypeDefinition } from 'sanity';

import { author } from './author';
import { startup } from './startup';
import { playlist } from './playlist';
import { comment } from './comment';
import { subscriber } from './subscriber';

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [author, startup, playlist, comment, subscriber],
};
