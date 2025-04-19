// export const loginUser = async function (email, password, loginUrl) {
// 	try {
// 		const res = await (
// 			await fetch(loginUrl, {
// 				method: 'POST',
// 				body: JSON.stringify({ email, password }),
// 				headers: {
// 					'Content-Type': 'application/json',
// 				},
// 			})
// 		).json();
// 		if (res.status != 'success') throw new Error(res.message);
// 		return res;
// 	} catch (err) {
// 		throw err;
// 	}
// };

// export const logoutUser = async function (logoutUrl) {
// 	try {
// 		const res = await (
// 			await fetch(logoutUrl, {
// 				method: 'GET',
// 			})
// 		).json();

// 		if (res.status != 'success') throw new Error(res.message);
// 		return res;
// 	} catch (err) {
// 		throw err;
// 	}
// };

// export const updateUser = async function (name, email, updateUrl) {
// 	try {
// 		const res = await (
// 			await fetch(updateUrl, {
// 				method: 'PATCH',
// 				body: JSON.stringify({ name, email }),
// 				headers: {
// 					'Content-Type': 'application/json',
// 				},
// 			})
// 		).json();
// 		if (res.status != 'success') throw new Error(res.message);
// 		return res;
// 	} catch (err) {
// 		throw err;
// 	}
// };

export const fetchRequest = async function (url, bodyData, method = 'GET') {
	try {
		const res = await (
			await fetch(url, {
				method: method,
				body: bodyData ? JSON.stringify(bodyData) : undefined,
				headers: bodyData ? { 'Content-Type': 'application/json' } : undefined,
			})
		).json();
		if (res.status != 'success') throw new Error(res.message);
		return res;
	} catch (err) {
		throw err;
	}
};
