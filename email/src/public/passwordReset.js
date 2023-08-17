const newPassword = document.getElementById('newPassword')
const newPasswordConfirmation = document.getElementById(
	'newPasswordConfirmation'
)
const button = document.querySelector('.reset-button')

const parseUrl = window.location.href.split('/')[4].split('?')

const token = parseUrl[0]
const userType = parseUrl[1].split('=')[1]

button.addEventListener('click', () => {
	if (newPassword.value !== newPasswordConfirmation.value) {
		alert('Passwords do not match')
	} else {
		fetch(`http://localhost:3050/api/v1/${userType}/reset-password/${token}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({
				newPassword: newPassword.value,
				newPasswordConfirmation: newPasswordConfirmation.value,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.status === 'success') {
					alert('Password reset successful')
				} else {
					alert(
						data.validationErrors
							? data.validationErrors.newPassword
							: data.message
					)
				}
			})
			.catch((err) => {
				console.log(err)
			})
	}
})
