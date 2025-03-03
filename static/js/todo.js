// Selectors
const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');

// Event Listeners
toDoBtn.addEventListener('click', addToDo);
toDoList.addEventListener('click', deletecheck);
document.addEventListener("DOMContentLoaded", getTodos);

// Create time modal once on page load
document.addEventListener("DOMContentLoaded", createTimeModal);

let currentTodoElement = null;

function updateElectronTodos() {
  if (window.electronAPI) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    window.electronAPI.updateTodos(todos);
  }
}

// Listen for todo notifications from the main process
if (window.electronAPI) {
  window.electronAPI.onTodoNotified((todo) => {
    // Update the notified todo in localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    todos = todos.map(item => {
      if (item.text === todo.text) {
        return todo;
      }
      return item;
    });

    localStorage.setItem('todos', JSON.stringify(todos));

    // Update UI
    checkScheduledTasks();
  });
}

function createTimeModal() {
    // Create modal container
    const modal = document.createElement('div');
    modal.classList.add('time-modal');
    modal.style.display = 'none';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Create datetime input
    const timeInput = document.createElement('input');
    timeInput.type = 'datetime-local';
    timeInput.classList.add('modal-datetime-input');

    // Create buttons container
    const btnContainer = document.createElement('div');
    btnContainer.classList.add('modal-buttons');

    // Create save button
    const saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.classList.add('modal-save-btn');
    saveBtn.addEventListener('click', saveTime);

    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.classList.add('modal-cancel-btn');
    cancelBtn.addEventListener('click', closeModal);

    // Assemble modal
    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);
    modalContent.appendChild(timeInput);
    modalContent.appendChild(btnContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

function openTimeModal(todoElement) {
    currentTodoElement = todoElement;
    const modal = document.querySelector('.time-modal');
    modal.style.display = 'flex';
}

async function closeModal() {
    const modal = document.querySelector('.time-modal');
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.add('exit')
    setTimeout(() => {
        modalContent.classList.remove('exit');
            modal.style.display = 'none';

        }, 300);
    currentTodoElement = null;
}

function saveTime() {
    if (!currentTodoElement) return;

    const timeInput = document.querySelector('.modal-datetime-input');
    const selectedDateTime = timeInput.value;

    if (selectedDateTime) {
        // Remove existing time display if any
        const existingTimeDisplay = currentTodoElement.querySelector('.time-display');
        if (existingTimeDisplay) {
            existingTimeDisplay.remove();
        }

        // Create new time display
        const timeDisplay = document.createElement('span');
        timeDisplay.classList.add('time-display');

        // Format the datetime for display
        const date = new Date(selectedDateTime);
        const formattedDate = date.toLocaleString();

        timeDisplay.innerText = `Due: ${formattedDate}`;
        // Find the time-container within the currentTodoElement
const timeContainer = currentTodoElement.querySelector('.time-container');
// Append the timeDisplay to the time-container instead
timeContainer.appendChild(timeDisplay);

        // Save to local storage
        saveTimeToLocal(currentTodoElement, selectedDateTime);
    }

    // Close the modal after saving
    closeModal();
    timeInput.value = '';
}

// Functions
function addToDo(event) {
    // Prevents form from submitting / Prevents form from reloading
    event.preventDefault();

    // toDo DIV
    const toDoDiv = document.createElement("div");
    toDoDiv.classList.add('todo');


    // Create LI
    const newToDo = document.createElement('li');
    if (toDoInput.value === '') {
        alert("You must write something!");
    } else {

        // Time btn
        const timeBtn = document.createElement('button');
timeBtn.innerHTML = '<i class="fas fa-clock" style="pointer-events: none; display: flex;align-items: center;justify-content: center">' +
    '<img src="../static/imgs/notifications_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Time" style="width: 24px; height: 24px; pointer-events: none;"></i>';
timeBtn.classList.add('time-btn');
toDoDiv.appendChild(timeBtn);

        newToDo.innerText = toDoInput.value;
        newToDo.classList.add('todo-item');
        toDoDiv.appendChild(newToDo);

        // Adding to local storage
        savelocal(toDoInput.value);

        const timeContainer = document.createElement('div');
        timeContainer.classList.add('time-container');
        toDoDiv.appendChild(timeContainer);

        // Check btn
        const checked = document.createElement('button');
        checked.innerHTML = '<i class="fas fa-check" style="pointer-events: none; display: flex;align-items: center;justify-content: center">' +
            '<img src="../static/imgs/check_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Time" style="width: 24px; height: 24px; pointer-events: none;"></i>';
        checked.classList.add('check-btn');
        toDoDiv.appendChild(checked);

        // Delete btn
        const deleted = document.createElement('button');
        deleted.innerHTML = '<i class="fas fa-trash" style="pointer-events: none; display: flex;align-items: center;justify-content: center">' +
            '<img src="../static/imgs/delete_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Time" style="width: 24px; height: 24px; pointer-events: none;"></i>';
        deleted.classList.add('delete-btn');
        toDoDiv.appendChild(deleted);

        // Append to list
        toDoList.appendChild(toDoDiv);

        // Clearing the input
        toDoInput.value = '';

        getTodos();
    }
}

function deletecheck(event) {
    const item = event.target;

    // Delete
    if (item.classList[0] === 'delete-btn') {
        item.parentElement.classList.add("fall");

        // Removing local todos
        removeLocalTodos(item.parentElement);

        item.parentElement.addEventListener('transitionend', function() {
            item.parentElement.remove();
        });
    }

    // Check
    if (item.classList[0] === 'check-btn') {
        item.parentElement.classList.toggle("completed");
    }

    // Time selection - open modal instead of adding input directly
    if (item.classList[0] === 'time-btn') {
        openTimeModal(item.parentElement);
    }
}

function savelocal(todo) {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    todos.push({
        text: todo,
        time: null,
        createdAt: Date.now() // Add timestamp
    });
    localStorage.setItem('todos', JSON.stringify(todos));

    // Update todos in Electron main process
    updateElectronTodos();
}

function getTodos() {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    // Handle old format and add missing properties
    todos = todos.map(todo => {
        if (typeof todo === 'string') {
            return { text: todo, time: null, createdAt: 0 };
        } else if (!todo.createdAt) {
            return { ...todo, createdAt: 0 };
        }
        return todo;
    }).sort((a, b) => a.createdAt - b.createdAt);

    // Save migrated data
    localStorage.setItem('todos', JSON.stringify(todos));

    // Clear existing todos display
    toDoList.innerHTML = '';

    // Group todos by date
    const todosByDate = {};

    todos.forEach(todo => {
        // Determine date to use for grouping (due date or creation date)
        let dateKey = 'No Date';
        let displayDate = 'Tasks without due date';

        if (todo.time && todo.time.dateTime) {
            const dueDate = new Date(todo.time.dateTime);
            dateKey = dueDate.toDateString();
            displayDate = dateKey;
        } else if (todo.createdAt) {
            const creationDate = new Date(todo.createdAt);
            dateKey = creationDate.toDateString();
            displayDate = dateKey;
        }

        // Create date group if it doesn't exist
        if (!todosByDate[dateKey]) {
            todosByDate[dateKey] = {
                displayDate: displayDate,
                todos: []
            };
        }

        todosByDate[dateKey].todos.push(todo);
    });

    // Sort date groups chronologically
    const sortedDateKeys = Object.keys(todosByDate).sort((a, b) => {
        if (a === 'No Date') return 1;
        if (b === 'No Date') return -1;
        return new Date(a) - new Date(b);
    });

    // Create and append date groups with todos
    sortedDateKeys.forEach(dateKey => {
        const dateGroup = todosByDate[dateKey];

        // Create date header
        const dateHeader = document.createElement('div');
        dateHeader.classList.add('date-header');
        dateHeader.textContent = dateGroup.displayDate;
        toDoList.appendChild(dateHeader);

        // Create container for this date's todos
        const dateContainer = document.createElement('div');
        dateContainer.classList.add('date-container');
        toDoList.appendChild(dateContainer);

        // Add todos to this date container
        dateGroup.todos.forEach(todo => {
            const toDoDiv = document.createElement("div");
            toDoDiv.classList.add("todo");

            // Time btn
            const timeBtn = document.createElement('button');
            timeBtn.innerHTML = '<i class="fas fa-clock" style="pointer-events: none; display: flex;align-items: center;justify-content: center">' +
                '<img src="../static/imgs/notifications_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Time" style="width: 24px; height: 24px; pointer-events: none;"></i>';
            timeBtn.classList.add('time-btn');
            toDoDiv.appendChild(timeBtn);

            const newToDo = document.createElement('li');
            newToDo.innerText = todo.text || todo;
            newToDo.classList.add('todo-item');
            toDoDiv.appendChild(newToDo);

            const timeContainer = document.createElement('div');
            timeContainer.classList.add('time-container');
            toDoDiv.appendChild(timeContainer);

            const checked = document.createElement('button');
            checked.innerHTML = '<i class="fas fa-check" style="pointer-events: none; display: flex;align-items: center;justify-content: center">' +
                '<img src="../static/imgs/check_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Time" style="width: 24px; height: 24px; pointer-events: none;"></i>';
            checked.classList.add("check-btn");
            toDoDiv.appendChild(checked);

            const deleted = document.createElement('button');
            deleted.innerHTML = '<i class="fas fa-trash" style="pointer-events: none; display: flex;align-items: center;justify-content: center">' +
                '<img src="../static/imgs/delete_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="Time" style="width: 24px; height: 24px; pointer-events: none;"></i>';
            deleted.classList.add("delete-btn");
            toDoDiv.appendChild(deleted);

            if (todo.time && todo.time.dateTime) {
                const timeDisplay = document.createElement('span');
                timeDisplay.classList.add('time-display');
                const date = new Date(todo.time.dateTime);
                const formattedDate = date.toLocaleString();
                timeDisplay.innerText = `Due: ${formattedDate}`;
                timeContainer.appendChild(timeDisplay);
            }

            dateContainer.appendChild(toDoDiv);
        });
    });
}

// Saving time selection to local storage
function saveTimeToLocal(todoElement, selectedDateTime) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    const todoText = todoElement.querySelector('.todo-item').innerText;

    // Find the matching todo item
    const todoIndex = todos.findIndex(item =>
        (item.text && item.text === todoText) || item === todoText
    );

    if (todoIndex !== -1) {
        // Handle both old and new storage format
        if (typeof todos[todoIndex] === 'string') {
            // Convert old format to new format
            todos[todoIndex] = {
                text: todos[todoIndex],
                time: { dateTime: selectedDateTime }
            };
        } else {
            // Update existing object
            todos[todoIndex].time = { dateTime: selectedDateTime };
        }

        localStorage.setItem('todos', JSON.stringify(todos));
    }
    updateElectronTodos();
}

function removeLocalTodos(todoElement) {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }

    const todoText = todoElement.querySelector('.todo-item').innerText;

    // Find the index of the todo item with matching text
    const todoIndex = todos.findIndex(item =>
        (item.text && item.text === todoText) || item === todoText
    );

    if (todoIndex !== -1) {
        todos.splice(todoIndex, 1);
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    updateElectronTodos();
}

document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        console.log("Notifications are supported");

        Notification.requestPermission().then(permission => {
            console.log("Permission status:", permission);

            if (permission === "granted") {
                try {
                    console.log("Attempting to send test notification");

                    // Start checking for scheduled tasks
                    checkScheduledTasks()
                    setInterval(checkScheduledTasks, 60000);
                } catch (error) {
                    console.error("Error sending notification:", error);
                }
            } else {
                console.log("Notification permission not granted");
            }
        }).catch(error => {
            console.error("Error requesting permission:", error);
        });
    } else {
        console.log("This browser does not support notifications");
    }
});

function checkScheduledTasks() {
    const now = new Date();
    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    todos.forEach(todo => {
    // Check for the correct property structure (todo.time.dateTime)
    if (todo.time && todo.time.dateTime) {
        const scheduledTime = new Date(todo.time.dateTime);
        const now = new Date();

        // Find the DOM element for this todo
        // Find all DOM elements for this todo (in case there are duplicates)
        const todoElements = document.querySelectorAll('.todo-item');

        todoElements.forEach(element => {
            if (element.textContent === todo.text) {
                const todoElement = element.parentElement; // Get the parent .todo div

                // If past due, add warning class
                if (now > scheduledTime) {
                    todoElement.classList.add('warning');
                } else {
                    // If not past due, remove warning class
                    todoElement.classList.remove('warning');
                }
            }
        });

        // Continue with notification logic outside the element loop
        if (now >= scheduledTime && !todo.notified) {
            sendNotification(todo.text);
            // Mark as notified
            todo.notified = true;
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    }
});
}

// Function to send a notification
function sendNotification(todoText) {
    if (Notification.permission === "granted") {
        const notification = new Notification("Todo Reminder", {
            body: todoText,
            icon: "../static/imgs/gpelogo.png"
        });

        notification.onclick = () => {
            window.electronAPI.focusApp();
        };
    }
}
function testNotification(){
    if (Notification.permission === "granted") {
        const notification = new Notification("Todo Reminder", {
            body: "Test",
            icon: "../static/imgs/gpelogo.png"
        });

        notification.onclick = () => {
            window.electronAPI.focusApp();
        };
    } else {
        console.log("Cannot send notification - permission not granted");
    }
}