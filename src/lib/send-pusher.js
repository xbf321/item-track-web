export default function sendPusher(env) {
	return async (title, content) => {
		// send Message to notification
		await fetch(env.PUSHER_SERVER_API, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				content: JSON.stringify(content),
				token: env.PUSHER_SERVER_TOKEN,
			}),
		});
	};

}