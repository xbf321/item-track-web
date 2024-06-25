async function sendPusher(env, content) {
	// send Message to notification
	await fetch(env.PUSHER_SERVER_API, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			title: '[ERROR] Collect coordinate fail.',
			content: JSON.stringify(content),
			token: env.PUSHER_SERVER_TOKEN,
		}),
	});
}

export default sendPusher;