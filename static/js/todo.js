// Selectors
const toDoInput = document.querySelector('.todo-input');
const toDoBtn = document.querySelector('.todo-btn');
const toDoList = document.querySelector('.todo-list');
const aiBtn = document.querySelector('.aiBtn');
let todosText;

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
    modal.classList.add('exit');
    setTimeout(() => {
        modalContent.classList.remove('exit');
        modal.classList.remove('exit');
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

// Updated function to save completion status
function saveCompletionStatus(todoElement) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    const todoText = todoElement.querySelector('.todo-item').innerText;
    const isCompleted = todoElement.classList.contains('completed');

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
                time: null,
                completed: isCompleted,
                createdAt: Date.now() // Add timestamp since we don't have the original
            };
        } else {
            // Update existing object
            todos[todoIndex].completed = isCompleted;
        }

        localStorage.setItem('todos', JSON.stringify(todos));
    }
    updateElectronTodos();
}

// Update deletecheck function to save completion status
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
        // Save completion status to localStorage
        saveCompletionStatus(item.parentElement);
    }

    // Time selection - open modal instead of adding input directly
    if (item.classList[0] === 'time-btn') {
        openTimeModal(item.parentElement);
    }
}

// Update savelocal function to include completed property
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
        completed: false, // Initialize as not completed
        createdAt: Date.now() // Add timestamp
    });
    localStorage.setItem('todos', JSON.stringify(todos));

    // Update todos in Electron main process
    updateElectronTodos();
}

// Update getTodos function to apply the completed class
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
            return { text: todo, time: null, completed: false, createdAt: 0 };
        } else if (!todo.createdAt) {
            return { ...todo, createdAt: 0, completed: todo.completed || false };
        }
        return { ...todo, completed: todo.completed || false };
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

            // Apply completed class if the todo is marked as completed
            if (todo.completed) {
                toDoDiv.classList.add("completed");
            }

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
function exportTodosForAI() {
    // Get todos from localStorage
    const todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Initialize output string
    let output = "TO-DO ITEMS:\n\n";

    // Process each todo
    todos.forEach((todo, index) => {
        // Handle both old and new storage formats
        const todoText = todo.text || todo;

        // Start with the todo content
        output += `[Task ${index + 1}]\n`;
        output += `Name: ${todoText}\n`;

        // Add due date if available
        if (todo.time && todo.time.dateTime) {
            const dueDate = new Date(todo.time.dateTime);
            output += `Due: ${dueDate.toLocaleString()}\n`;
        } else {
            output += "Due: Not set\n";
        }

        // Add creation time
        if (todo.createdAt) {
            const creationDate = new Date(todo.createdAt);
            output += `Created: ${creationDate.toLocaleString()}\n`;
        } else {
            output += "Created: Unknown\n";
        }

        // Add completion status from the stored property
        const isCompleted = todo.completed || false;
        output += `Status: ${isCompleted ? 'Completed' : 'Not Completed'}\n\n`;
    });

    return output;
}

// Example usage:
// Add this to your aiBtn click handler or create a new function
function processWithAI() {
    todosText = exportTodosForAI();
    console.log(todosText); // For testing
    // Send todosText to your AI service
    // e.g., window.electronAPI.sendToAI(todosText);
}

aiBtn.addEventListener('click', processWithAI);
// Create chat window UI
function createChatWindow() {
    // Create window container
    const chatWindow = document.createElement('div');
    chatWindow.classList.add('ai-chat-window');
    chatWindow.style.display = 'none';

    // Create header
    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');
    chatHeader.innerHTML = '<span>AI Assistant</span>';

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('chat-close-btn');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', toggleChatWindow);
    chatHeader.appendChild(closeBtn);

    // Create messages container
    const chatMessages = document.createElement('div');
    chatMessages.classList.add('chat-messages');

    // Create input area
    const chatInputArea = document.createElement('div');
    chatInputArea.classList.add('chat-input-area');

    const chatInput = document.createElement('input');
    chatInput.classList.add('chat-input');
    chatInput.type = 'text';
    chatInput.placeholder = 'Ask me something...';

    const sendBtn = document.createElement('button');
    sendBtn.classList.add('chat-send-btn');
    sendBtn.id = 'sendQueryButton';
    sendBtn.innerHTML = '<img src="../static/imgs/send_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" alt="" width="22px" height="22px">';
    sendBtn.addEventListener('click', sendMessage);

    // Assemble chat window
    chatInputArea.appendChild(chatInput);
    chatInputArea.appendChild(sendBtn);
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputArea);

    // Add to body
    document.body.appendChild(chatWindow);

    // Allow Enter key to send message
    chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // Prevent default form submission
        e.preventDefault();
        // Find the send button and click it
        document.getElementById('sendQueryButton').click();
    }
});
}

// Toggle chat window visibility
function toggleChatWindow() {
    const chatWindow = document.querySelector('.ai-chat-window');
    const aiButton = document.querySelector('.aiBtn');

    if (chatWindow.style.display === 'none') {
        // Update todos text when opening
        todosText = exportTodosForAI();

        // Show welcome message
        const messages = document.querySelector('.chat-messages');
        //if (!messages.hasChildNodes()) {
            //addMessage('AI', 'Hello! I can help you manage your tasks. What would you like to know?');
        //}

        setTimeout(() => {
            // Show window with animation
        chatWindow.style.display = 'flex';
        chatWindow.classList.add('open');
        chatWindow.classList.add('on')
            setTimeout(() => {
            chatWindow.classList.remove('open');
        }, 300)
        }, 300)
        aiButton.classList.add('hidden');
    } else {
        // Hide window with animation

        chatWindow.classList.add('closing');

        setTimeout(() => {
            chatWindow.classList.remove('on')
            chatWindow.style.display = 'none';
            chatWindow.classList.remove('closing');
            aiButton.classList.remove('hidden');
        }, 300);
    }
}

// Send message to AI
function sendMessage() {
    const input = document.querySelector('.chat-input');
    const message = input.value.trim();

    if (!message) return;
    const messages = document.querySelector('.chat-messages');
    if (messages.hasChildNodes()) {
            messages.innerHTML = '';
        }

    // Add user message to chat
    addMessage('User', message);
    input.value = '';

    // Process with AI (simulated response for now)
    // In a real app, you would send the message to your AI service

    exportTodosForAI()
    const prompt = `You are a task management assistant, aiming the help the user with its todos. Here are the user's tasks: ${todosText}. Current time: ${new Date().toLocaleString()}.`;
    sessionStorage.setItem('prompt', prompt);
    sessionStorage.setItem('input', message)
    // Wait for AI response using polling
    const waitForAiResponse = () => {
        const aiResponse = sessionStorage.getItem('output');
        if (aiResponse) {
            // Response found, remove "Thinking..." message
            const messages = document.querySelector('.chat-messages');
            const thinkingMessage = messages.lastElementChild;
            if (thinkingMessage && thinkingMessage.querySelector('.message-text').textContent === 'Thinking...') {
                messages.removeChild(thinkingMessage);
            }

            // Add the actual AI response
            addMessage('AI', aiResponse);
            sessionStorage.removeItem('output'); // Clean up after use
            sessionStorage.removeItem('prompt')
            sessionStorage.removeItem('input')
        } else {
            // No response yet, check again after delay
            setTimeout(waitForAiResponse, 100); // Poll every 100ms
        }
    };

    // Add loading message
    addMessage('AI', 'Thinking...');
    // Start polling for response
    waitForAiResponse();
    // If using electronAPI:
    // window.electronAPI.sendToAI({ userMessage: message, todoData: todosText })
    //    .then(response => addMessage('AI', response));
}

// Add message to chat
function addMessage(sender, text) {
    const messages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender.toLowerCase() === 'user' ? 'user-message' : 'ai-message');

    const messageSender = document.createElement('div');
    messageSender.classList.add('message-sender');
    messageSender.textContent = sender;

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerHTML = text;

    messageDiv.appendChild(messageSender);
    messageDiv.appendChild(messageText);
    messages.appendChild(messageDiv);

    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}

// Helper to count todos
function countTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    return todos.length;
}

// Initialize chat UI and update event listeners
document.addEventListener('DOMContentLoaded', () => {
    createChatWindow();
    // Replace the AI button click handler
    aiBtn.removeEventListener('click', processWithAI);
    aiBtn.addEventListener('click', toggleChatWindow);
});