document.addEventListener('DOMContentLoaded', () => {
    const movingBtn = document.getElementById('moving-btn');
    const stayBtn = document.getElementById('stay-btn');
    const chibiDisplay = document.getElementById('chibi-display');

    // Sequence of chibi images
    const sequence = [
        'happy.png', 
        'crying.png', 
        'super_crying.png', 
        'irritating.png', 
        'angry.png', 
        'super_irritating.png', 
        'super_angry.png'
    ];
    let currentChibiIndex = 0;

    // Fallback logic: if an image doesn't load, show a simple colored placeholder
    if (chibiDisplay) {
        chibiDisplay.onerror = () => {
            // Replaces the broken image icon with a simple orange circle with text
            chibiDisplay.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="70" fill="%23ff9a55" stroke="%23333" stroke-width="4"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23333">MISSING</text></svg>';
        };
    }

    // Helper function to change image with a smooth fade
    const changeChibi = (newSrc) => {
        if (!chibiDisplay) return;
        // Fade out
        chibiDisplay.style.opacity = 0;
        
        // Wait for CSS transition, change source, fade back in
        setTimeout(() => {
            chibiDisplay.src = newSrc;
            chibiDisplay.style.opacity = 1;
        }, 200);
    };

    // 1. Logic for the stationary button
    const celebScreen = document.getElementById('celebration-screen');
    if (stayBtn) {
        stayBtn.addEventListener('click', () => {
            changeChibi('super_happy.png');
            if(celebScreen) {
                celebScreen.style.display = 'flex';
            }
            const audio = document.getElementById('celebration-audio');
            if(audio) audio.play();
        });
    }

    // 2. Logic for the jumping button
    if (movingBtn) {
        const jumpAway = () => {
            // Get screen boundaries
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // Get button dimensions so it doesn't jump out of the viewport
            const btnWidth = movingBtn.offsetWidth;
            const btnHeight = movingBtn.offsetHeight;
            
            // Padding so it doesn't touch the absolute edge
            const padding = 20;
            
            // Calculate max X and Y limits
            const maxX = windowWidth - btnWidth - padding;
            const maxY = windowHeight - btnHeight - padding;
            
            // Generate random coordinates
            const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
            const randomY = Math.max(padding, Math.floor(Math.random() * maxY));
            
            // Instantly apply the new coordinates
            movingBtn.style.left = randomX + 'px';
            movingBtn.style.top = randomY + 'px';
            
            // Update Chibi image sequence
            currentChibiIndex = (currentChibiIndex + 1) % sequence.length;
            changeChibi(sequence[currentChibiIndex]);
        };

        // Desktop: Make it jump as soon as the mouse touches it
        movingBtn.addEventListener('mouseover', jumpAway);
        
        // Mobile: Detect touch events to jump instantly before the tap registers as a click
        movingBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Stops the touch from eventually triggering a "click" event
            jumpAway();
        }, { passive: false });
        
        // Fallback: Just in case they somehow manage to trigger a click
        movingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            jumpAway();
        });
    }

    // 3. QR Code Upload Logic
    const qrContainer = document.getElementById('qr-upload-container');
    const qrInput = document.getElementById('qr-file-input');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const qrPreviewWrapper = document.getElementById('qr-preview-wrapper');
    const qrPreview = document.getElementById('qr-preview');
    const qrRemoveBtn = document.getElementById('qr-remove-btn');

    const showQRPreview = (src) => {
        if (qrPreview) qrPreview.src = src;
        if (qrPlaceholder) qrPlaceholder.style.display = 'none';
        if (qrPreviewWrapper) qrPreviewWrapper.style.display = 'flex';
    };

    const hideQRPreview = () => {
        if (qrPreview) qrPreview.src = '';
        if (qrPlaceholder) qrPlaceholder.style.display = 'flex';
        if (qrPreviewWrapper) qrPreviewWrapper.style.display = 'none';
        if (qrInput) qrInput.value = '';
    };

    // Load saved QR Code on page load
    const savedQR = localStorage.getItem('payment_qr_code');
    if (savedQR) {
        showQRPreview(savedQR);
    }

    if (qrContainer && qrInput) {
        // Trigger file input on container click
        qrContainer.addEventListener('click', (e) => {
            // Don't trigger if remove button is clicked
            if (e.target === qrRemoveBtn || qrRemoveBtn?.contains(e.target)) return;
            qrInput.click();
        });

        // Handle file select
        qrInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    showQRPreview(dataUrl);
                    localStorage.setItem('payment_qr_code', dataUrl);
                };
                reader.readAsDataURL(file);
            }
        });

        // Drag & Drop
        qrContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            qrContainer.style.borderColor = '#ff8c3a';
            qrContainer.style.background = 'rgba(255, 140, 58, 0.15)';
        });

        qrContainer.addEventListener('dragleave', () => {
            qrContainer.style.borderColor = '#000';
            qrContainer.style.background = 'rgba(255, 255, 255, 0.4)';
        });

        qrContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            qrContainer.style.borderColor = '#000';
            qrContainer.style.background = 'rgba(255, 255, 255, 0.4)';
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    showQRPreview(dataUrl);
                    localStorage.setItem('payment_qr_code', dataUrl);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (qrRemoveBtn) {
        qrRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent container click from triggering file input
            hideQRPreview();
            localStorage.removeItem('payment_qr_code');
        });
    }
});
