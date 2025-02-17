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
          <input type="checkbox" id="devToolsSwitch">
          <span class="slider"></span>
        </label>
        
        <div id="btn-container"style="padding-top: 20px">
            <button id="closeBtn" onclick="closePopup()">Close</button>
        </div>
    </div>
    `;
    document.body.appendChild(popupContainer);
}

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