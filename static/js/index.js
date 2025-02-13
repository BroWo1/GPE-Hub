
    document.getElementById('textForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevents form from submitting the default way

        const query = document.getElementById('textInput').value;

        // Show loading indication (optional)
        document.getElementById('actualResponse').style.display = 'none';  // Hide previous response

        // Send the query to your server (replace with your server's IP)
        fetch('http://117.72.120.34/api/chatgpt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query }) // Send the input value to the server
        })
        .then(response => response.json()) // Parse the server response
        .then(data => {
            // Display the response from the ChatGPT API
            document.getElementById('actualResponse').innerText = data.response;
            document.getElementById('actualResponse').style.display = 'block';  // Show the response
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle error (e.g., show an error message)
        });
    });
