// DOM Elements
const taskForm = document.getElementById("task-form")
const taskInput = document.getElementById("task-input")
const taskList = document.getElementById("task-list")
const errorMessage = document.getElementById("error-message")
const tasksCounter = document.getElementById("tasks-counter")
const clearCompletedBtn = document.getElementById("clear-completed")
const filterButtons = document.querySelectorAll(".filter-btn")
const editModal = document.getElementById("edit-modal")
const editInput = document.getElementById("edit-input")
const saveEditBtn = document.getElementById("save-edit")
const cancelEditBtn = document.getElementById("cancel-edit")
const taskTemplate = document.getElementById("task-template")

// App State
let tasks = []
let currentFilter = "all"
let editingTaskId = null

// Initialize the app
function init() {
  loadTasksFromLocalStorage()
  renderTasks()
  updateTasksCounter()

  // Event Listeners
  taskForm.addEventListener("submit", addTask)
  taskList.addEventListener("click", handleTaskAction)
  clearCompletedBtn.addEventListener("click", clearCompletedTasks)
  filterButtons.forEach((button) => {
    button.addEventListener("click", applyFilter)
  })
  saveEditBtn.addEventListener("click", saveEditedTask)
  cancelEditBtn.addEventListener("click", closeEditModal)
}

// Load tasks from local storage
function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem("tasks")
  if (storedTasks) {
    tasks = JSON.parse(storedTasks)
  }
}

// Save tasks to local storage
function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

// Add a new task
function addTask(e) {
  e.preventDefault()

  const taskText = taskInput.value.trim()

  if (!taskText) {
    showError("Task cannot be empty!")
    return
  }

  const newTask = {
    id: Date.now().toString(),
    text: taskText,
    completed: false,
    createdAt: new Date(),
  }

  tasks.push(newTask)
  saveTasksToLocalStorage()

  taskInput.value = ""
  clearError()

  renderTasks()
  updateTasksCounter()
}

// Render tasks based on current filter
function renderTasks() {
  taskList.innerHTML = ""

  const filteredTasks = filterTasks()

  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("p")
    emptyMessage.textContent = "No tasks to display"
    emptyMessage.className = "empty-message"
    taskList.appendChild(emptyMessage)
    return
  }

  filteredTasks.forEach((task) => {
    const taskElement = createTaskElement(task)
    taskList.appendChild(taskElement)
  })
}

// Create a task element from template
function createTaskElement(task) {
  const taskElement = document.importNode(taskTemplate.content, true).querySelector(".task-item")

  const checkbox = taskElement.querySelector(".task-checkbox")
  const taskText = taskElement.querySelector(".task-text")

  taskElement.dataset.id = task.id
  checkbox.checked = task.completed
  taskText.textContent = task.text

  if (task.completed) {
    taskElement.classList.add("completed")
  }

  return taskElement
}

// Handle task actions (complete, edit, delete)
function handleTaskAction(e) {
  const taskItem = e.target.closest(".task-item")
  if (!taskItem) return

  const taskId = taskItem.dataset.id
  const task = tasks.find((t) => t.id === taskId)

  if (!task) return

  // Handle checkbox click
  if (e.target.classList.contains("task-checkbox")) {
    toggleTaskCompletion(taskId, e.target.checked)
  }

  // Handle edit button click
  if (e.target.closest(".edit-btn")) {
    openEditModal(task)
  }

  // Handle delete button click
  if (e.target.closest(".delete-btn")) {
    deleteTask(taskId)
  }
}

// Toggle task completion status
function toggleTaskCompletion(taskId, completed) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId)

  if (taskIndex !== -1) {
    tasks[taskIndex].completed = completed
    saveTasksToLocalStorage()

    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`)
    if (completed) {
      taskElement.classList.add("completed")
    } else {
      taskElement.classList.remove("completed")
    }

    updateTasksCounter()
  }
}

// Delete a task
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId)
  saveTasksToLocalStorage()

  renderTasks()
  updateTasksCounter()
}

// Open edit modal
function openEditModal(task) {
  editingTaskId = task.id
  editInput.value = task.text
  editModal.classList.add("active")
  editInput.focus()
}

// Close edit modal
function closeEditModal() {
  editModal.classList.remove("active")
  editingTaskId = null
}

// Save edited task
function saveEditedTask() {
  if (!editingTaskId) return

  const editedText = editInput.value.trim()

  if (!editedText) {
    // Show error in modal
    editInput.classList.add("error")
    setTimeout(() => {
      editInput.classList.remove("error")
    }, 2000)
    return
  }

  const taskIndex = tasks.findIndex((task) => task.id === editingTaskId)

  if (taskIndex !== -1) {
    tasks[taskIndex].text = editedText
    saveTasksToLocalStorage()
    renderTasks()
  }

  closeEditModal()
}

// Clear completed tasks
function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed)
  saveTasksToLocalStorage()

  renderTasks()
  updateTasksCounter()
}

// Apply filter
function applyFilter(e) {
  filterButtons.forEach((btn) => btn.classList.remove("active"))
  e.target.classList.add("active")

  currentFilter = e.target.dataset.filter
  renderTasks()
}

// Filter tasks based on current filter
function filterTasks() {
  switch (currentFilter) {
    case "active":
      return tasks.filter((task) => !task.completed)
    case "completed":
      return tasks.filter((task) => task.completed)
    default:
      return [...tasks]
  }
}

// Update tasks counter
function updateTasksCounter() {
  const activeTasks = tasks.filter((task) => !task.completed).length
  tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? "s" : ""} left`
}

// Show error message
function showError(message) {
  errorMessage.textContent = message
  taskInput.classList.add("error")

  setTimeout(() => {
    clearError()
  }, 3000)
}

// Clear error message
function clearError() {
  errorMessage.textContent = ""
  taskInput.classList.remove("error")
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init)
