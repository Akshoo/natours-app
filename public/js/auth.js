const form = document.querySelector('.login-form');
const url = '/api/v1/users/login';

const initRequest = async function (email, password) {
    try {
        const res = await (
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        ).json();
        if (res.status === 'fail') throw new Error(res.message);
    } catch (err) {
        throw err;
    }
};

form.addEventListener('submit', async function (el) {
    el.preventDefault();
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    try {
        await initRequest(email.value, password.value);
        // window.location.href = '/';
        location.assign('/');
    } catch (err) {
        console.error(err);
    }
});
