// 使用 Cloundflare 环境变量，非 Nextjs 内置环境变量
export default function logCenter(env) {
	return async (body) => {
		// send Message to Log Center
        if (!env.LOG_CENTER_SERVER_API) {
            return;
        }
		await fetch(env.LOG_CENTER_SERVER_API, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
	};

}