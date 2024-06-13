const auth = JSON.parse(localStorage.getItem('user'))

if (!auth) {
    alert('user is not authenticated!')
    location.href = 'login.html'
}

const modal = document.querySelector('.modal')
const modalContent = modal.querySelector('.modal-text')
const buttons = modal.querySelector('.buttons')
const modalButton = buttons.firstElementChild

let tasks = JSON.parse(localStorage.getItem('tasks')) ?? []
const tasksContainer = document.querySelector('.tasks')
const addTaskButton = document.querySelector('.addTask')
const addTaskForm = document.querySelector('.addTaskForm')
let taskList = document.querySelector('.taskList')

let currentTaskList;
let editingTask;

document.addEventListener('DOMContentLoaded', refreshTaksList)

// форма добавления задачи
addTaskButton.onclick = (event) => {
    toggleForm()
    addTaskForm.querySelector('.cancel').onclick = toggleForm

    addTaskForm.addEventListener('submit', (event) => {
        event.preventDefault()

        const taskTitle = addTaskForm.taskName.value
        if (!taskTitle)
            return addTaskForm.taskName.classList.add('is-danger')

        let newTask = {
            id: new Date().getTime(),
            title: taskTitle,
            completed: false
        }
        tasks = tasks.map((taskObject) => {
            if (taskObject.id == currentTaskList) {
                taskObject.tasks.push(newTask)
                counter(taskObject.tasks)
            }
            return taskObject
        })

        save()
        showTasks(newTask)

        toggleForm()
        addTaskForm.querySelector('input').classList.remove('is-danger')
    })
}

function toggleForm() {
    addTaskForm.reset()
    addTaskForm.taskName.classList.remove('is-danger')

    addTaskButton.classList.toggle('is-hidden')
    addTaskForm.classList.toggle('is-hidden')

}

// форма добавления списка задач
function addTaskList() {
    modal.querySelector('.modal-close').onclick = close

    const fields = [{
        name: 'input',
        type: 'text',
        label: 'Наименование списка'
    }]
    const form = formGenerator(fields)
    showModal(form)
    form.addEventListener('submit', (event) => {
        event.preventDefault()
        const value = form.input.value

        if (value) {
            let newTaskList = {
                id: new Date().getTime(),
                listTitle: value,
                tasks: []
            }
            tasks.push(newTaskList)
            save()
            form.reset()
            close()
            refreshTaksList()
        }
    })
}

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

function refreshTaksList() {
    tasksContainer.innerHTML = ''

    tasks.forEach((task) => {
        let taskElement = document.createElement('li')
        let text = document.createElement('div')

        text.textContent = task.listTitle
        taskElement.append(text)
        taskElement.setAttribute('id', task.id)

        text.onclick = (event) => {
            taskList.querySelectorAll('.task').forEach((task, index) => {
                if (index !== 0) {
                    task.remove()
                }
            })
            counter(task.tasks)
            showPage(event)
            currentTaskList =
                tasks.find((task) => task.listTitle === event.target.textContent).id

            refreshTasks()
            document.querySelector('.deleteAll').onclick = deleteAllTasks
        }
        // кнопка удаления
        const button = document.createElement('button')
        button.innerHTML = '<ion-icon name="trash"></ion-icon>'
        button.className = 'button is-small is-warning'
        button.setAttribute('id', task.id)
        taskElement.append(button)
        button.onclick = () => deleteTaskList(task.id)

        const editButton = document.createElement('button')
        editButton.innerHTML = '<ion-icon name="create"></ion-icon>'
        editButton.className = 'button is-small is-warning ml-2'
        editButton.setAttribute('id', task.id)
        taskElement.append(editButton)
        editButton.onclick = () => editTaskList(task.id)

        tasksContainer.append(taskElement)
    })
}

function showButtons(event) {
    event.target.querySelector('.buttons').classList.toggle('is-hidden')
}

function showPage(event) {
    let page = document.querySelector('.page')

    page.classList.remove('is-hidden')
    page.querySelector('.taskTitle')
        .textContent = event.target.textContent

    document.onkeydown = (event) => {
        if (event.key == 'Escape') {
            page.classList.add('is-hidden')
        }
    }
}

function showTasks(taskObject) {
    let task = taskList.querySelector('.task')
    let clone = task.cloneNode(true)

    clone.setAttribute('id', taskObject.id)

    const checkbox = clone.querySelector('.checkbox')
    checkbox.checked = taskObject.completed
    checkbox.onchange =
        () => toggleStatus(taskObject.id)

    clone.querySelector('.taskTitle').textContent = taskObject.title

    clone.querySelector('#delete').dataset.id = taskObject.id
    clone.querySelector('#edit').dataset.id = taskObject.id

    clone.classList.remove('is-hidden')
    taskList.classList.remove('is-hidden')
    taskList.appendChild(clone)
}

function counter(array) {
    document.querySelector('.count').textContent = array.length
}
function deleteTask(id) {
    showModal('Подтвердите удаление задачи', "Подтвердить", () => {
        tasks.map((taskList) => {
            if (taskList.id == currentTaskList) {
                taskList.tasks = taskList.tasks.filter((task) => task.id != id)
            }
            return taskList
        })

        let targetList = tasks.find((taskList) => taskList.id == currentTaskList).tasks
        document.getElementById(id).remove()

        save()
        counter(targetList)
        close()
    })
}

function refreshTasks() {
    tasks.find((task) => task.id === currentTaskList)
        .tasks.forEach((todo) => showTasks(todo))
}

function showModal(message, buttonText, handler) {
    modal.classList.add('is-active')

    switch (typeof message) {
        case 'object':
            modalContent.append(message)
            buttons.classList.add('is-hidden')
            break
        case 'string':
            buttons.classList.remove('is-hidden')

            modalContent.textContent = message
            modalContent.classList.add('title')
            modalContent.classList.add('has-text-centered')

            modalButton.textContent = buttonText ?? 'Ок'
            modalButton.onclick = handler ? handler : close

            window.onkeydown = (event) => {
                if (handler && event.key == 'Enter') handler()
                else close()
            }
            break
    }
    modal.querySelector('.modal-close').onclick = close
}

function close() {
    modal.classList.remove('is-active')
    modalContent.innerHTML = ''
    modalContent.className = 'modal-text'

    modalButton.textContent = ''

    buttons.classList.remove('is-active')
    window.onkeydown = () => { }
}

function deleteTaskList(id) {
    showModal('Подтвердите удаление списка', "Подтвердить", () => {
        let targetElement = document.getElementById(id)
        targetElement.remove()

        tasks = tasks.filter((taskList) => taskList.id !== id)
        save()
        close()
    })
}

function toggleStatus(id) {
    let targetElement = document.getElementById(id)
    targetElement.classList.toggle('is-done')

    tasks.map((taskList) => {
        if (taskList.id == currentTaskList) {
            taskList.tasks = taskList.tasks.map((task) => {
                if (task.id === id) {
                    return { ...task, completed: !task.completed }
                }
                return task
            })
        }
        return taskList
    })
    save()
}

function editTask(id) {
    tasks.forEach((taskList) => {
        if (taskList.id == currentTaskList) {
            editingTask = taskList.tasks.filter((task) => task.id == id)[0]
        }
    })

    const fields = [{
        label: 'Текст задачи',
        name: 'title',
        type: 'text'
    }]
    const form = formGenerator(fields)

    showModal(form)

    form.title.value = editingTask.title

    form.addEventListener('submit', (event) => {
        event.preventDefault()
        const value = form.title.value

        tasks = tasks.map((taskList) => {
            if (taskList.id == currentTaskList) {
                taskList.tasks = taskList.tasks.map((task) => {
                    if (task.id == id) {
                        return { ...task, title: value }
                    }
                    return task
                })
            }
            return taskList
        })
        save()
        document.getElementById(id).querySelector('.taskTitle').textContent = value
        form.reset()
        close()
    })
}

function deleteAllTasks() {
    showModal('Подтвердите удаление всех задач', 'Ок', () => {
        const tasksArray = document.querySelectorAll('.task:not(.is-hidden)')
        tasksArray.forEach((task) => task.remove())

        tasks = tasks.map((taskList) =>
            taskList.id == currentTaskList
                ? { ...taskList, tasks: [] }
                : taskList)
        save()
        close()
        counter([])
    })
}

function formGenerator(fields) {
    const form = document.createElement('form')

    fields.forEach((field) => {
        const fieldElement = document.createElement('div')
        fieldElement.className = 'field'

        const fieldLabel = document.createElement('label')
        fieldLabel.className = 'label'
        fieldLabel.textContent = field.label

        fieldElement.append(fieldLabel)

        const input = document.createElement('input')
        input.className = 'input'
        input.name = field.name
        input.type = field.type
        input.setAttribute('required', '')

        fieldElement.append(input)

        const help = document.createElement('div')
        help.className = 'help is-danger'

        fieldElement.append(help)
        form.append(fieldElement)
    })
    const button = document.createElement('button')
    button.className = 'button is-success'
    button.textContent = 'Отправить'

    form.append(button)
    return form
}

function editTaskList(id) {
    const fields = [{
        label: 'Наименование списка задач',
        name: 'title',
        type: 'text'
    }]
    const form = formGenerator(fields)
    showModal(form)

    const taskListElement = document.getElementById(id)
    form.title.value = taskListElement.textContent

    form.addEventListener('submit', (event) => {
        event.preventDefault()

        if (!form.title.value) {
            form.title.nextSibling.textContent = 'Введите текст'
            return
        }
        taskListElement.querySelector('div').textContent = form.title.value
        tasks = tasks.map((taskList) =>
            taskList.id == taskListElement.id
                ? { ...taskList, listTitle: form.title.value }
                : taskList)

        save()
        close()
    })
}
