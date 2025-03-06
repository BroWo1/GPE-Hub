// renderer.js
console.log('Preload loaded')   

// No need to access i18next directly
// const i18next = window.i18next  <- Remove this line

// Create translation functions that use the IPC bridge
const i18n = {
  changeLanguage: async (language) => {
    // This would need to be implemented in the main process and exposed
    // For now, we'll just store the language preference
    localStorage.setItem('selectedLanguage', language);
    updateUIWithTranslation();
  },
  t: async (key) => {
    return await window.electron.translate(key);
  }
};

window.onload = async () => {
    // Get the current language from the main process
    const language = await window.electron.getLanguage();
    
    // Update UI with translations
    updateUIWithTranslation();
};
  
async function updateUIWithTranslation() {
  // Get elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(async element => {
    const key = element.getAttribute('data-i18n');
    const translation = await window.electron.translate(key);
    if (translation) {
      element.textContent = translation;
    }
  });
  
  // For specific elements that need direct translation
  if (document.getElementById('someElement')) {
    const translation = await window.electron.translate('someKey');
    document.getElementById('someElement').innerText = translation;
  }
}
  
// Example of how to dynamically change the language
if (document.getElementById('changeLanguageButton')) {
  document.getElementById('changeLanguageButton').addEventListener('click', async () => {
    const newLang = 'fr'; // For example, change to French
    
    // You would need to implement this in the main process
    // For now, just update the local storage and UI
    localStorage.setItem('selectedLanguage', newLang);
    await updateUIWithTranslation();
  });
}

window.addEventListener('DOMContentLoaded', () => {
    const externalElements = document.querySelectorAll('[data-external-link]');

    externalElements.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();

            const url = element.getAttribute('data-external-link');
            console.log('Clicked element; window.electronAPI:', window.electronAPI);

            if (url) {
                // Log the function reference before calling it
                console.log('openExternalLink exists?', typeof window.electronAPI.openExternalLink);
                window.electronAPI.openExternalLink(url);
            } else {
                console.warn('No URL found for this element.');
            }
        });
    });
});

// Fetch the items from the server (via IPC)
async function fetchItems() {
    try {
        const items = await window.electron.fetchItems(); // Call the main process through IPC
        displayItems(items);
    } catch (error) {
        console.error('Error fetching items:', error);
    }
}

// Display the items with average ratings out of 10 (rounded to the nearest tenth)
function displayItems(items) {
    const itemListDiv = document.getElementById('item-list');
    itemListDiv.innerHTML = ''; // Clear previous items

    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');  // Add the card class here
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Rating: ${item.averageRating}/10</p>
            <p>Numbers of rating: ${item.numRaters}</p>
            <label for="rating">Rate (1-10): </label>
            <input type="number" id="rating-${item.id}" class="rating-input" min="1" max="10" />
            <button onclick="submitRating(${item.id}); popup();" class="rating-button">Submit</button>
        `;
        itemListDiv.appendChild(itemDiv);
    });
}

// Send the rating to the server (via IPC)
async function submitRating(itemId) {
    const ratingInput = document.getElementById(`rating-${itemId}`);
    const rating = parseInt(ratingInput.value);

    if (rating >= 1 && rating <= 10) {
        try {
            const response = await window.electron.submitRating(itemId, rating); // Call the main process through IPC
            //alert(response.message);
            fetchItems(); // Refresh the item list with updated ratings
        } catch (error) {
            console.error('Error submitting rating:', error);
            //alert('You can only rate an item once!');
        }
    } else {
        //alert('Please enter a rating between 1 and 10.');
    }
}

// Fetch items on page load
fetchItems();

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'sendQueryButton') {
            let query;
            const isChecked = sessionStorage.getItem("maxModeChecked") === "true";
            const model = isChecked ? 'qwen-vl-max' : 'qwen-omni-turbo';
            let mode = sessionStorage.getItem("mode") || "chatbot";
            if (document.title === "GPE Hub"){
                mode = "search";
            }else if (document.title === "ToDo List"){
                mode = "todo";
            }
            if (document.title !== "ToDo List"){
                query = document.getElementById('inputAI').value
            }
            let prompt1;
            if (mode === "translate") {
                prompt1 = "Translate the following text to English, if it is English, translate it to Chinese";
            } else if(mode === "chatbot") {
                prompt1 = "You are a helpful assistant.";
            }else if(mode === "todo"){
                prompt1 = sessionStorage.getItem("prompt");
                query = sessionStorage.getItem("input")
            }
            else{
                prompt1 = "You are an assistant to help the user navigate through the GPEHub or answer any other questions that can be unrelated to the club. Here is some knowledge about the GPE club that created this software:" +
                    " GPE club is a club founded by Tsinghua International School students Will and Andy, also containing other members such as Andrew and Jeffrey, aiming to help the THIS students with their studies. " +
                    "The GPEHub contains features such as AI Toolbox, SAT Vocabulary Practices, and Sticky Notes."
            }
            console.log(query)
            const loading = document.createElement("div");
            loading.className = "load";
            const spinner = document.createElement("div");
            spinner.className = "spinner";
            loading.appendChild(spinner);
            document.body.appendChild(loading);

            try {
                if (window.electron) {
                    const response = await window.electron.chatGPTRequest(query, model, prompt1);

                    // Log the entire response to check its structure
                    console.log('Received response from server:', response);
                    const responseMD = await window.electronAPI.convertMarkdown(response);
                    sessionStorage.setItem('responseMD', responseMD);
                    // Since response is a string, directly set it

                    if (response) {
                        const element = document.querySelector('.response-box');
                        console.log(element);
                        if (element) {
                          element.style.display = 'block';
                          console.log('displayed')
                        }
                        if (mode === "todo"){
                            sessionStorage.setItem("output", responseMD)
                        }else{
                            document.getElementById('responseOutput').innerHTML = responseMD;
                            MathJax.typesetPromise([document.getElementById('responseOutput')])
                            .catch(err => console.error("MathJax typeset failed: ", err));
                        }
                    } else {
                        console.error('Received empty response');
                        document.getElementById('responseOutput').innerHTML = 'Error: No response received';
                    }
                } else {
                    console.error('Electron context is not available.');
                }
            } catch (error) {
                console.error('Error fetching response:', error);
            }
            loading.className = "load exit";
                            setTimeout(() => {
                                loading.remove()
                            }, 300);
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'uploadBtn') {
            const isChecked = sessionStorage.getItem("maxModeChecked") === "true";
            const model = isChecked ? 'qwen-vl-max' : 'qwen-omni-turbo';

            // Capture the image from an <input type="file"> or from an <img> element
            const imageInput = document.getElementById('fileInput'); // Assuming you have an input to select image
            const file = imageInput.files[0];
            let imageBase64 = '';

            const loading = document.createElement("div");
            loading.className = "load";
            const spinner = document.createElement("div");
            spinner.className = "spinner";
            loading.appendChild(spinner);
            document.body.appendChild(loading);

            if (file) {
                // Convert image to base64 string
                const reader = new FileReader();
                reader.onloadend = async () => {
                    imageBase64 = reader.result.split(',')[1]; // Extract Base64 string

                    try {
                        if (window.electron) {
                            console.log(imageBase64.length); // Log the length of the Base64 string

                            const response = await window.electron.imageRequest(model, imageBase64);

                            // Log the entire response to check its structure
                            console.log('Received response from server:', response);
                            const responseMD = await window.electronAPI.convertMarkdown(response);
                            sessionStorage.setItem('responseMD', responseMD);
                            // Display the response in the DOM
                            if (response) {
                                document.getElementById('responseOutput').innerHTML = responseMD;
                                MathJax.typesetPromise([document.getElementById('responseOutput')])
                        .catch(err => console.error("MathJax typeset failed: ", err));
                            } else {
                                console.error('Received empty response');
                                document.getElementById('responseOutput').innerHTML = 'Error: No response received';
                            }
                            loading.className = "load exit";
                            setTimeout(() => {
                                loading.remove()
                            }, 300);
                        } else {
                            console.error('Electron context is not available.');
                        }
                    } catch (error) {
                        console.error('Error fetching response:', error);
                    }
                };
                reader.readAsDataURL(file); // Read the image file as Data URL
            }
        }
    });
});

// Combined tilt effects for both cards and sidebar
document.addEventListener('DOMContentLoaded', () => {
    // Apply tilt effect to cards
    applyCardTiltEffect();

    // Apply tilt effect to sidebar
    applySidebarTiltEffect();
});

function applyCardTiltEffect() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            setTimeout(() => {
                this.style.transition = 'none';
            }, 300);
        });

        card.addEventListener('mousemove', function(e) {
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

        card.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, background 0.3s ease, border 0.3s ease';
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            this.style.boxShadow = '2px 4px 6px rgba(0, 0, 0, 0.3)';
        });
    });
}

function applySidebarTiltEffect() {
    const sidebar = document.querySelector('.sidebar');

    if (!sidebar) return;

    // Add CSS styles needed for 3D effect
    sidebar.style.transformStyle = 'preserve-3d';
    sidebar.style.willChange = 'transform, box-shadow';

    // Store original transition value to restore it on mouseleave
    const originalTransition = getComputedStyle(sidebar).transition;

    sidebar.addEventListener('mouseenter', function(e) {
        // Keep the original transition for width to maintain the expansion effect
        const widthTransition = 'width 0.3s ease 0.3s, border-radius 0.3s ease 0.3s';
        this.style.transition = `${widthTransition}, transform 0.3s ease, box-shadow 0.3s ease`;

        // Get all nav items and apply the translateZ to make them pop out
        const navItems = this.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.style.transform = 'translateZ(5px)';
        });

        setTimeout(() => {
            // Keep transitions for width/border-radius only, remove for transform
            this.style.transition = widthTransition;
        }, 300);
    });

    sidebar.addEventListener('mousemove', function(e) {
        // Only apply the effect if we're not in the expanded width transition
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Use very subtle rotation for sidebar - much less than cards
        const rotateY = mouseX * 0.08;
        const rotateX = -mouseY * 0.025;

        // Apply transform without affecting width transition
        this.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Enhanced shadow with subtle glow
        const shadowX = mouseX * 0.03;
        const shadowY = mouseY * 0.02;
        this.style.boxShadow = `
            ${shadowX}px ${shadowY}px 10px rgba(0, 0, 0, 0.15),
            0 0 8px rgba(255, 255, 255, 0.5)
        `;
    });

    sidebar.addEventListener('mouseleave', function() {
        // Restore original transition with added transform transition
        this.style.transition = `${originalTransition}, transform 0.5s ease, box-shadow 0.5s ease`;
        this.style.transform = 'perspective(1500px) rotateX(0) rotateY(0)';
        this.style.boxShadow = '2px 4px 6px rgba(0, 0, 0, 0.3)';

        // Restore nav items
        const navItems = this.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.style.transform = '';
        });
    });
}