//alert(set_path);

const urlParams = new URLSearchParams(window.location.search);
const selectedOption = urlParams.get("set") || "1";
const set_name = selectedOption;
document.addEventListener("DOMContentLoaded", function () {
      // Check for the 'option' parameter in the URL, default to "1" if not found
      const urlParams = new URLSearchParams(window.location.search);
      const selectedOption = urlParams.get("set") || "1";

      // Update the dropdown toggle to display the current selection
      const dropdownToggle = document.getElementById("dropdown-toggle");
      dropdownToggle.textContent = "Vocab Set " + selectedOption;

      // Generate dropdown items from 1 to 33
      const menu = document.getElementById("dropdown-menu");
      for (let i = 1; i <= 33; i++) {
        const li = document.createElement("li");
        li.className = "dropdown-item";
        li.textContent = "Set " + i;

        // When an item is clicked, reload the page with the option parameter
        li.addEventListener("click", function (event) {
          event.preventDefault();
          window.location.href = window.location.pathname + "?set=" + i;

        });

        menu.appendChild(li);
      }
    });




document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
});
var knownWords = [];
var unknownWords = [];
var viewed = [];

let vocabData = [];  // Initialize as an array
async function loadKnownWords() {
    let knownWords = [];
    const knownWordsCookie = await getCookie('knownWords');

    if (knownWordsCookie !== null && Array.isArray(knownWordsCookie)) {
        knownWords = knownWordsCookie;
        console.log('Loaded known words from cookie:', knownWords);
    } else {
        console.log('No valid cookie value found, using empty array');
    }

    return knownWords;
}

async function loadUnknownWords() {
    let unknownWords = [];
    const unknownWordsCookie = await getCookie('unknownWords');

    if (unknownWordsCookie !== null && Array.isArray(unknownWordsCookie)) {
        unknownWords = unknownWordsCookie;
        console.log('Loaded unknown words from cookie:', unknownWords);
    } else {
        console.log('No valid cookie value found, using empty array');
    }

    return unknownWords;
}


// Example usage:

loadUnknownWords().then(unknownWords1 => {
    console.log('Unknown Words:', unknownWords1);  // Logs the unknown words
    unknownWords = unknownWords1
});


// Example usage:

loadKnownWords().then(knownWords1 => {
    console.log('Known Words:', knownWords1);  // Logs the known words
    knownWords = knownWords1
});

console.log(unknownWords);

/*
function setCookie(name, value) {
    const cookieName = `${name}_${set_name}`;
    document.cookie = cookieName + "=" + (value || "") + "; path=/";
}
function getCookie(name) {
    const cookieName = `${name}_${set_name}`;
    const nameEQ = cookieName + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
*/


async function setCookie(name, value) {
    name= name+set_name
    await window.electron.setCookie(name, value);  // Call the exposed method from preload
}

async function getCookie(name) {
    name = name+set_name
    try {
        // Use await to get the resolved value from the main process
        const value = await window.electron.getCookie(name);

        if (value !== null) {
            console.log('Cookie value:', value);  // Log the cookie value
            // If the cookie value is a JSON string, parse it
            try {
                return JSON.parse(value);  // If the value is a stringified JSON, parse it
            } catch (err) {
                // If it's not a JSON string, return the raw value
                console.log('Value is not a valid JSON string:', value);
                return value;
            }
        } else {
            console.log('Cookie not found');
            return null;  // Return null if the cookie is not found
        }
    } catch (error) {
        console.error('Error retrieving cookie:', error);
        return null;  // Return null if an error occurs
    }
}

function setCookieSingle(name, value) {
    const cookieName = `${name}_${set_name}`;
    document.cookie = cookieName + "=" + value.toString() + "; path=/";
}
function getCookieSingle(name) {
    const cookieName = `${name}_${set_name}`;
    const nameEQ = cookieName + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return parseInt(c.substring(nameEQ.length, c.length), 10);
    }
    return null;
}

function fetchData() {
    // Path to the local JSON file
    const urlParams = new URLSearchParams(window.location.search);
      const selectedOption = urlParams.get("set") || "1";
    const filePath = '../static/vocab/set'+selectedOption+'.json'; // Adjust the path based on your setup

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Vocabulary Data Loaded:', data); // Debugging statement
            // Convert the dictionary to an array of objects
            for (let word in data) {
                if (data.hasOwnProperty(word)) {
                    data[word].forEach(entry => {
                        vocabData.push({
                            word: word,
                            partOfSpeech: entry[0],
                            definition: entry[1].trim()
                        });
                    });
                }
            }
            console.log('Processed Vocab Data:', vocabData); // Debugging statement
            if (vocabData.length > 0) {
                displayFlashcard(0);
            } else {
                console.warn('vocabData is empty.');
                displayFlashcard(0);
            }
        })
        .catch(error => {
            console.error('Error loading vocabulary data:', error);
            const front = document.getElementById('front');
            if (front) {
                front.textContent = 'Error loading vocabulary data.';
            }
        });
}


function setupEventListeners() {
    const flashcard = document.getElementById('flashcard');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const known = document.getElementById('known');
    const unknown = document.getElementById('unknown');
    const random = document.getElementById('random');
    const practiceUnknown = document.getElementById('practiceUnknown');
    const clear = document.getElementById('clear');
    const toastLiveExample = document.getElementById('liveToast');

    let modeUnknown = practiceUnknown.checked;
    let israndom = random.checked;
    let currentIndex = 0;
    let unknownIndex = 0;
    let Index = 0;

    // Apply tilt effect
    applyFlashcardTiltEffect();

    // Set up checkbox event listeners
    random.addEventListener('change', () => {
        israndom = random.checked;
    });

    practiceUnknown.addEventListener('change', () => {
        modeUnknown = practiceUnknown.checked;
    });

    // Card flip on click
    flashcard.addEventListener('click', () => {
        console.log('clicked');
        flashcard.classList.toggle('flipped');
    });

    // Keyboard controls
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            flashcard.classList.toggle('flipped');
        }
        if (event.code === 'ArrowLeft') {
            prevBtn.click();
        }
        if (event.code === 'ArrowRight') {
            nextBtn.click();
        }
        if (event.code === 'Digit1'){
            known.click();
        }
        if (event.code === 'Digit2'){
            unknown.click();
        }
    });

    // Clear data button
    clear.addEventListener('click', () => {
        knownWords = [];
        unknownWords = [];
        setCookie('knownWords', JSON.stringify(knownWords));
        setCookie('unknownWords', JSON.stringify(unknownWords));
        getNum();
    });

    // Previous button with improved animation
    prevBtn.addEventListener('click', () => {
        const flashcard = document.getElementById('flashcard');

        // Disable tilt before slide animation
        flashcard.tiltActive = false;

        // Add a reverse slide-out animation
        flashcard.style.transform = 'translateX(100%)';
        flashcard.style.opacity = '0';

        setTimeout(() => {
            // Update card content here
            if (!israndom) {
                if (currentIndex > 0) {
                    currentIndex--;
                    displayFlashcard(currentIndex);
                } else {
                    alert('This is the first flashcard.');
                    // Reset the card position without animation
                    flashcard.style.transition = 'none';
                    flashcard.style.transform = '';
                    flashcard.style.opacity = '1';
                    setTimeout(() => {
                        flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                    }, 10);
                    return;
                }
            } else {
                if (!modeUnknown) {
                    if (viewed.length > 0) {
                        viewed.pop();
                        currentIndex = viewed[viewed.length - 1];
                        displayFlashcard(currentIndex);
                    } else {
                        alert('This is the first flashcard.');
                        // Reset the card position without animation
                        flashcard.style.transition = 'none';
                        flashcard.style.transform = '';
                        flashcard.style.opacity = '1';
                        setTimeout(() => {
                            flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                        }, 10);
                        return;
                    }
                } else {
                    if (unknownIndex > 0) {
                        unknownIndex--;
                        displayFlashcard(unknownWords[unknownIndex]);
                    } else {
                        alert('This is the first flashcard.');
                        // Reset the card position without animation
                        flashcard.style.transition = 'none';
                        flashcard.style.transform = '';
                        flashcard.style.opacity = '1';
                        setTimeout(() => {
                            flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                        }, 10);
                        return;
                    }
                }
            }

            // Prepare for slide-in from the opposite direction
            flashcard.style.transition = 'none';
            flashcard.style.transform = 'translateX(-100%)';

            // Small delay for the browser to recognize the style change
            setTimeout(() => {
                // Animate back to normal position
                flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                flashcard.style.transform = '';
                flashcard.style.opacity = '1';
            }, 10);
        }, 250); // This should match the duration of the slide animation
    });

    // Next button with improved animation
    // Updated next button handler to match the previous button's style
nextBtn.addEventListener('click', () => {
    const flashcard = document.getElementById('flashcard');

    // Disable tilt before slide animation
    flashcard.tiltActive = false;

    // Add slide-out animation - direct style manipulation like in prevBtn
    flashcard.style.transform = 'translateX(-100%)';
    flashcard.style.opacity = '0';

    setTimeout(() => {
        // Update card content here
        if (!israndom) {
            if (!modeUnknown) {
                if (currentIndex < vocabData.length - 1) {
                    currentIndex++;
                    if (knownWords !== null) {
                        while (knownWords.includes(currentIndex) && currentIndex < vocabData.length - 1) {
                            currentIndex++;
                        }
                    }
                    displayFlashcard(currentIndex);
                } else {
                    alert('You have reached the last flashcard.');
                    // Reset the card position without animation
                    flashcard.style.transition = 'none';
                    flashcard.style.transform = '';
                    flashcard.style.opacity = '1';
                    setTimeout(() => {
                        flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                    }, 10);
                    return;
                }
            } else {
                if (unknownIndex < unknownWords.length - 1) {
                    unknownIndex++;
                    displayFlashcard(unknownWords[unknownIndex]);
                } else {
                    alert('You have reached the last flashcard.');
                    // Reset the card position without animation
                    flashcard.style.transition = 'none';
                    flashcard.style.transform = '';
                    flashcard.style.opacity = '1';
                    setTimeout(() => {
                        flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                    }, 10);
                    return;
                }
            }
        } else {
            if (!modeUnknown) {
                currentIndex = Math.floor(Math.random() * vocabData.length);
                if (knownWords !== null) {
                    let attempts = 0;
                    while (knownWords.includes(currentIndex) && attempts < 100) {
                        currentIndex = Math.floor(Math.random() * vocabData.length);
                        attempts++;
                    }
                }
                displayFlashcard(currentIndex);
                viewed.push(currentIndex);
            } else {
                if (unknownWords.length > 0) {
                    unknownIndex = Math.floor(Math.random() * unknownWords.length);
                    displayFlashcard(unknownWords[unknownIndex]);
                    viewed.push(unknownWords[unknownIndex]);
                } else {
                    alert('No unknown words to practice.');
                    // Reset the card position without animation
                    flashcard.style.transition = 'none';
                    flashcard.style.transform = '';
                    flashcard.style.opacity = '1';
                    setTimeout(() => {
                        flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
                    }, 10);
                    return;
                }
            }
        }

        // Prepare for slide-in from the opposite direction
        flashcard.style.transition = 'none';
        flashcard.style.transform = 'translateX(100%)';

        // Small delay for the browser to recognize the style change
        setTimeout(() => {
            // Animate back to normal position
            flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
            flashcard.style.transform = '';
            flashcard.style.opacity = '1';
        }, 10);
    }, 250); // This should match the duration of the slide animation
});

    // Known and unknown buttons
    known.addEventListener('click', () => {
        if(!modeUnknown){
            Index = currentIndex;
        }else{
            Index = unknownIndex;
        }
        if(!knownWords.includes(Index)){
            knownWords.push(Index);
            console.log(knownWords);
            setCookie('knownWords', JSON.stringify(knownWords));
            if(unknownWords !== null && unknownWords.includes(Index)){
                unknownWords = unknownWords.filter(index => index !== Index);
                setCookie('unknownWords', JSON.stringify(unknownWords));
            }
        }
        getNum();
        displayProgress();
    });

    unknown.addEventListener('click', () => {
        if(!unknownWords.includes(currentIndex) && !modeUnknown){
            unknownWords.push(currentIndex);
            console.log(unknownWords);
            setCookie('unknownWords', JSON.stringify(unknownWords));
            if(knownWords !== null && knownWords.includes(currentIndex)){
                knownWords = knownWords.filter(index => index !== currentIndex);
                setCookie('knownWords', JSON.stringify(knownWords));
            }
        }
        getNum();
    });
}
function displayProgress(){
        const progress = document.getElementById(`progress`);
        const progressInfo = document.getElementById(`progressInfo`);
        const progressBar = document.querySelector('.progress-bar');
        let percentage = Math.round((knownWords.length / vocabData.length) * 100);
        progress.innerText = percentage.toString() + '%';
        progressBar.style.width = percentage.toString() + '%';
        progressInfo.innerText = 'Progress: ' + knownWords.length.toString() + '/' + vocabData.length.toString() + ' words known';
    }

function displayFlashcard(index) {
    displayProgress()
    const front = document.getElementById('front');
    const back = document.getElementById('back');

    console.log(`Displaying flashcard at index: ${index}`);

    if (!vocabData || vocabData.length === 0) {
        front.textContent = 'No vocabulary data available.';
        back.textContent = '';
        return;
    }

    if (index < 0 || index >= vocabData.length) {
        front.textContent = 'Index out of bounds.';
        back.textContent = '';
        return;
    }

    const vocab = vocabData[index];
    console.log(`Current Word: ${vocab.word}, Part of Speech: ${vocab.partOfSpeech}`);
    front.textContent = `${vocab.word} (${vocab.partOfSpeech})`;
    back.textContent = vocab.definition;

    getNum();
    // Ensure the card is not flipped when displaying a new card
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');
}

function getNum(){
    const numKnown = document.getElementById('numKnown');
    const numUnknown = document.getElementById('numUnknown');
    numKnown.textContent = 'Known words count: ' + knownWords.length.toString();
    numUnknown.textContent = 'Unknown words count: ' + unknownWords.length.toString();
}

function applyFlashcardTiltEffect() {
    const flashcard = document.getElementById('flashcard');

    if (!flashcard) return;

    // Set up custom properties to track tilt state
    flashcard.tiltActive = false;
    flashcard.lastRotateX = 0;
    flashcard.lastRotateY = 0;

    // Use this function to apply combined transforms while preserving slide animations
    function applyTransforms(element, transforms) {
        // Check if element has slide animation classes
        const isSlideOut = element.classList.contains('slide-out');
        const isSlideIn = element.classList.contains('slide-in');
        const isSlideInActive = element.classList.contains('slide-in-active');

        // If we're in a slide animation, don't apply tilt transforms
        if (isSlideOut || isSlideIn || isSlideInActive) {
            return;
        }

        // Apply rotation transforms for tilt
        if (transforms.rotateX !== undefined && transforms.rotateY !== undefined) {
            element.style.transform = `perspective(1200px) rotateX(${transforms.rotateX}deg) rotateY(${transforms.rotateY}deg)`;
        } else {
            element.style.transform = '';
        }
    }

    flashcard.addEventListener('mouseenter', function() {
        // Only enable tilt if not in animation
        if (!this.classList.contains('slide-in') &&
            !this.classList.contains('slide-out') &&
            !this.classList.contains('slide-in-active')) {

            this.tiltActive = true;

            // Smooth entry animation
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            setTimeout(() => {
                if (this.tiltActive) {
                    this.style.transition = 'none';  // Remove transition for smooth movement
                }
            }, 300);
        }
    });

    flashcard.addEventListener('mousemove', function(e) {
        // Skip tilt if card is currently animating or tilt is not active
        if (!this.tiltActive ||
            this.classList.contains('slide-in') ||
            this.classList.contains('slide-out') ||
            this.classList.contains('slide-in-active')) {
            return;
        }

        // Calculate center point of the card
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Get mouse position relative to center
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation (less intense than regular cards)
        const rotateY = mouseX * 0.03;
        const rotateX = -mouseY * 0.03;

        // Store current rotation values
        this.lastRotateX = rotateX;
        this.lastRotateY = rotateY;

        // Apply tilt effect
        applyTransforms(this, {
            rotateX: rotateX,
            rotateY: rotateY
        });

        // Dynamic shadow based on tilt
        const shadowX = mouseX * 0.03;
        const shadowY = mouseY * 0.03;
        this.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.2), 
                              0 8px 20px rgba(0, 0, 0, 0.15), 
                              0 0 10px rgba(255, 255, 255, 0.5)`;
    });

    flashcard.addEventListener('mouseleave', function() {
        // Disable tilt
        this.tiltActive = false;

        // Smooth exit animation
        this.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';

        // Reset tilt only if not in a slide animation
        if (!this.classList.contains('slide-out') &&
            !this.classList.contains('slide-in') &&
            !this.classList.contains('slide-in-active')) {

            applyTransforms(this, {
                rotateX: 0,
                rotateY: 0
            });

            this.style.boxShadow = '2px 4px 6px rgba(0, 0, 0, 0.3)';
        }
    });

    // Modify the nextBtn and prevBtn click handlers
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    // Add event listeners to completely disable tilt during transitions
    nextBtn.addEventListener('click', function() {
        flashcard.tiltActive = false;
        flashcard.style.transform = ''; // Reset any tilt transforms
        flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
    });

    prevBtn.addEventListener('click', function() {
        flashcard.tiltActive = false;
        flashcard.style.transform = ''; // Reset any tilt transforms
        flashcard.style.transition = 'transform 0.25s ease-in-out, opacity 0.25s ease-in-out';
    });

    // Event listeners to re-enable tilt after animations complete
    flashcard.addEventListener('transitionend', function(e) {
        if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
            // If we're not in a slide animation anymore, we can re-enable tilt
            if (!this.classList.contains('slide-in') &&
                !this.classList.contains('slide-out') &&
                !this.classList.contains('slide-in-active')) {

                // Delay enabling tilt to ensure all animations are complete
                setTimeout(() => {
                    this.tiltActive = true;
                }, 50);
            }
        }
    });
}