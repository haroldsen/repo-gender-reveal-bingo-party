
const showPasswordButton = document.querySelector('.show-password-button');
if (showPasswordButton) {
    showPasswordButton.addEventListener('click', () => {
        showPasswordButton.classList.toggle('showing-password');
        const passwordInput = document.querySelector('#password');
        if (passwordInput.type == 'password') {
            passwordInput.type = 'text';
        }
        else {
            passwordInput.type = 'password';
        }
    });
}
