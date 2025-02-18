function popup() {
    if(document.getElementById("popupContainer")) {
        return;
    }
    const popupContainer = document.createElement("div");

    popupContainer.innerHTML = `
    <div id="popupContainer">
        <p><strong>Rating Submitted</strong></p>        
        <div id="btn-container" style="padding-top: 0px">
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