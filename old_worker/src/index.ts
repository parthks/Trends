/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import Typesense from 'typesense';

type Media = { original_url: string; url: string; thumbnail_url?: string; type: string };
type TweetData = {
	id: string;
	created_at: number;
	user: string;
	media: Media[];
	text?: string;
	quote?: string;
	quote_media?: Media[];
	retweet?: string;
	retweet_user?: string;
	original_tweet_id?: string;
};
type SearchDocumentType = TweetData & {
	thread: TweetData[];
};

export default {
	async fetch(request, env) {
		const tasks = [];

		if (!(env as any).TYPESENSE_API_KEY) {
			return Response.json({ error: 'No Typesense API key found' }, { status: 400 });
		}

		let client = new Typesense.Client({
			nodes: [
				{
					host: 'yic0jokl7s3quw65p-1.a1.typesense.net', // For Typesense Cloud use xxx.a1.typesense.net
					port: 443, // For Typesense Cloud use 443
					protocol: 'https', // For Typesense Cloud use https
				},
			],
			apiKey: (env as any).TYPESENSE_API_KEY,
			connectionTimeoutSeconds: 2,
		});

		const searchParameters = {
			q: 'permahacks',
			query_by: 'text, quote, retweet ',
			sort_by: '_text_match:desc',
			exclude_fields: 'embedding',
			per_page: 250,
		};

		const searchResults = await client.collections<SearchDocumentType>('tweets').documents().search(searchParameters);

		if (!searchResults.hits) {
			return Response.json({ error: 'No search results found' }, { status: 400 });
		}

		const searchDocuments = searchResults.hits.map((hit) => hit.document);

		// First, create a map to track which original tweets we've seen
		const seenOriginalTweets = new Set<string>();

		// Filter out duplicate retweets
		const filteredDocuments = searchDocuments.filter((tweet) => {
			if (!tweet.original_tweet_id) {
				// Keep all non-retweets
				return true;
			}

			// For retweets, if we have the original tweet in our set, filter out this retweet
			if (searchDocuments.find((t) => t.id === tweet.original_tweet_id)) {
				return false;
			}

			// check if we've seen this original_tweet_id before
			if (!seenOriginalTweets.has(tweet.original_tweet_id)) {
				// If we haven't seen it, add it to our set and keep this retweet
				seenOriginalTweets.add(tweet.original_tweet_id);
				return true;
			}

			// If we've seen this original_tweet_id before, filter out this retweet
			return false;
		});

		// segment tweets by day
		const tweetsByDate = filteredDocuments.reduce((acc, tweet) => {
			const date = new Date(tweet.created_at * 1000).toISOString();
			acc[date] = acc[date] || [];
			acc[date].push(tweet);
			return acc;
		}, {} as Record<string, SearchDocumentType[]>);

		// format a single string message of tweets. First say Date: then the tweets
		const messages = Object.entries(tweetsByDate)
			.map(([date, tweets]) => {
				return `Date: ${date}\n${tweets
					.map((tweet) => {
						return `Tweet: ${tweet.text || tweet.retweet}\n 
				${tweet.quote ? `Quote: ${tweet.quote}` : ''}\n`;
					})
					.join('\n')}\n\n`;
			})
			.join('\n');

		return Response.json({ tweetsByDate });

		// messages - chat style input
		let prompt = `
		Summarize the key updates from tweets. Use only the provided tweets as the source material, and avoid repeating anything. If there is an external link in the tweets (like to a website or blog), include it so people can easily explore more.
		Focus on delivering a concise, actionable summary without unnecessary openings or conclusions. Use a friendly but efficient tone, and only include the essential updates.
		
		${messages}`;

		let response = await env.AI.run(
			'@cf/meta/llama-3.3-70b-instruct-fp8-fast' as any,
			{
				messages: [
					{
						role: 'system',
						content:
							'You are a helpful assistant expert in summarizing tweets. Do not include any helper text in your response. Only output the summary. ',
					},
					{ role: 'user', content: prompt },
				],
			},
			{
				gateway: {
					id: 'trends',
				},
			}
		);
		tasks.push({ inputs: prompt, response });

		return Response.json(tasks);
	},
} satisfies ExportedHandler<Env>;
