/*************************************************************************
 * Create Note Popup Logic
 **************************************************************************/

function popup() {

    const popupContainer = document.createElement("div");

    popupContainer.innerHTML = `
    <div id="popupContainer">
        <h1>New Note</h1>
        <textarea id="note-text" placeholder="Enter your note..."></textarea>
        <div id="btn-container">
            <button id="submitBtn" onclick="createNote()">Create Note</button>
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

function createNote() {

    const popupContainer = document.getElementById('popupContainer');
    const noteText = document.getElementById('note-text').value;
    if (noteText.trim() !== '') {
        const note = {
        id: new Date().getTime(),
        text: noteText
        };

        const existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
        existingNotes.push(note);

        localStorage.setItem('notes', JSON.stringify(existingNotes));

        document.getElementById('note-text').value = '';

        popupContainer.classList.add('exit');

        // After the exit animation duration (e.g., 0.5s), you can hide or remove the popup
        setTimeout(() => {
            popupContainer.remove()
        }, 300);
        displayNotes();
    }
}


/*************************************************************************
 * Display Notes Logic
 **************************************************************************/

function displayNotes() {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.forEach(note => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
        <span>${note.text}</span>
        <div id="noteBtns-container">
            <button id="editBtn" onclick="editNote(${note.id})"><i class="fa-solid fa-pen">
            <img src="../static/imgs/edit_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" width="24" height="24" />
</i></button>
            <button id="deleteBtn" onclick="deleteNote(${note.id})"><i class="fa-solid fa-trash">
            <img src="../static/imgs/delete_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" width="24" height="24" />
</i></button>
        </div>
        `;
        notesList.appendChild(listItem);
    });

    applyNoteTiltEffect()
}


/*************************************************************************
 * Edit Note Popup Logic
 **************************************************************************/

function editNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToEdit = notes.find(note => note.id == noteId);
    const noteText = noteToEdit ? noteToEdit.text : '';
    const editingPopup = document.createElement("div");

    editingPopup.innerHTML = `
    <div id="editing-container" data-note-id="${noteId}">
        <h1>Edit Note</h1>
        <textarea id="note-text">${noteText}</textarea>
        <div id="btn-container">
            <button id="submitBtn" onclick="updateNote()">Done</button>
            <button id="closeBtn" onclick="closeEditPopup()">Cancel</button>
        </div>
    </div>
    `;

    document.body.appendChild(editingPopup);
}

function closeEditPopup() {
    const editingPopup = document.getElementById("editing-container");

    if(editingPopup) {
        editingPopup.classList.add('exit');

        // After the exit animation duration (e.g., 0.5s), you can hide or remove the popup
        setTimeout(() => {
            editingPopup.remove()
        }, 300);
    }
}

function updateNote() {
    const noteText = document.getElementById('note-text').value.trim();
    const editingPopup = document.getElementById('editing-container');

    if (noteText !== '') {
        const noteId = editingPopup.getAttribute('data-note-id');
        let notes = JSON.parse(localStorage.getItem('notes')) || [];

        // Find the note to update
        const updatedNotes = notes.map(note => {
            if (note.id == noteId) {
                return { id: note.id, text: noteText };
            }
            return note;
        });

        // Update the notes in local storage
        localStorage.setItem('notes', JSON.stringify(updatedNotes));

        // Close the editing popup
        editingPopup.classList.add('exit');

        // After the exit animation duration (e.g., 0.5s), you can hide or remove the popup
        setTimeout(() => {
            editingPopup.remove()
        }, 300);

        // Refresh the displayed notes
        displayNotes();
    }
}

/*************************************************************************
 * Delete Note Logic
 **************************************************************************/

function deleteNote(noteId) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(note => note.id !== noteId);

    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

displayNotes();

function applyNoteTiltEffect() {
    const notes = document.querySelectorAll('#notes-list li');

    notes.forEach(note => {
        // Apply 3D properties
        note.style.transformStyle = 'preserve-3d';
        note.style.willChange = 'transform, box-shadow';

        note.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            setTimeout(() => {
                this.style.transition = 'none';
            }, 300);
        });

        note.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateY = mouseX * 0.05;
            const rotateX = -mouseY * 0.05;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

            const shadowX = mouseX * 0.05;
            const shadowY = mouseY * 0.05;
            this.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.2), 
                                   0 8px 20px rgba(0, 0, 0, 0.15), 
                                   0 0 10px rgba(255, 255, 255, 0.5)`;
        });

        note.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, background 0.3s ease, border 0.3s ease';
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            this.style.boxShadow = '2px 4px 6px rgba(0, 0, 0, 0.3)';
        });
    });
}