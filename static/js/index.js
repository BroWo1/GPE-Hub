// Card Tilt Effect
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // Add listener for mouse enter
        card.addEventListener('mouseenter', handleMouseEnter);

        // Add listener for mouse move
        card.addEventListener('mousemove', handleMouseMove);

        // Add listener for mouse leave
        card.addEventListener('mouseleave', handleMouseLeave);
    });

    function handleMouseEnter(e) {
        // Add a smooth transition when initially entering the card
        this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';

        // Apply a slight initial tilt before tracking mouse movement
        // This creates a smooth "pickup" effect
        setTimeout(() => {
            // After the initial transition, remove the transition for real-time tracking
            this.style.transition = 'none';
        }, 300); // Match this to the transition duration
    }

    function handleMouseMove(e) {
        const card = this;
        const cardRect = card.getBoundingClientRect();

        // Calculate mouse position relative to the card center
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        // Calculate the distance from the center as a percentage of the card dimensions
        const mouseX = e.clientX - cardCenterX;
        const mouseY = e.clientY - cardCenterY;

        // Convert to a percentage and limit the rotation angle
        const rotateY = mouseX * 0.05; // Adjust this value to control sensitivity
        const rotateX = -mouseY * 0.05; // Negative because we want to tilt toward the mouse

        // Apply the transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;

        // Enhanced shadow effect that follows the tilt AND includes the glow
        const shadowX = mouseX * 0.05;
        const shadowY = mouseY * 0.05;
        card.style.boxShadow = `${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.2), 
                               0 8px 20px rgba(0, 0, 0, 0.15), 
                               0 0 10px rgba(255, 255, 255, 0.5)`; // Added glowing effect
    }

    function handleMouseLeave(e) {
        // Ensure a smooth transition when leaving the card
        this.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, background 0.3s ease, border 0.3s ease';
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        // Reset to original box-shadow without glow
        this.style.boxShadow = '2px 4px 6px rgba(0, 0, 0, 0.3)';
    }
});