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
    const toastLiveExample = document.getElementById('liveToast')

    let modeUnknown = practiceUnknown.checked;
    let israndom = random.checked;
    let currentIndex = 0;
    let unknownIndex = 0;
    let Index = 0;

    random.addEventListener('change', () => {
        israndom = random.checked;
    });
    practiceUnknown.addEventListener('change', () => {
        modeUnknown = practiceUnknown.checked;
    });

    flashcard.addEventListener('click', () => {
        console.log('clicked')
        flashcard.classList.toggle('flipped');
    });
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            console.log('clicked')
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
    clear.addEventListener('click', () => {
        knownWords = [];
        unknownWords = [];
        setCookie('knownWords', JSON.stringify(knownWords));
        setCookie('unknownWords', JSON.stringify(unknownWords));
        getNum();
    });

    prevBtn.addEventListener('click', () => {
        if (!israndom) {
            if (currentIndex > 0) {
                currentIndex--;
                displayFlashcard(currentIndex);
            } else {
                alert('This is the first flashcard.');
            }
        } else {
            if (!modeUnknown) {
                if (viewed.length > 0) {
                    viewed.pop();
                    currentIndex = viewed[viewed.length - 1];
                    displayFlashcard(currentIndex);
                } else {
                    alert('This is the first flashcard.');
                }
            } else {
                if (unknownIndex > 0) {
                    unknownIndex--;
                    displayFlashcard(unknownWords[unknownIndex]);
                } else {
                    alert('This is the first flashcard.');
                }
            }
        }
    });

    nextBtn.addEventListener('click', () => {
        const flashcard = document.getElementById('flashcard');
        flashcard.classList.add('slide-out');
        setTimeout(() => {
            if (!israndom) {
                if (!modeUnknown) {
                    if (currentIndex < vocabData.length - 1) {
                        currentIndex++;
                        if (knownWords !== null) {
                            while (knownWords.includes(currentIndex)) {
                                currentIndex++;
                            }
                        }
                        displayFlashcard(currentIndex);
                    } else {
                        alert('You have reached the last flashcard.');
                    }
                } else {
                    if (unknownIndex < unknownWords.length - 1) {
                        unknownIndex++;
                        displayFlashcard(unknownWords[unknownIndex]);
                    } else {
                        alert('You have reached the last flashcard.');
                    }
                }
            } else {
                if (!modeUnknown) {
                    currentIndex = Math.floor(Math.random() * vocabData.length);
                    if (knownWords !== null) {
                        while (knownWords.includes(currentIndex)) {
                            currentIndex = Math.floor(Math.random() * vocabData.length);
                        }
                    }
                    displayFlashcard(currentIndex);
                    viewed.push(currentIndex);
                } else {
                    unknownIndex = Math.floor(Math.random() * unknownWords.length);
                    displayFlashcard(unknownWords[unknownIndex]);
                    viewed.push(unknownWords[unknownIndex]);
                }
            }
            flashcard.classList.remove('slide-out');
            flashcard.classList.add('slide-in');
            setTimeout(() => {
                flashcard.classList.remove('slide-in');
                flashcard.classList.add('slide-in-active');
                setTimeout(() => {
                    flashcard.classList.remove('slide-in-active');
                }, 250);
            }, 10);
        }, 250);
    });
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
        displayProgress()
    });

    unknown.addEventListener('click', () => {
        if(!unknownWords.includes(currentIndex) && !modeUnknown){
            unknownWords.push(currentIndex);
            console.log(unknownWords);
            setCookie('unknownWords', JSON.stringify(unknownWords));
            if(knownWords !== null && knownWords.includes(currentIndex)){
                knownWords = knownWords.filter(index => index !== currentIndex);
                setCookie('knownWords', JSON.stringify(knownWords))
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