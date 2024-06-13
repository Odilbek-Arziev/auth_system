const form = document.querySelector("form");
const inputs = [...document.querySelectorAll("input")];
const button = form.querySelector("button");
const users = JSON.parse(localStorage.getItem('users')) ?? []
const modal = document.querySelector('.modal-container')

let regexObject = {
    email: new RegExp("^[a-z0-9_.]+@[a-z]+[.][a-z]{2,4}$"),
    password1: new RegExp(".{8,}$"),
}

form.addEventListener('submit', (event) => {
    event.preventDefault()

    const email = form.email.value
    const password = form.password1.value
    const userExists = users.find((user) => user.email === email)

    if (!userExists) return showModal('Такой аккаунт не существует!', 'Закрыть')

    if (password !== unhashPassword(userExists.password))
        return showModal('Неверный пароль', "Закрыть")

    showModal('Авторизация прошла успешно!',
        "Ок",
        () => {
            localStorage.setItem('user', JSON.stringify({ email }))
            location.href = '../html/index.html'
        })
})


inputs.forEach((input) => {
    input.addEventListener("input", () => {
        if (!validator(input.value, regexObject[input.name])) {
            input.classList.remove("correct");
            input.classList.add("incorrect");
        } else {
            input.classList.add("correct");
            input.classList.remove("incorrect");
        }
        disableButton();
    });

    const help = document.createElement("div");
    help.className = "help is-danger";
    help.textContent = "Это поле обязательное";

    input.addEventListener("focus", () => {
        if (!input.classList.contains("correct")) {
            input.parentElement.append(help);
        }
    });

    input.addEventListener("blur", () => {
        if (input.classList.contains("correct") && input.nextElementSibling) {
            input.nextElementSibling.remove();
        }
    });
});

document.addEventListener('DOMContentLoaded', disableButton)

function disableButton() {
    const isValid = inputs.every((input) =>
        input.classList.contains("correct"));

    if (isValid) {
        button.removeAttribute("disabled");
        return;
    }
    button.setAttribute("disabled", true);
}

function validator(value, regex) {
    return regex.test(value);
}

function showModal(message, buttonText, handler = null) {
    modal.style.display = 'flex'

    const modalContent = modal.querySelector('.modal-content')

    modalContent.textContent = message

    const button = document.createElement('button')
    button.className = 'modal-button'
    button.textContent = buttonText
    modalContent.append(button)

    button.onclick = !handler
        ? () => modal.style.display = 'none'
        : handler

    modal.querySelector('.close').onclick =
        () => {
            modal.style.display = 'none'
            location.reload()
        }
}

function unhashPassword(password) {
    let hashedpassword = "";

    for (let index in password) {
        const charCode = password.charCodeAt(index);

        hashedpassword += String.fromCharCode(charCode - 3);
    }
    return hashedpassword;
}
