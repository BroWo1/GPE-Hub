const float = document.getElementById('float');
const ball = document.getElementById('ball');
const floatContainer = document.querySelector('.float-container');
let isHoveringFloatContainer = false;
let isHoveringBall = false;
const drag = document.getElementById('drag');
const dragC = document.getElementById('dragC');
let isHoveringDragContainer = false;
let isClicked = false;
let animation = false;
let logo = document.getElementById('logo');
let uploadImgBtn = document.getElementById('uploadImgBtn');
let haveImg = false;

floatContainer.addEventListener('mouseover', () => {
    isHoveringFloatContainer = true;

});
floatContainer.addEventListener('mouseout', () => {
    isHoveringFloatContainer = false;
});

dragC.addEventListener('mouseover', () => {
    isHoveringDragContainer = true;

});
dragC.addEventListener('mouseout', () => {
    isHoveringDragContainer = false;
});


document.getElementById('ball').addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent the default context menu from appearing
    window.electronAPI.openMenu();
});
function isWindowCloseToRightEdge() {
    const windowWidth = window.innerWidth;
    const screenWidth = window.screen.width;
    const windowRightEdge = window.screenX + windowWidth;
    const distanceToRightEdge = screenWidth - windowRightEdge;

    return distanceToRightEdge < 400;
}
document.getElementById('ball').addEventListener('click', () => {
    if (!animation) {
        if (isClicked) {
            float.classList.remove('expanded');
            uploadImgBtn.classList.remove('expanded');
            drag.classList.remove('drag');
            document.getElementById('responseOutput').classList.remove('on');
            logo.classList.add('spinBack');
            animation = true;
            setTimeout(() => {
                window.resizeTo(75, 75);
                animation = false;
                window.electronAPI.snapToRight();
            }, 300);
            setTimeout(() => {
                logo.classList.remove('spinBack');
            }, 500);
            isClicked = false;
        } else {
            if(isWindowCloseToRightEdge()) {
                animation = true;
                window.electronAPI.moveLeft();
                isClicked = true;
                setTimeout(() => {
                    window.resizeTo(375, 100);
                }, 350);
                setTimeout(() => {
                    window.resizeTo(375, 100);
                    float.classList.add('expanded');
                    uploadImgBtn.classList.add('expanded');
                drag.classList.add('drag');
                logo.classList.add('spin');

                    setTimeout(() => {
                        animation = false;
                    }, 300);
                    setTimeout(() => {
                        logo.classList.remove('spin');
                    }, 500);
                }, 400);
                

            }else{
                animation = true;
                float.classList.add('expanded');
                uploadImgBtn.classList.add('expanded');
                drag.classList.add('drag');
                logo.classList.add('spin');
                isClicked = true;
                window.resizeTo(375, 100);
                setTimeout(() => {
                    animation = false;
                    
                }, 300);
                setTimeout(() => {
                    logo.classList.remove('spin');
                }, 500);
            }

        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('input').addEventListener('keydown', async (event) => {
    if (event.key === "Enter") {
        const query = document.getElementById('float').value;
        const model = 'qwen-omni-turbo';
        let imageBase64 = '';
        if(haveImg){
            imageBase64 = sessionStorage.getItem('screenshot');
        }
        const prompt1 = "You are a helpful assistant."

        const loading = document.createElement("div");
        loading.className = "load";
        const spinner = document.createElement("div");
        spinner.className = "spinner";
        loading.appendChild(spinner);
        document.body.appendChild(loading);

        try {
            if (window.electron) {
                let response = '';
                if(haveImg){
                    response = await window.electron.mixRequest(model, imageBase64, query);
                }else{
                    response = await window.electron.chatGPTRequest(query, model, prompt1);
                }
                // Log the entire response to check its structure
                console.log('Received response from server:', response);
                const responseMD = await window.electronAPI.convertMarkdown(response);
                sessionStorage.setItem('responseMD', responseMD);
                // Since response is a string, directly set it

                if (response) {
                    const element = document.getElementById('responseOutput');
                    window.resizeTo(375, 425);
                    element.classList.add('on');
                    console.log(element);
                    if (element) {
                        element.style.display = 'block';
                        console.log('displayed')
                    }
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
    }
    });
});
      const isBall = sessionStorage.getItem("ballChecked") === "true" || sessionStorage.getItem("ballChecked") === null;


/*
document.addEventListener('mouseleave', () => {
        float.classList.remove('expanded');
        drag.classList.remove('drag');
        setTimeout(() => {
            window.resizeTo(80, 80);
        }, 300);
});

 */

uploadImgBtn.addEventListener('click', async () => {
    if(haveImg){
        haveImg = false;
        sessionStorage.removeItem('screenshot');
        uploadImgBtn.classList.remove('active');
    } else {
        try {
            // Show loading animation
            const loading = document.createElement("div");
            loading.className = "load";
            const spinner = document.createElement("div");
            spinner.className = "spinner";
            loading.appendChild(spinner);
            document.body.appendChild(loading);
            
            // Call the screenshot function and get the data
            const screenData = await window.electron.captureScreenshot();
            
            if (screenData && screenData.thumbnail) {
                // Extract just the base64 part without the data URL prefix
                // Format typically: "data:image/png;base64,iVBORw0KGgoAAA..."
                const base64Only = screenData.thumbnail.split(',')[1];
                
                // Store only the base64 data without the data URL prefix
                sessionStorage.setItem('screenshot', base64Only);
                haveImg = true;
                uploadImgBtn.classList.add('active');
                console.log("Screenshot captured successfully");
            } else {
                console.error("Failed to capture screenshot");
            }
            
            // Remove loading animation
            loading.className = "load exit";
            setTimeout(() => {
                loading.remove();
            }, 300);
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            alert('Failed to capture screenshot. Please try again.');
            
            // Make sure loading is removed even if there's an error
            const loading = document.querySelector('.load');
            if (loading) {
                loading.className = "load exit";
                setTimeout(() => {
                    loading.remove();
                }, 300);
            }
        }
    }
});
