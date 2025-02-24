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
document.getElementById('ball').addEventListener('click', () => {
    if (!animation) {
        if (isClicked) {
            float.classList.remove('expanded');
            drag.classList.remove('drag');
            document.getElementById('responseOutput').classList.remove('on');
            animation = true;
            setTimeout(() => {
                window.resizeTo(70, 70);
                animation = false;
                window.electronAPI.snapToRight();
            }, 300);
            isClicked = false;
        } else {
            float.classList.add('expanded');
            drag.classList.add('drag');
            isClicked = true;
            window.resizeTo(400, 70);
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('input').addEventListener('keydown', async (event) => {
    if (event.key === "Enter") {
        const query = document.getElementById('float').value;
        const model = 'qwen-omni-turbo';
        const prompt1 = "You are a helpful assistant."

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
                    const element = document.getElementById('responseOutput');
                    window.resizeTo(400, 400);
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


/*
document.addEventListener('mouseleave', () => {
        float.classList.remove('expanded');
        drag.classList.remove('drag');
        setTimeout(() => {
            window.resizeTo(80, 80);
        }, 300);
});

 */

