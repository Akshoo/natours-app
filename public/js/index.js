import showMap from './mapbox';
import { showAlert } from './alert';
import { fetchRequest } from './model';

console.log('hello parcel you little duck');

const map = document.querySelector('#map');
if (map) showMap();

const loginForm = document.querySelector('.login-form');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const loginUrl = '/api/v1/users/login';
const logoutUrl = '/api/v1/users/logout';
const updateUrl = '/api/v1/users/updateMe';
const updatePasswordUrl = '/api/v1/users/updateMyPassword';

if (loginForm)
	loginForm.addEventListener('submit', async function (el) {
		el.preventDefault();
		const email = document.querySelector('#email').value;
		const password = document.querySelector('#password').value;
		try {
			// await loginUser(email, password, loginUrl);
			await fetchRequest(loginUrl, { email, password }, 'POST');
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
			const res = await fetchRequest(logoutUrl);
			showAlert('success', res.message);
			setTimeout(() => {
				location.assign('/');
			}, 2000);
		} catch (err) {
			showAlert('error', 'Error logging out. Please Try again.');
			console.log(err);
		}
	});

if (updateUserForm)
	updateUserForm.addEventListener('submit', async function (el) {
		el.preventDefault();
		const name = updateUserForm.querySelector('#name').value;
		const email = updateUserForm.querySelector('#email').value;

		try {
			// const res = await updateUser(name, email, updateUrl);
			const res = await fetchRequest(updateUrl, { name, email }, 'PATCH');
			showAlert('success', res.message);
			setTimeout(() => location.reload(), 1000);
		} catch (err) {
			showAlert('error', err);
			console.log(err);
		}
	});

if (updatePasswordForm)
	updatePasswordForm.addEventListener('submit', async function (el) {
		el.preventDefault();
		const passwordCurrent = updatePasswordForm.querySelector('#password-current').value;
		const password = updatePasswordForm.querySelector('#password').value;
		const passwordConfirm = updatePasswordForm.querySelector('#password-confirm').value;
		const saveBtn = updatePasswordForm.querySelector('.btn--save-password');

		try {
			saveBtn.textContent = 'Updating...';
			const res = await fetchRequest(
				updatePasswordUrl,
				{ passwordCurrent, password, passwordConfirm },
				'PATCH'
			);
			console.log('RESULT', res);
			showAlert('success', 'Password changed successfully');
			setTimeout(() => location.reload(), 1000);
		} catch (err) {
			showAlert('error', err);
			console.log(err);
		}
		saveBtn.textContent = 'Save Password';
	});
