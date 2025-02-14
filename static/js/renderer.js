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
            <button onclick="submitRating(${item.id})" class="rating-button">Submit</button>
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
            alert(response.message);
            fetchItems(); // Refresh the item list with updated ratings
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('You can only rate an item once!');
        }
    } else {
        alert('Please enter a rating between 1 and 10.');
    }
}

// Fetch items on page load
fetchItems();

