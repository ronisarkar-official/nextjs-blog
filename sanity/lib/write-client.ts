// sanity/lib/write-client.ts (relaxed)
'server-only';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '../env';

export const writeClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token,
	ignoreBrowserTokenWarning: true,
});

if (!writeClient.config().token) {
	// Don't crash the server automatically — log so you notice in console.
	console.warn(
		'SANITY write token is not set. Write operations will fail. Set SANITY_WRITE_TOKEN in server env.',
	);
}
