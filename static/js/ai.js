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
    // Set initial state based on sessionStorage value
function updateMode() {
    var modeSelect = sessionStorage.getItem("mode") || "chatbot";
    console.log("Mode selected:", modeSelect);
    if (modeSelect === "chatbot") {
        chatbotButton.classList.add('active');
        translateButton.classList.remove('active');
    } else {
        translateButton.classList.add('active');
        chatbotButton.classList.remove('active');
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