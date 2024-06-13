const auth = JSON.parse(localStorage.getItem('user'))

if (!auth) {
    alert('user is not authenticated!')
    location.href = 'login.html'
}

const taskListModal = document.querySelector('.taskListModal')
const modal = document.querySelector('.modal')
const simpleModal = document.querySelector('.simpleModal')
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

        addTaskForm.reset()
        toggleForm()
        addTaskForm.querySelector('input').classList.remove('is-danger')
    })
    addTaskForm.querySelector('button[type="button"]').onclick = toggleForm
}

function toggleForm() {
    addTaskButton.classList.toggle('is-hidden')
    addTaskForm.classList.toggle('is-hidden')
}

// форма добавления списка задач
function addTaskList() {
    taskListModal.classList.add('is-active')

    taskListModal.querySelector('.modal-close').onclick =
        () => taskListModal.classList.remove('is-active')

    const form = taskListModal.querySelector('form')

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
            taskListModal.classList.remove('is-active')
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
        simpleModal.classList.remove('is-active')
    })
}

function refreshTasks() {
    tasks.find((task) => task.id === currentTaskList)
        .tasks.forEach((todo) => showTasks(todo))
}

function showModal(message, buttonText, handler) {
    simpleModal.classList.add('is-active')
    const close = () => simpleModal.classList.remove('is-active')
    const button = simpleModal.querySelector('button')

    simpleModal.querySelector('.title').textContent = message
    button.textContent = buttonText

    button.onclick = handler ? handler : close

    simpleModal.querySelector('.modal-close').onclick = close

    window.onkeydown = (event) => {
        if (event.key == 'Enter' && handler) handler()
        else close()
    }
}

function deleteTaskList(id) {
    showModal('Подтвердите удаление списка', "Подтвердить", () => {
        let targetElement = document.getElementById(id)
        targetElement.remove()

        tasks = tasks.filter((taskList) => taskList.id !== id)
        save()
        simpleModal.classList.remove('is-active')
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

    addTaskForm.classList.remove('is-hidden')
    
    addTaskForm.querySelector('input').value = editingTask.title

    addTaskForm.addEventListener('submit', (event) => {
        event.preventDefault()
        const value = addTaskForm.taskName.value

        console.log(value);

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

        addTaskForm.classList.add('is-hidden')

        addTaskForm.reset()
    })
}



function deleteAllTasks() {
    showModal('Подтвердите удаление всех задач', 'Ок', () => {
        document.querySelector('.taskList').innerHTML = ''
        tasks = tasks.map((taskList) =>
            taskList.id == currentTaskList
                ? taskList.tasks = []
                : taskList)
        save()
        modal.classList.remove('is-active')
        counter([])
    })
}
// баг с редактированием

// редактирование списка задач
// сделать кликабельным область до кнопок в боковом меню

// баг c добавлением новой задачи
// после удаления всех задач

// добавить клон списка в левом боковом меню
