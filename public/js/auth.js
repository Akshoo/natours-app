
export const loginUser = async function (email, password, loginUrl) {
	try {
		const res = await (
			await fetch(loginUrl, {
				method: 'POST',
				body: JSON.stringify({ email, password }),
				headers: {
					'Content-Type': 'application/json',
				},
			})
		).json();
		if (res.status === 'fail') throw new Error(res.message);
		return res;
	} catch (err) {
		throw err;
	}
};

export const logoutUser = async function (logoutUrl) {
	try {
		const res = await (
		await fetch(logoutUrl, {
			method: 'GET',
		})
	).json();

	if (res.status === 'fail') throw new Error(res.message);
	return res;
	} catch (err) {
		throw err
	}
}
