
function popup() {
    if(document.getElementById("popupContainer")) {
        return;
    }
    const popupContainer = document.createElement("div");

    popupContainer.innerHTML = `
    <div id="popupContainer">
        <h1>Settings</h1>
        <h3>Max Mode</h3>
        <label class="switch" style="display: inline-block">
          <!-- Give the input an ID to target it from JavaScript -->
          <input type="checkbox" id="maxMode">
          <span class="slider"></span>
        </label>
        
        <div id="btn-container" style="padding-top: 20px">
            <button id="closeBtn" onclick="closePopup()">Close</button>
        </div>
    </div>
    `;
    const isChecked = sessionStorage.getItem("maxModeChecked") === "true";
    const maxModeSwitch = popupContainer.querySelector("#maxMode");
    maxModeSwitch.checked = isChecked;

    maxModeSwitch.addEventListener('change', function () {
        // Save the state when the switch is clicked
        sessionStorage.setItem("maxModeChecked", maxModeSwitch.checked);
        console.log("Max Mode is", maxModeSwitch.checked ? "enabled" : "disabled");
    });
    document.body.appendChild(popupContainer);
}

document.addEventListener("DOMContentLoaded", function (){
    var chatbotButton = document.getElementById('chatbot');
    var translateButton = document.getElementById('translate');
    var imageButton = document.getElementById('image');
    const input = document.getElementById('input');
    // Set initial state based on sessionStorage value
function updateMode() {
    var modeSelect = sessionStorage.getItem("mode") || "chatbot";
    console.log("Mode selected:", modeSelect);
    if (modeSelect === "chatbot") {
        chatbotButton.classList.add('active');
        translateButton.classList.remove('active');
        imageButton.classList.remove('active')
        input.innerHTML = `
        <label for="inputAI" style="font-size: 20px;"><strong>Input</strong></label>
            <textarea id="inputAI" rows="4" cols="50" class="input1"></textarea>
            <button class="rating-button" id="sendQueryButton">Send</button>
           
        `
    } else if (modeSelect === "translate") {
        translateButton.classList.add('active');
        chatbotButton.classList.remove('active');
        imageButton.classList.remove('active')

        input.innerHTML = `
        <label for="inputAI" style="font-size: 20px;"><strong>Input</strong></label>
            <textarea id="inputAI" rows="4" cols="50" class="input1"></textarea>
            <button class="rating-button" id="sendQueryButton">Send</button>
            `
    } else{
        imageButton.classList.add('active');
        chatbotButton.classList.remove('active');
        translateButton.classList.remove('active');
        input.innerHTML = `
        <label for="inputAI" style="font-size: 20px;"><strong>Input</strong></label><br>
        <input type="file" id="fileInput" class="upload"/><br>
        <button class="rating-button" id="uploadBtn">Upload</button>
        `
    }
}

// Initial update on page load
updateMode();

// Event listener for chatbot button
chatbotButton.addEventListener('click', function(event) {
    event.preventDefault();

    // Only update if the mode is different
    if (sessionStorage.getItem("mode") !== "chatbot") {
        sessionStorage.setItem("mode", "chatbot");
        updateMode(); // Update button states
    }
    console.log("Chatbot mode");
});

// Event listener for translate button
translateButton.addEventListener('click', function(event) {
    event.preventDefault();

    // Only update if the mode is different
    if (sessionStorage.getItem("mode") !== "translate") {
        sessionStorage.setItem("mode", "translate");
        updateMode(); // Update button states
    }
    console.log("Translate mode");
});

imageButton.addEventListener('click', function(event) {
   event.preventDefault();
   if (sessionStorage.getItem("mode") !== "image") {
       sessionStorage.setItem("mode", "image");
       updateMode();
   }
});
});





function closePopup() {
    const popupContainer = document.getElementById("popupContainer");
    if(popupContainer) {
        popupContainer.classList.add('exit');

        // After the exit animation duration (e.g., 0.5s), you can hide or remove the popup
        setTimeout(() => {
            popupContainer.remove()
        }, 300);
    }
}


function expend() {
    if(document.getElementById("response")) {
        return;
    }
    const response = document.createElement("div");
    var storedResponseMD = '';
    if(sessionStorage.getItem('responseMD') !== null){
        storedResponseMD = sessionStorage.getItem('responseMD');
    }

    response.innerHTML = `
    <div id="response">
        
        <div class="content">
            <p>${storedResponseMD}</p>
        </div>
        <div class="close">
            <button id="closeBtn" onclick="closeExpend()" >Close</button>
        </div>
    </div>
    `;
    const isChecked = sessionStorage.getItem("maxModeChecked") === "true";
    document.body.appendChild(response);
}

function closeExpend() {
    const response = document.getElementById("response");
    if(response) {
        response.classList.add('exit');

        // After the exit animation duration (e.g., 0.5s), you can hide or remove the popup
        setTimeout(() => {
            response.remove()
        }, 300);
    }
}