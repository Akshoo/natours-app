import showMap from './mapbox';
import { showAlert } from './alert';
import { loginUser, logoutUser } from './auth';

console.log('hello parcel you little duck');

const map = document.querySelector('#map');
if (map) showMap();

const loginForm = document.querySelector('.login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const loginUrl = '/api/v1/users/login';
const logoutUrl = '/api/v1/users/logout';

if (loginForm)
	loginForm.addEventListener('submit', async function (el) {
		el.preventDefault();
		const email = document.querySelector('#email');
		const password = document.querySelector('#password');
		try {
			await loginUser(email.value, password.value, loginUrl);
			setTimeout(() => {
				location.assign('/');
			}, 2000);
			showAlert('success', 'Logged in successfully');
		} catch (err) {
			showAlert('error', err);
		}
	});

if (logoutBtn)
	logoutBtn.addEventListener('click', async function (el) {
		el.preventDefault();
		try {
			const res = await logoutUser(logoutUrl);
			showAlert('success', res.message);
			setTimeout(() => {
				location.reload();
			}, 2000);
		} catch (err) {
			showAlert('error', 'Error logging out. Please Try again.');
			console.log(err);
		}
	});
