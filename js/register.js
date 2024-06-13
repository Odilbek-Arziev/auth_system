const form = document.querySelector("form");
const validations = [...document.querySelectorAll(".check")].slice(0, -1)
const password2 = form.querySelector('input[name="password2"]')
const password = document.querySelector('[type="password"]');
const inputs = [...document.querySelectorAll("input")];
const button = form.querySelector("button");
const users = JSON.parse(localStorage.getItem('users')) ?? []
const email = document.querySelector('[type="email"]')
const modal = document.querySelector('.modal-container')


const regexObject = {
    fullName: new RegExp("^([А-ЯA-Z][a-zа-я]+ ?){2,3}$"),
    email: new RegExp("^[a-z0-9_.]+@[a-z]+[.][a-z]{2,4}$"),
    password1: new RegExp(".{8,}$"),
    password2: new RegExp(".{8,}$"),
};

const passwordObject = {
    uppercase: new RegExp("(?=.*[A-Z])"),
    lowercase: new RegExp("(?=.*[a-z])"),
    numbers: new RegExp("(?=.*[0-9])"),
    symbols: new RegExp("(?=.*[^0-9a-z])", "i"),
    len: new RegExp(".{8,}$"),
};

form.addEventListener('submit', (event) => {
    event.preventDefault()

    let user = {
        fullName: form.fullName.value,
        email: form.email.value,
        password: hashPassword(form.password1.value)
    }
    saveUser(user)
    showModal(
        'Вы успешно зарегистрировались',
        'Войти',
        () => location.href = 'login.html'
    )
})

inputs.forEach((input) => {
    if (input.type == 'checkbox') {
        input.addEventListener('change', () => {
            input.classList.toggle('correct')
            disableButton();
        })
        return
    }

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

password2.addEventListener('input', () => {
    const repeat = document.querySelector('.repeat')
    const result = password.value !== password2.value

    validatePassword(repeat, result)
})


password.addEventListener("input", () => {
    const checkpoints = document.querySelector(".passwords");

    checkpoints.classList.remove("is-hiden");

    if (!password.value) {
        checkpoints.classList.add("is-hiden");
    }

    validations.forEach((field) => {
        const regexResult =
            !passwordObject[field.classList[1]].test(password.value)
        validatePassword(field, regexResult)
    });
});

document.addEventListener("DOMContentLoaded", disableButton);

email.addEventListener('change', () => {
    const emailExists = users.find((user) => user.email === email.value)

    if (emailExists) {
        const exists = document.createElement('div')
        exists.className = "help is-danger"
        exists.textContent = "Этот адрес почты уже существует"

        email.parentElement.append(exists)

        email.classList.add('incorrect')
        email.classList.remove('correct')
        return
    }
    email.parentElement.lastElementChild.remove()
    email.classList.add('correct')
    email.classList.remove('incorrect')
})

function validator(value, regex) {
    return regex.test(value);
}

function disableButton() {
    const isValid = inputs.every((input) => input.classList.contains("correct"));
    const validPassword = validations.every((field) =>
        field.classList.contains("done")
    );
    const passwordsAreEqueal = password.value === password2.value

    if (isValid && validPassword && passwordsAreEqueal) {
        button.removeAttribute("disabled");
        return;
    }
    button.setAttribute("disabled", true);
}

function hashPassword(password) {
    let hashedpassword = "";

    for (let index in password) {
        const charCode = password.charCodeAt(index);

        hashedpassword += String.fromCharCode(charCode + 3);
    }
    return hashedpassword;
}

function validatePassword(field, result) {
    const correct = "&#x2611";
    const incorrect = "&#x2612";
    const status = field.querySelector('.status')

    status.innerHTML = !result ? correct : incorrect
    field.style.color = !result ? 'green' : 'red'

    field.classList.remove(!result ? 'not-done' : 'done')
    field.classList.add(!result ? 'done' : 'not-done')
}

function saveUser(user) {
    users.push(user)
    localStorage.setItem('users', JSON.stringify(users))
    form.reset()
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