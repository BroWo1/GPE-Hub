// renderer.js
console.log('Preload loaded')
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
            const query = document.getElementById('inputAI').value;
            const isChecked = sessionStorage.getItem("maxModeChecked") === "true";
            const model = isChecked ? 'qwen2.5-vl-72b-instruct' : 'qwen-omni-turbo';
            const mode = sessionStorage.getItem("mode") || "chatbot";
            let prompt1;

            if (mode === "translate") {
                prompt1 = "Translate the following text to English, if it is English, translate it to Chinese";
            } else {
                prompt1 = "You are a helpful assistant.";
            }
            const loading = document.createElement("div");
            loading.className = "load";
            document.body.appendChild(loading);
            try {
                if (window.electron) {
                    const response = await window.electron.chatGPTRequest(query, model, prompt1);

                    // Log the entire response to check its structure
                    console.log('Received response from server:', response);

                    // Since response is a string, directly set it
                    if (response) {
                        loading.className = "load exit";

                        document.getElementById('responseOutput').innerText = response;
                        setTimeout(() => {
                            loading.remove()
                        }, 300);

                    } else {
                        console.error('Received empty response');
                        document.getElementById('responseOutput').innerText = 'Error: No response received';
                    }
                } else {
                    console.error('Electron context is not available.');
                }
            } catch (error) {
                console.error('Error fetching response:', error);
            }
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (event) => {
        if (event.target && event.target.id === 'uploadBtn') {
            const isChecked = sessionStorage.getItem("maxModeChecked") === "true";
            const model = isChecked ? 'qwen2.5-vl-72b-instruct' : 'qwen-omni-turbo';

            // Capture the image from an <input type="file"> or from an <img> element
            const imageInput = document.getElementById('fileInput'); // Assuming you have an input to select image
            const file = imageInput.files[0];
            let imageBase64 = '';

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

                            // Display the response in the DOM
                            if (response) {
                                document.getElementById('responseOutput').innerText = response;
                            } else {
                                console.error('Received empty response');
                                document.getElementById('responseOutput').innerText = 'Error: No response received';
                            }
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

