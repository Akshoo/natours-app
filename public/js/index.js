import showMap from './mapbox';
import { showAlert } from './alert';
import { fetchRequest } from './model';

console.log('hello parcel you little duck');

///////////////////////////////////////////////////////////////
// DECLARATIONS

const map = document.querySelector('#map');

const loginForm = document.querySelector('.login-form');
const loginUrl = '/api/v1/users/login';

const logoutBtn = document.querySelector('.nav__el--logout');
const logoutUrl = '/api/v1/users/logout';

const updateUserForm = document.querySelector('.form-user-data');
const updateUrl = '/api/v1/users/updateMe';

const updatePasswordForm = document.querySelector('.form-user-settings');
const updatePasswordUrl = '/api/v1/users/updateMyPassword';

const bookTourBtn = document.querySelector('.btn-book_tour');
const bookTourUrl = bookTourBtn
	? `/api/v1/bookings/checkout-session/${bookTourBtn.dataset.id}`
	: null;

/////////////////////////////////////////////////////////////////////////////////
// LOGIC

if (map) showMap();

if (loginForm)
	loginForm.addEventListener('submit', async function (ev) {
		ev.preventDefault();
		const email = document.querySelector('#email').value;
		const password = document.querySelector('#password').value;
		try {
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
	logoutBtn.addEventListener('click', async function (ev) {
		ev.preventDefault();
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
	updateUserForm.addEventListener('submit', async function (ev) {
		ev.preventDefault();

		const formData = new FormData(updateUserForm);

		try {
			// const res = await fetchRequest(updateUrl, formData, 'PATCH');
			const res = await (
				await fetch(updateUrl, {
					method: 'PATCH',
					body: formData,
				})
			).json();
			showAlert('success', res.message);
			setTimeout(() => location.reload(), 1000);
		} catch (err) {
			showAlert('error', err);
			// console.log(err);
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
			// console.log('RESULT', res);
			showAlert('success', 'Password changed successfully');
			setTimeout(() => location.reload(), 1000);
		} catch (err) {
			showAlert('error', err);
			console.log(err);
		}
		saveBtn.textContent = 'Save Password';
	});

if (bookTourBtn)
	bookTourBtn.addEventListener('click', async function (ev) {
		try {
			const { session } = await fetchRequest(bookTourUrl);
			// console.log(session);
			window.open(session.url);
			// location.assign(session.url);
		} catch (err) {
			console.error(err);
		}
	});
