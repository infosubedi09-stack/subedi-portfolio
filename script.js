document.addEventListener('DOMContentLoaded', () => {
    
    // Core Desktop Variables
    let highestZ = 200;
    const desktop = document.getElementById('desktop-canvas');
    const startBtn = document.getElementById('start-btn');
    const startMenu = document.getElementById('start-menu-panel');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Particles state variables (moved to top to resolve TDZ ReferenceError)
    let particles = [];
    let canvas, ctx;

    // Initialize OS components safely
    const initSafely = (name, fn) => {
        try {
            fn();
            console.log(`[OS System] ${name} initialized.`);
        } catch (e) {
            console.error(`[OS System] Error in ${name}:`, e);
        }
    };

    initSafely('LiveClock', initLiveClock);
    initSafely('DraggableWindows', initDraggableWindows);
    initSafely('WindowControls', initWindowControls);
    initSafely('StartMenu', initStartMenu);
    initSafely('SkillsTabs', initSkillsTabs);
    initSafely('TimelineToggle', initTimelineToggle);
    initSafely('Theme', initTheme);
    initSafely('ParticleCanvas', initParticleCanvas);
    initSafely('TypingEffect', initTypingEffect);
    initSafely('Lightbox', initLightbox);
    initSafely('FileExplorer', initFileExplorer);
    initSafely('OSPowerManagement', initOSPowerManagement);

    /* ==========================================================================
       LIVE SYSTEM CLOCK
       ========================================================================== */
    function initLiveClock() {
        const timeEl = document.getElementById('sys-time');
        const dateEl = document.getElementById('sys-date');
        
        function updateClock() {
            const now = new Date();
            
            // Format Time (12 hour style with AM/PM)
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // Hour '0' should be '12'
            const formattedTime = `${hours}:${minutes} ${ampm}`;
            
            // Format Date (MM/DD/YYYY)
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const year = now.getFullYear();
            const formattedDate = `${month}/${day}/${year}`;
            
            if (timeEl) timeEl.textContent = formattedTime;
            if (dateEl) dateEl.textContent = formattedDate;
        }
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    /* ==========================================================================
       DRAGGABLE WINDOW ENGINE
       ========================================================================== */
    function initDraggableWindows() {
        const windows = document.querySelectorAll('.window');
        
        windows.forEach(win => {
            const header = win.querySelector('.window-header');
            let isDragging = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;

            // Focus on click
            win.addEventListener('mousedown', () => {
                focusWindow(win);
            });

            // Drag Start
            header.addEventListener('mousedown', (e) => {
                // If the user clicked on a control button, don't drag!
                if (e.target.closest('.window-controls') || e.target.classList.contains('win-btn')) {
                    return;
                }
                
                // If maximized, drag is disabled
                if (win.classList.contains('maximized')) return;
                
                // Allow left click only
                if (e.button !== 0) return;
                
                isDragging = true;
                focusWindow(win);

                startX = e.clientX;
                startY = e.clientY;
                
                // Read current computed offset positions
                const rect = win.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;

                // Create global movement events
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                
                // Prevent highlighting text while dragging
                e.preventDefault();
            });

            function onMouseMove(e) {
                if (!isDragging) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                let newLeft = initialLeft + dx;
                let newTop = initialTop + dy;

                // Screen Boundary Constraints (keeps header visible)
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                
                // Prevent dragging fully offscreen
                if (newTop < 0) newTop = 0;
                if (newTop > screenHeight - 60) newTop = screenHeight - 60;
                if (newLeft < -win.offsetWidth + 100) newLeft = -win.offsetWidth + 100;
                if (newLeft > screenWidth - 100) newLeft = screenWidth - 100;

                win.style.left = `${newLeft}px`;
                win.style.top = `${newTop}px`;
            }

            function onMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            // Double Click Header to Maximize
            header.addEventListener('dblclick', () => {
                toggleMaximize(win);
            });
        });
    }

    function focusWindow(win) {
        if (win.classList.contains('active-focus-win')) return;
        
        // Remove focus class from all other windows
        document.querySelectorAll('.window').forEach(w => {
            w.classList.remove('active-focus-win');
        });

        // Set higher Z-index
        highestZ++;
        win.style.zIndex = highestZ;
        win.classList.add('active-focus-win');
        
        // Highlight taskbar indicator
        const winId = win.id;
        document.querySelectorAll('.shortcut-trigger').forEach(btn => {
            const targetId = btn.getAttribute('data-window');
            if (targetId === winId) {
                btn.classList.add('active-open-win');
            }
        });
    }

    /* ==========================================================================
       WINDOW CONTROLS & TRASBAR SHORTCUTS
       ========================================================================== */
    function initWindowControls() {
        const windows = document.querySelectorAll('.window');

        windows.forEach(win => {
            const minBtn = win.querySelector('.win-min');
            const maxBtn = win.querySelector('.win-max');
            const closeBtn = win.querySelector('.win-close');

            // Minimize Handler (animates/hides from view, keeps tray active)
            minBtn.addEventListener('click', () => {
                win.setAttribute('hidden', '');
                win.classList.remove('active-focus-win');
            });

            // Maximize Toggle
            maxBtn.addEventListener('click', () => {
                toggleMaximize(win);
            });

            // Close Window (closes and turns off taskbar indicators)
            closeBtn.addEventListener('click', () => {
                closeWindow(win);
            });
        });

        // Setup Desktop Icon Launchers
        const shortcuts = document.querySelectorAll('.desktop-shortcut');
        shortcuts.forEach(icon => {
            icon.addEventListener('click', () => {
                const winId = icon.getAttribute('data-window');
                openWindowById(winId);
            });
        });

        // Setup Start Menu App Launchers
        const startApps = document.querySelectorAll('.start-app-btn');
        startApps.forEach(app => {
            app.addEventListener('click', () => {
                const winId = app.getAttribute('data-window');
                openWindowById(winId);
                closeStartMenu();
            });
        });

        // Setup Taskbar Shortcuts Toggles
        const taskbarTriggers = document.querySelectorAll('.shortcut-trigger');
        taskbarTriggers.forEach(btn => {
            btn.addEventListener('click', () => {
                const winId = btn.getAttribute('data-window');
                const win = document.getElementById(winId);

                if (!win) return;

                const isHidden = win.hasAttribute('hidden');
                const isFocused = win.classList.contains('active-focus-win');

                if (isHidden) {
                    // Open it
                    win.removeAttribute('hidden');
                    focusWindow(win);
                } else if (!isFocused) {
                    // Focus it
                    focusWindow(win);
                } else {
                    // Minimize it
                    win.setAttribute('hidden', '');
                    win.classList.remove('active-focus-win');
                }
            });
        });
    }

    function toggleMaximize(win) {
        if (win.classList.contains('maximized')) {
            win.classList.remove('maximized');
            // Restore previous absolute dimensions
            win.style.top = win.dataset.prevTop || '10%';
            win.style.left = win.dataset.prevLeft || '10%';
            win.style.width = win.dataset.prevWidth || '700px';
            win.style.height = win.dataset.prevHeight || '500px';
        } else {
            // Save state dimensions before maximizing
            win.dataset.prevTop = win.style.top;
            win.dataset.prevLeft = win.style.left;
            win.dataset.prevWidth = win.style.width;
            win.dataset.prevHeight = win.style.height;

            win.classList.add('maximized');
        }
    }

    function openWindowById(winId, triggerToast = true) {
        const win = document.getElementById(winId);
        if (!win) return;

        const isHidden = win.hasAttribute('hidden');
        if (isHidden) {
            win.removeAttribute('hidden');
            
            // Only center if it doesn't have custom inline coordinates in HTML
            if (!win.style.left || win.style.left === "") {
                const winWidth = parseInt(win.style.width) || 700;
                const winHeight = parseInt(win.style.height) || 500;
                const leftVal = (window.innerWidth - winWidth) / 2;
                const topVal = (window.innerHeight - winHeight - 50) / 2;
                
                win.style.left = `${Math.max(20, leftVal)}px`;
                win.style.top = `${Math.max(20, topVal)}px`;
            }
        }
        
        focusWindow(win);
        
        // Show Toast
        if (triggerToast) {
            let name = winId.replace('-window', '').replace('-', ' ');
            name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            showToast(`Opened ${name}`);
        }
    }

    function closeWindow(win) {
        win.setAttribute('hidden', '');
        win.classList.remove('active-focus-win');
        
        // Turn off indicator dot in taskbar
        const winId = win.id;
        document.querySelectorAll('.shortcut-trigger').forEach(btn => {
            const targetId = btn.getAttribute('data-window');
            if (targetId === winId) {
                btn.classList.remove('active-open-win');
            }
        });
    }

    /* ==========================================================================
       START MENU TRIGGERS
       ========================================================================== */
    function initStartMenu() {
        startBtn.addEventListener('click', (e) => {
            startMenu.style.display = startMenu.style.display === 'none' ? 'flex' : 'none';
            if (startMenu.style.display === 'flex') {
                startMenu.classList.add('show');
                startBtn.classList.add('active');
            } else {
                startMenu.classList.remove('show');
                startBtn.classList.remove('active');
            }
            e.stopPropagation();
        });

        // Close start menu when clicking anywhere on desktop canvas
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startBtn) {
                closeStartMenu();
            }
        });
    }

    function closeStartMenu() {
        startMenu.classList.remove('show');
        setTimeout(() => {
            startMenu.style.display = 'none';
        }, 150);
        startBtn.classList.remove('active');
    }

    /* ==========================================================================
       SKILLS WINDOW TABS
       ========================================================================== */
    function initSkillsTabs() {
        // Tab functionality inside the Windows body
        const tabBtns = document.querySelectorAll('.skills-tab-component .tab-btn');
        const contents = document.querySelectorAll('.skills-tab-component .tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('aria-controls');

                // Remove active classes
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                contents.forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('hidden', '');
                });

                // Set active classes
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.classList.add('active');
                    targetEl.removeAttribute('hidden');
                }
            });
        });
    }

    /* ==========================================================================
       TIMELINE SWITCH TOGGLE
       ========================================================================== */
    function initTimelineToggle() {
        const btnExp = document.getElementById('btn-exp');
        const btnEdu = document.getElementById('btn-edu');
        const timelineExp = document.getElementById('timeline-exp');
        const timelineEdu = document.getElementById('timeline-edu');

        if (!btnExp || !btnEdu) return;

        btnExp.addEventListener('click', () => {
            btnExp.classList.add('active');
            btnEdu.classList.remove('active');
            timelineExp.classList.add('active-timeline');
            timelineExp.removeAttribute('hidden');
            timelineEdu.classList.remove('active-timeline');
            timelineEdu.setAttribute('hidden', '');
        });

        btnEdu.addEventListener('click', () => {
            btnEdu.classList.add('active');
            btnExp.classList.remove('active');
            timelineEdu.classList.add('active-timeline');
            timelineEdu.removeAttribute('hidden');
            timelineExp.classList.remove('active-timeline');
            timelineExp.setAttribute('hidden', '');
        });
    }

    /* ==========================================================================
       WALLPAPER GRADIENT THEME SWITCHER
       ========================================================================== */
    function initTheme() {
        // Retrieve theme state from localStorage
        const localTheme = localStorage.getItem('desktopTheme');
        if (localTheme === 'light') {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
        }

        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
                localStorage.setItem('desktopTheme', 'light');
                showToast("System switched to Light Mode");
            } else {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                localStorage.setItem('desktopTheme', 'dark');
                showToast("System switched to Dark Mode");
            }
        });
    }

    /* ==========================================================================
       CANVAS PARTICLES EFFECT
       ========================================================================== */
    function initParticleCanvas() {
        canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        setupParticlesSize();

        window.addEventListener('resize', setupParticlesSize);
        animateParticles();
    }

    function setupParticlesSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        particles = [];
        const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2.5 + 0.5
            });
        }
    }

    function getLineColor() {
        // Line transparency colors tailored to dark/light modes
        return body.classList.contains('dark-theme') 
            ? 'rgba(0, 229, 255, 0.04)' 
            : 'rgba(2, 132, 199, 0.04)';
    }

    function getParticleColor() {
        return body.classList.contains('dark-theme')
            ? 'rgba(0, 229, 255, 0.2)'
            : 'rgba(2, 132, 199, 0.2)';
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const lineCol = getLineColor();
        const partCol = getParticleColor();

        // Draw and update
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Boundaries bounce
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.fillStyle = partCol;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw connections
        const connectionDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDist) {
                    ctx.strokeStyle = lineCol;
                    ctx.lineWidth = 1 - (dist / connectionDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    /* ==========================================================================
       DYNAMIC TYPING EFFECT
       ========================================================================== */
    function runTypewriter(targetId, roles) {
        const textTarget = document.getElementById(targetId);
        if (!textTarget) return;

        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                textTarget.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                textTarget.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            let typingSpeed = isDeleting ? 40 : 80;

            if (!isDeleting && charIndex === currentRole.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 500;
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    function initTypingEffect() {
        const customRoles = [
            "an AI Content Creator",
            "a Digital Marketer",
            "a Blogger",
            "a Computer Systems Trainer",
            "a System Administrator",
            "a Data Science & AI Enthusiast",
            "an Office Administrator",
            "a Google Products & Services Expert"
        ];

        // Run typewriter on the desktop background profile widget
        runTypewriter('widget-typed-role', customRoles);

        // Run typewriter inside the About Me window profile card
        runTypewriter('typed-role', customRoles);
    }

    /* ==========================================================================
       LIGHTBOX / CERTIFICATE PREVIEW
       ========================================================================== */
    function initLightbox() {
        const lightbox = document.getElementById('lightbox-modal');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');
        
        if (!lightbox) return;

        document.querySelectorAll('.zoomable-image').forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = img.alt;
                lightbox.removeAttribute('hidden');
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.setAttribute('hidden', '');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.setAttribute('hidden', '');
            }
        });
    }

    /* ==========================================================================
       TOAST ALERTS
       ========================================================================== */
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');

        if (!toast || !toastMsg) return;

        toastMsg.textContent = message;
        toast.removeAttribute('hidden');

        // Automatically hide after 2.5s
        setTimeout(() => {
            toast.setAttribute('hidden', '');
        }, 2500);
    }

    // Submit handler for contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast("System Response: Message sent successfully!");
            contactForm.reset();
        });
    }

    // Welcome toast notification on load (do not auto-open About Me)
    setTimeout(() => {
        showToast("Welcome to Pradip's Workstation. OS initialized.");
    }, 800);

    /* ==========================================================================
       FILE EXPLORER (THIS PC) ENGINE
       ========================================================================== */
    function initFileExplorer() {
        const explorerGrid = document.getElementById('explorer-files-grid');
        const addressBarText = document.getElementById('explorer-current-path');
        const backBtn = document.getElementById('explorer-back-btn');
        const upBtn = document.getElementById('explorer-up-btn');
        const sidebarItems = document.querySelectorAll('.explorer-sidebar .sidebar-item');

        if (!explorerGrid || !addressBarText || !backBtn || !upBtn) return;

        const virtualFS = {
            "This PC": {
                type: "root",
                contents: {
                    "Local Disk (C:)": { type: "drive", path: "This PC/C:", size: "128 GB free of 256 GB" }
                }
            },
            "This PC/C:": {
                type: "dir",
                parent: "This PC",
                contents: {
                    "Best Award.JPG": { type: "file", fileType: "image", src: "images/This PC/Best Award.JPG" },
                    "It's Me.JPG": { type: "file", fileType: "image", src: "images/This PC/It's Me.JPG" },
                    "My infographic image.jpeg": { type: "file", fileType: "image", src: "images/This PC/My infographic image.jpeg" },
                    "Relax Me.jpeg": { type: "file", fileType: "image", src: "images/This PC/Relax Me.jpeg" },
                    "Trainer1.jpeg": { type: "file", fileType: "image", src: "images/This PC/Trainer1.jpeg" },
                    "Trainer2.jpeg": { type: "file", fileType: "image", src: "images/This PC/Trainer2.jpeg" },
                    "pradip_subedi_resume.pdf": { type: "file", fileType: "pdf", src: "images/This PC/pradip_subedi_resume.pdf" }
                }
            }
        };

        let currentPath = "This PC";
        let explorerHistory = [];

        function openImageInLightbox(src, alt) {
            const lightbox = document.getElementById('lightbox-modal');
            const lightboxImg = document.getElementById('lightbox-img');
            const lightboxCaption = document.getElementById('lightbox-caption');
            if (lightbox && lightboxImg && lightboxCaption) {
                lightboxImg.src = src;
                lightboxCaption.textContent = alt;
                lightbox.removeAttribute('hidden');
            }
        }

        function renderExplorer(path) {
            explorerGrid.innerHTML = "";
            addressBarText.textContent = path;

            // Highlight sidebar active selection
            sidebarItems.forEach(item => {
                if (item.getAttribute('data-path') === path) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            const currentFolder = virtualFS[path];
            if (!currentFolder) return;

            const contents = currentFolder.contents;
            Object.keys(contents).forEach(name => {
                const item = contents[name];
                
                const itemBtn = document.createElement('button');
                itemBtn.className = "explorer-item";
                itemBtn.setAttribute('aria-label', `Open ${name}`);

                let iconEmoji = "📁";
                let desc = "Folder";

                if (item.type === "drive") {
                    iconEmoji = "💽";
                    desc = item.size;
                } else if (item.type === "file") {
                    if (item.fileType === "image") {
                        iconEmoji = "🖼️";
                        desc = "JPEG Image";
                    } else if (item.fileType === "pdf") {
                        iconEmoji = "📕";
                        desc = "PDF Document";
                    }
                }

                itemBtn.innerHTML = `
                    <div class="explorer-item-icon">${iconEmoji}</div>
                    <div class="explorer-item-name">${name}</div>
                    <div class="explorer-item-desc">${desc}</div>
                `;

                // Single click to navigate / open
                itemBtn.addEventListener('click', () => {
                    if (item.type === "drive" || item.type === "dir") {
                        navigateToPath(item.path);
                    } else if (item.type === "file") {
                        if (item.fileType === "image") {
                            openImageInLightbox(item.src, name);
                        } else if (item.fileType === "pdf") {
                            window.open(item.src, '_blank');
                        }
                    }
                });

                explorerGrid.appendChild(itemBtn);
            });

            // Update toolbar button states
            backBtn.disabled = explorerHistory.length === 0;
            upBtn.disabled = path === "This PC";
        }

        function navigateToPath(newPath, pushToHistory = true) {
            const target = virtualFS[newPath];
            if (target && target.type === "link-win") {
                openWindowById(target.action);
                return;
            }
            if (pushToHistory) {
                explorerHistory.push(currentPath);
            }
            currentPath = newPath;
            renderExplorer(currentPath);
        }

        // Parent navigation
        function navigateUp() {
            const currentFolder = virtualFS[currentPath];
            if (currentFolder && currentFolder.parent) {
                navigateToPath(currentFolder.parent);
            }
        }

        // History back navigation
        function navigateBack() {
            if (explorerHistory.length > 0) {
                const prevPath = explorerHistory.pop();
                navigateToPath(prevPath, false);
            }
        }

        // Toolbar Events
        backBtn.addEventListener('click', navigateBack);
        upBtn.addEventListener('click', navigateUp);

        // Sidebar Events
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPath = item.getAttribute('data-path');
                navigateToPath(targetPath);
            });
        });

        // Initialize view
        renderExplorer(currentPath);
    }

    /* ==========================================================================
       OS POWER MANAGEMENT (SHUTDOWN / BOOT SYSTEM)
       ========================================================================== */
    function initOSPowerManagement() {
        const startPowerBtn = document.getElementById('start-power-btn');
        const osBootScreen = document.getElementById('os-boot-screen');
        const bootContent = document.getElementById('boot-content');
        const bootMessage = document.getElementById('boot-message');
        const signinScreen = document.getElementById('signin-screen');
        const signinBtn = document.getElementById('signin-btn');
        const signinTimeEl = document.getElementById('signin-time');
        const signinDateEl = document.getElementById('signin-date');

        if (!startPowerBtn || !osBootScreen || !bootContent || !bootMessage || !signinScreen || !signinBtn) return;

        let signinClockInterval = null;

        function updateSigninClock() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            if (signinTimeEl) signinTimeEl.textContent = timeStr;
            if (signinDateEl) signinDateEl.textContent = dateStr;
        }

        // Shutdown trigger
        startPowerBtn.addEventListener('click', () => {
            closeStartMenu();
            
            // Show shutdown screen
            bootContent.style.display = 'flex';
            bootMessage.textContent = "Shutting down...";
            osBootScreen.removeAttribute('hidden');
            osBootScreen.style.opacity = '1';

            // After 2 seconds, show the goodbye message
            setTimeout(() => {
                bootMessage.innerHTML = "SEE YOU AGAIN,<br>KEEP VISIT";
            }, 2000);

            // After 5 seconds, hide shutdown and show Sign In screen
            setTimeout(() => {
                osBootScreen.style.opacity = '0';
                setTimeout(() => {
                    osBootScreen.setAttribute('hidden', '');
                    bootContent.style.display = 'flex';
                    bootMessage.textContent = "Shutting down...";

                    // Show sign-in screen
                    updateSigninClock();
                    signinScreen.removeAttribute('hidden');
                    signinScreen.style.opacity = '1';

                    // Start live clock on sign-in
                    signinClockInterval = setInterval(updateSigninClock, 1000);
                }, 600);
            }, 10000);
        });

        // Sign In → boot back to desktop
        signinBtn.addEventListener('click', () => {
            if (signinClockInterval) {
                clearInterval(signinClockInterval);
                signinClockInterval = null;
            }

            signinScreen.style.opacity = '0';
            setTimeout(() => {
                signinScreen.setAttribute('hidden', '');
                showToast("Welcome back, Pradip. Workstation ready.");
            }, 600);
        });
    }

});
