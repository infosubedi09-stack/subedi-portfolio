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
    initSafely('VisitorCounter', initVisitorCounter);
    initSafely('AIFaceGame', initAIFaceGame);
    initSafely('DrivingGame', initDrivingGame);

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
       LIVE WEBSITE VISITOR COUNTER ENGINE
       ========================================================================== */
    function initVisitorCounter() {
        const countEl = document.getElementById('visitor-count-text');
        const badgeEl = document.getElementById('visitor-counter-tray');
        if (!countEl || !badgeEl) return;

        // Retrieve stored local visits or default to 1
        let localVisits = parseInt(localStorage.getItem('portfolio_real_visits'), 10);
        if (isNaN(localVisits) || localVisits < 1) {
            localVisits = 1;
        }

        // Increment local visit once per browser session
        if (!sessionStorage.getItem('portfolio_live_session_counted')) {
            localVisits += 1;
            localStorage.setItem('portfolio_real_visits', localVisits);
            sessionStorage.setItem('portfolio_live_session_counted', 'true');
        }

        // Display local estimate while fetching live global count
        countEl.textContent = localVisits.toLocaleString();

        // Fetch true global live count from API across all devices
        fetch('https://api.counterapi.dev/v1/pradipsubedi_portfolio_live_v1/visits/up')
            .then(response => response.json())
            .then(data => {
                if (data && typeof data.count === 'number' && data.count > 0) {
                    countEl.textContent = data.count.toLocaleString();
                    localStorage.setItem('portfolio_real_visits', data.count);
                }
            })
            .catch(() => {
                // Keep local count if offline or API blocked
            });

        // Click interaction: show toast alert
        badgeEl.addEventListener('click', () => {
            showToast(`👁️ Workstation Traffic: ${countEl.textContent} Total Unique Visits Globally`);
        });
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
        const shortcuts = document.querySelectorAll('.desktop-shortcut, .ai-launcher-card');
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
        // Retrieve theme state from localStorage (default to light mode)
        const localTheme = localStorage.getItem('desktopTheme');
        if (localTheme === 'dark') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
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
            ? 'rgba(234, 214, 177, 0.05)' 
            : 'rgba(45, 76, 52, 0.05)';
    }

    function getParticleColor() {
        return body.classList.contains('dark-theme')
            ? 'rgba(234, 214, 177, 0.25)'
            : 'rgba(45, 76, 52, 0.25)';
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
                    "Relax Me.jpeg": { type: "file", fileType: "image", src: "images/This PC/Relax Me.jpeg" },
                    "Trainer1.jpeg": { type: "file", fileType: "image", src: "images/This PC/Trainer1.jpeg" }
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

    /* ==========================================================================
       AI FACIAL EXPRESSION GAME & MOOD DETECTOR ENGINE
       ========================================================================== */
    function initAIFaceGame() {
        const win = document.getElementById('aigame-window');
        const video = document.getElementById('webcam-video');
        const canvas = document.getElementById('webcam-overlay');
        const placeholder = document.getElementById('camera-placeholder');
        const laser = document.getElementById('scanning-laser');
        const statusText = document.getElementById('ai-status-text');
        const btnStart = document.getElementById('btn-start-camera');
        const btnStop = document.getElementById('btn-stop-camera');
        const domEmotion = document.getElementById('ai-dominant-emotion');
        const commentaryText = document.getElementById('ai-commentary-text');

        // Mode elements
        const btnModeMood = document.getElementById('btn-mode-mood');
        const btnModeGame = document.getElementById('btn-mode-game');
        const panelModeMood = document.getElementById('panel-mode-mood');
        const panelModeGame = document.getElementById('panel-mode-game');

        // Game elements
        const btnStartGame = document.getElementById('btn-start-game');
        const targetPrompt = document.getElementById('game-target-prompt');
        const gameInstructions = document.getElementById('game-instructions');
        const scoreVal = document.getElementById('game-score-val');
        const timerVal = document.getElementById('game-timer-val');
        const streakVal = document.getElementById('game-streak-val');

        if (!win || !video || !canvas || !btnStart) return;

        let modelsLoaded = false;
        let isScanning = false;
        let videoStream = null;
        let detectInterval = null;

        // Game state
        let gameActive = false;
        let gameScore = 0;
        let gameStreak = 0;
        let gameTimer = 15;
        let gameTimerInterval = null;
        let currentTarget = null;

        const emotionsList = ['happy', 'surprised', 'neutral', 'angry', 'sad'];
        const emojiMap = {
            happy: '😄',
            surprised: '😲',
            neutral: '😐',
            angry: '😡',
            sad: '😢',
            fearful: '😱',
            disgusted: '🤢'
        };

        const commentaryMap = {
            happy: {
                title: "😄 Happy & High Energy!",
                text: "Incredible positive vibes! You look ready to deploy scalable cloud architectures, train deep neural networks, and drive record-breaking SEO growth! Let's build something awesome today! 🚀"
            },
            surprised: {
                title: "😲 Astonished / Surprised!",
                text: "Whoa! Did you just see Pradip Subedi's MCA Distinction grades from IGNOU or his incredible digital marketing conversion rates?! Prepare to be wowed by this Windows 11 portfolio! 📈✨"
            },
            neutral: {
                title: "😐 Calm & Focused Professional",
                text: "Cool, calm, and collected—just like an enterprise Linux server maintaining 99.99% uptime! Perfect mindset for complex algorithmic problem-solving and IT infrastructure management! 💻⚡"
            },
            angry: {
                title: "😡 Deep Concentration / Debug Mode",
                text: "Intense debugging focus detected! Tackling tough code or algorithmic bottlenecks? Take a sip of tea ☕, trust your unit tests, and let's crush those bugs together! 🛠️🔥"
            },
            sad: {
                title: "😢 Thoughtful / Contemplative",
                text: "Aww, don't feel down! Even the most advanced neural networks experience high loss before converging to optimal solutions! Keep going, success is just one epoch away! 🫂✨"
            },
            fearful: {
                title: "😱 High Alert / Cybersecurity Mode",
                text: "Security sensors tingling?! Don't worry! Our automated cybersecurity governance (BlockSmartGov) and firewall protocols are fully active! Your session is 100% secure! 🛡️🔒"
            },
            disgusted: {
                title: "🤢 Code Refactoring Alert!",
                text: "Did you just catch a glimpse of unoptimized legacy spaghetti code or keyword stuffing?! Let Pradip refactor and clean it up with modern best practices! 🧹🚀"
            }
        };

        // Mode Switching
        if (btnModeMood && btnModeGame) {
            btnModeMood.addEventListener('click', () => {
                btnModeMood.classList.add('active');
                btnModeGame.classList.remove('active');
                panelModeMood.style.display = 'flex';
                panelModeGame.style.display = 'none';
            });

            btnModeGame.addEventListener('click', () => {
                btnModeGame.classList.add('active');
                btnModeMood.classList.remove('active');
                panelModeGame.style.display = 'flex';
                panelModeMood.style.display = 'none';
            });
        }

        // Start Camera Button Handler
        btnStart.addEventListener('click', async () => {
            if (typeof faceapi === 'undefined') {
                statusText.textContent = "❌ Error: face-api library failed to load. Please check internet connection.";
                showToast("Failed to load face-api neural networks!");
                return;
            }

            try {
                btnStart.disabled = true;
                if (!modelsLoaded) {
                    statusText.textContent = "⏳ Downloading AI Neural Models (~2.5 MB)... Please wait...";
                    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model/';
                    await Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                    ]);
                    modelsLoaded = true;
                }

                statusText.textContent = "📸 Requesting webcam permission...";
                videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
                    audio: false
                });

                video.srcObject = videoStream;
                video.onloadedmetadata = () => {
                    video.play();
                    isScanning = true;
                    placeholder.style.opacity = '0';
                    setTimeout(() => placeholder.hidden = true, 300);
                    if (laser) laser.hidden = false;
                    document.getElementById('camera-frame').classList.add('scanning');
                    
                    btnStart.hidden = true;
                    btnStart.disabled = false;
                    btnStop.hidden = false;
                    
                    statusText.textContent = "✅ AI Neural Network Active | Analyzing facial expressions...";
                    showToast("🚀 AI Facial Scanner Initialized!");
                    startDetectionLoop();
                };

            } catch (err) {
                console.error("[AI Scanner] Error:", err);
                btnStart.disabled = false;
                statusText.textContent = "❌ Camera permission denied or device unavailable!";
                showToast("Camera access required for AI Expression Scanner!");
            }
        });

        // Stop Camera Handler
        btnStop.addEventListener('click', () => {
            stopCamera();
        });

        // Also stop camera if window is closed
        const closeBtn = win.querySelector('.win-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                stopCamera();
            });
        }


        function stopCamera() {
            isScanning = false;
            if (detectInterval) {
                clearInterval(detectInterval);
                detectInterval = null;
            }
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoStream = null;
            }
            if (video) video.srcObject = null;

            if (laser) laser.hidden = true;
            document.getElementById('camera-frame').classList.remove('scanning');
            if (placeholder) {
                placeholder.hidden = false;
                placeholder.style.opacity = '1';
            }
            
            btnStop.hidden = true;
            btnStart.hidden = false;
            statusText.textContent = "Camera offline. Click above to launch AI scanner.";
            
            // Stop game if active
            if (gameActive) {
                endGame();
            }
        }

        function startDetectionLoop() {
            if (detectInterval) clearInterval(detectInterval);

            detectInterval = setInterval(async () => {
                if (!isScanning || !video || video.paused || video.ended) return;

                const displaySize = { width: video.clientWidth || 640, height: video.clientHeight || 480 };
                if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
                    faceapi.matchDimensions(canvas, displaySize);
                }

                try {
                    const detections = await faceapi.detectSingleFace(
                        video, 
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
                    ).withFaceExpressions();

                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (detections) {
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        const box = resizedDetections.detection.box;

                        // Draw futuristic cyan bounding box around face
                        ctx.strokeStyle = '#00F2FE';
                        ctx.lineWidth = 3;
                        ctx.shadowColor = '#00F2FE';
                        ctx.shadowBlur = 12;
                        ctx.strokeRect(box.x, box.y, box.width, box.height);
                        ctx.shadowBlur = 0;

                        // Draw corner brackets for tech aesthetic
                        const len = Math.min(box.width, box.height) * 0.2;
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 4;
                        // Top-left
                        ctx.beginPath(); ctx.moveTo(box.x, box.y + len); ctx.lineTo(box.x, box.y); ctx.lineTo(box.x + len, box.y); ctx.stroke();
                        // Top-right
                        ctx.beginPath(); ctx.moveTo(box.x + box.width - len, box.y); ctx.lineTo(box.x + box.width, box.y); ctx.lineTo(box.x + box.width, box.y + len); ctx.stroke();
                        // Bottom-left
                        ctx.beginPath(); ctx.moveTo(box.x, box.y + box.height - len); ctx.lineTo(box.x, box.y + box.height); ctx.lineTo(box.x + len, box.y + box.height); ctx.stroke();
                        // Bottom-right
                        ctx.beginPath(); ctx.moveTo(box.x + box.width - len, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height); ctx.lineTo(box.x + box.width, box.y + box.height - len); ctx.stroke();

                        // Process expressions
                        const expressions = detections.expressions;
                        updateEmotionBars(expressions);
                        updateAICommentary(expressions);

                        if (gameActive) {
                            checkGameProgress(expressions);
                        }
                    } else {
                        statusText.textContent = "🔍 Looking for face in frame...";
                    }
                } catch (e) {
                    console.error("[AI Loop Error]", e);
                }
            }, 200); // 5 FPS
        }

        function updateEmotionBars(expressions) {
            let dominant = 'neutral';
            let maxScore = 0;

            const targets = ['happy', 'surprised', 'neutral', 'angry', 'sad'];
            targets.forEach(emo => {
                const val = expressions[emo] || 0;
                if (val > maxScore) {
                    maxScore = val;
                    dominant = emo;
                }
                const pct = Math.round(val * 100);
                const barEl = document.getElementById(`bar-${emo}`);
                const scoreEl = document.getElementById(`score-${emo}`);
                if (barEl) barEl.style.width = `${pct}%`;
                if (scoreEl) scoreEl.textContent = `${pct}%`;
            });

            if (statusText && isScanning) {
                statusText.textContent = `✅ AI Tracking Active | Dominant: ${dominant.toUpperCase()} (${Math.round(maxScore * 100)}%)`;
            }
        }

        let lastCommentaryEmotion = null;
        function updateAICommentary(expressions) {
            let dominant = 'neutral';
            let maxScore = 0;

            Object.keys(expressions).forEach(emo => {
                if (expressions[emo] > maxScore) {
                    maxScore = expressions[emo];
                    dominant = emo;
                }
            });

            // Only update commentary if confidence > 50% and emotion changed
            if (maxScore > 0.5 && dominant !== lastCommentaryEmotion && commentaryMap[dominant]) {
                lastCommentaryEmotion = dominant;
                const info = commentaryMap[dominant];
                if (domEmotion) domEmotion.textContent = info.title;
                if (commentaryText) commentaryText.textContent = info.text;
            }
        }

        /* --- THE EXPRESSION CHALLENGE GAME MODE --- */
        if (btnStartGame) {
            btnStartGame.addEventListener('click', () => {
                if (!isScanning) {
                    showToast("⚠️ Please start the camera first!");
                    // Trigger camera start
                    btnStart.click();
                    return;
                }
                if (!gameActive) {
                    startNewGame();
                } else {
                    endGame();
                }
            });
        }

        function startNewGame() {
            gameActive = true;
            gameScore = 0;
            gameStreak = 0;
            gameTimer = 20;
            if (scoreVal) scoreVal.textContent = "0";
            if (streakVal) streakVal.textContent = "0🔥";
            if (timerVal) timerVal.textContent = "20s";
            
            btnStartGame.innerHTML = '<span>⏹️ End Challenge</span>';
            btnStartGame.style.background = 'rgba(255, 80, 80, 0.2)';
            btnStartGame.style.color = '#ff6b6b';

            showToast("🎮 Expression Challenge Started!");
            pickNextTarget();

            if (gameTimerInterval) clearInterval(gameTimerInterval);
            gameTimerInterval = setInterval(() => {
                gameTimer--;
                if (timerVal) timerVal.textContent = `${gameTimer}s`;
                if (gameTimer <= 0) {
                    endGame(true);
                }
            }, 1000);
        }

        function pickNextTarget() {
            const available = emotionsList.filter(e => e !== currentTarget);
            currentTarget = available[Math.floor(Math.random() * available.length)];
            const emoji = emojiMap[currentTarget] || '';
            if (targetPrompt) targetPrompt.textContent = `Make a ${currentTarget.toUpperCase()} ${emoji} face!`;
            if (gameInstructions) gameInstructions.textContent = `Quick! Show your best ${currentTarget.toUpperCase()} expression to the camera before time runs out!`;
        }

        function checkGameProgress(expressions) {
            if (!currentTarget) return;
            const currentScore = expressions[currentTarget] || 0;

            // If user matches target expression with > 70% confidence
            if (currentScore > 0.70) {
                gameScore += 100 + (gameStreak * 20);
                gameStreak++;
                gameTimer += 3; // Bonus time!

                if (scoreVal) scoreVal.textContent = gameScore;
                if (streakVal) streakVal.textContent = `${gameStreak}🔥`;
                if (timerVal) timerVal.textContent = `${gameTimer}s`;

                showConfetti();
                showToast(`🎉 Awesome ${currentTarget.toUpperCase()} face! +100 Points!`);
                pickNextTarget();
            }
        }

        function endGame(timeOut = false) {
            gameActive = false;
            if (gameTimerInterval) clearInterval(gameTimerInterval);
            gameTimerInterval = null;
            currentTarget = null;

            if (btnStartGame) {
                btnStartGame.innerHTML = '<span>🏁 Start Challenge!</span>';
                btnStartGame.style.background = '';
                btnStartGame.style.color = '';
            }

            if (timeOut) {
                if (targetPrompt) targetPrompt.textContent = `⏰ Time's Up! Final Score: ${gameScore}`;
                if (gameInstructions) gameInstructions.textContent = `You achieved a streak of ${gameStreak}! Click below to try again and beat your high score!`;
                showToast(`🏁 Challenge Ended! Final Score: ${gameScore}`);
            } else {
                if (targetPrompt) targetPrompt.textContent = "Ready to Play?";
                if (gameInstructions) gameInstructions.textContent = "Test your facial acting skills against our AI! Match the prompted emotions before the timer runs out to score points.";
            }
        }

        function showConfetti() {
            const panel = document.getElementById('panel-mode-game') || document.body;
            const colors = ['#00F2FE', '#4FACFE', '#88B04B', '#EAD6B1', '#ff4b2b', '#ffeb3b'];
            for (let i = 0; i < 30; i++) {
                const conf = document.createElement('div');
                conf.className = 'confetti-piece';
                conf.style.left = `${Math.random() * 80 + 10}%`;
                conf.style.top = '10%';
                conf.style.background = colors[Math.floor(Math.random() * colors.length)];
                conf.style.animationDelay = `${Math.random() * 0.3}s`;
                panel.appendChild(conf);
                setTimeout(() => conf.remove(), 2500);
            }
        }
    }

    /* ==========================================================================
       DRIVING GAME LOGIC
       ========================================================================== */
    function initDrivingGame() {
        const toggle = document.getElementById('driving-light-toggle');
        const container = document.getElementById('driving-game-container');
        const canvas = document.getElementById('driving-game-canvas');
        const startBtn = document.getElementById('start-driving-game-btn');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let isNightMode = false;
        let isPlaying = false;
        let animationId;
        
        // Assets
        const bgImg = new Image();
        bgImg.src = 'images/bg_mountains.png';
        const wheelImg = new Image();
        wheelImg.src = 'images/steering-wheel.png';
        const hornSound = new Audio('audio/mixkit-car-horn-718.wav');
        
        // Game State
        let speed = 0;
        let maxSpeed = 150;
        let playerZ = 0;
        let playerX = 0;
        const segmentLength = 200;
        const roadWidth = 2000;
        const cameraDepth = 0.84;
        const drawDistance = 300;
        const segments = [];
        const trackLength = 10000;
        
        // Build Track
        function buildTrack() {
            segments.length = 0;
            for(let n = 0; n < trackLength; n++) {
                let curve = 0;
                let y = 0;
                // Add some curves and hills (Nepali roads are winding!)
                if(n > 100 && n < 300) curve = 2;
                if(n > 400 && n < 600) curve = -2;
                if(n > 700 && n < 1200) y = Math.sin(n / 40.0) * 1500;
                if(n > 1500 && n < 2000) curve = 3;
                
                // Add trees/houses
                let sprite = null;
                if(n % 20 === 0) sprite = { type: 'tree', offset: -1.5 };
                if(n % 30 === 0) sprite = { type: 'tree', offset: 1.5 };
                if(n % 100 === 0) sprite = { type: 'house', offset: -2.0 };
                
                segments.push({
                    index: n,
                    p1: { world: { z: n * segmentLength }, camera: {}, screen: {} },
                    p2: { world: { z: (n + 1) * segmentLength }, camera: {}, screen: {} },
                    curve: curve,
                    y: y,
                    sprite: sprite,
                    color: Math.floor(n / 3) % 2 ? { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555', lane: '#CCCCCC' } 
                                                 : { road: '#6B6B6B', grass: '#009A00', rumble: '#FFFFFF', lane: '#6B6B6B' }
                });
            }
        }
        buildTrack();
        
        // Handle Day/Night Toggle
        toggle.addEventListener('change', (e) => {
            isNightMode = !e.target.checked;
            if (isNightMode) container.classList.add('night-mode');
            else container.classList.remove('night-mode');
            if (!isPlaying) render(); // Re-render static scene
        });
        
        // Controls
        let keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, h: false };
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (keys.hasOwnProperty(e.key) || key === 'h') {
                if (key === 'h') {
                    keys['h'] = true;
                    hornSound.currentTime = 0;
                    hornSound.play();
                } else {
                    keys[e.key] = true;
                    if(isPlaying) e.preventDefault();
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (keys.hasOwnProperty(e.key) || key === 'h') {
                if (key === 'h') keys['h'] = false;
                else keys[e.key] = false;
            }
        });
        
        startBtn.addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                playerZ = 0;
                speed = 0;
                playerX = 0;
                startBtn.textContent = "Playing (Arrows to Drive, H to Honk)";
                gameLoop();
            }
        });
        
        function project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
            p.camera.x = (p.world.x || 0) - cameraX;
            p.camera.y = (p.world.y || 0) - cameraY;
            p.camera.z = (p.world.z || 0) - cameraZ;
            p.screen.scale = cameraDepth / (p.camera.z || 1); // prevent div by zero
            p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
            p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
            p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2));
        }
        
        function drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x3, y3);
            ctx.lineTo(x4, y4);
            ctx.fill();
        }
        
        function drawSprite(ctx, type, screenX, screenY, scale) {
            if (type === 'tree') {
                const w = 600 * scale;
                const h = 800 * scale;
                const sx = screenX - w / 2;
                const sy = screenY - h;
                
                // Draw trunk
                ctx.fillStyle = isNightMode ? '#1e1410' : '#5D4037';
                ctx.fillRect(sx + w*0.4, sy + h*0.7, w*0.2, h*0.3);
                // Draw leaves
                ctx.fillStyle = isNightMode ? '#0b240f' : '#2E7D32';
                ctx.beginPath(); ctx.moveTo(sx + w*0.5, sy); ctx.lineTo(sx + w, sy + h*0.75); ctx.lineTo(sx, sy + h*0.75); ctx.fill();
                ctx.fillStyle = isNightMode ? '#113511' : '#43A047';
                ctx.beginPath(); ctx.moveTo(sx + w*0.5, sy + h*0.1); ctx.lineTo(sx + w*0.9, sy + h*0.5); ctx.lineTo(sx + w*0.1, sy + h*0.5); ctx.fill();
            } else if (type === 'house') {
                const w = 800 * scale;
                const h = 600 * scale;
                const sx = screenX - w / 2;
                const sy = screenY - h;
                
                // Draw base
                ctx.fillStyle = isNightMode ? '#2a201c' : '#D7CCC8';
                ctx.fillRect(sx + w*0.1, sy + h*0.4, w*0.8, h*0.6);
                // Draw roof
                ctx.fillStyle = isNightMode ? '#1e1410' : '#8D6E63';
                ctx.beginPath(); ctx.moveTo(sx + w*0.5, sy); ctx.lineTo(sx + w, sy + h*0.4); ctx.lineTo(sx, sy + h*0.4); ctx.fill();
                // Draw window (illuminated at night!)
                if (isNightMode) {
                    ctx.fillStyle = '#FFF59D'; // Bright yellow light
                    // glow
                    ctx.shadowColor = '#FFF59D';
                    ctx.shadowBlur = 15 * scale;
                } else {
                    ctx.fillStyle = '#81D4FA'; // Glass reflection
                }
                ctx.fillRect(sx + w*0.3, sy + h*0.55, w*0.15, h*0.2);
                ctx.shadowBlur = 0; // reset
            }
        }
        
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw Sky/Mountains
            if (bgImg.complete && bgImg.naturalWidth > 0) {
                // simple parallax
                const skyOffset = -(playerX * 100) % canvas.width;
                ctx.drawImage(bgImg, skyOffset, 0, canvas.width, canvas.height / 2 + 50);
                if(skyOffset > 0) ctx.drawImage(bgImg, skyOffset - canvas.width, 0, canvas.width, canvas.height / 2 + 50);
                if(skyOffset < 0) ctx.drawImage(bgImg, skyOffset + canvas.width, 0, canvas.width, canvas.height / 2 + 50);
            } else {
                ctx.fillStyle = isNightMode ? '#0b0c10' : '#87CEEB';
                ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
            }
            
            // Apply night tint over sky/mountains
            if (isNightMode) {
                ctx.fillStyle = 'rgba(10, 20, 35, 0.85)';
                ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + 50);
            }
            
            let baseSegment = segments[Math.floor(playerZ / segmentLength) % trackLength];
            let cameraX = playerX * roadWidth;
            let cameraY = 1000 + (baseSegment.y || 0);
            let maxy = canvas.height;
            let x = 0;
            let dx = - (baseSegment.curve * (playerZ % segmentLength) / segmentLength);
            
            const renderData = [];
            
            for (let n = 0; n < drawDistance; n++) {
                let segment = segments[(baseSegment.index + n) % trackLength];
                segment.p1.world.y = segment.y;
                segment.p2.world.y = segment.y;
                
                project(segment.p1, cameraX - x, cameraY, playerZ - (n === 0 ? 1 : 0), cameraDepth, canvas.width, canvas.height, roadWidth);
                project(segment.p2, cameraX - x - dx, cameraY, playerZ, cameraDepth, canvas.width, canvas.height, roadWidth);
                
                x += dx;
                dx += segment.curve;
                
                if (segment.p1.camera.z <= cameraDepth || segment.p2.screen.y >= maxy) continue;
                maxy = segment.p2.screen.y;
                
                renderData.push(segment);
                
                let grassColor = color.grass = segment.color.grass;
                let roadColor = color.road = segment.color.road;
                let rumbleColor = color.rumble = segment.color.rumble;
                let laneColor = color.lane = segment.color.lane;
                
                // Headlight & Night time shading logic
                if (isNightMode) {
                    // Darken colors based on distance
                    let distFactor = 1 - (n / drawDistance);
                    let fade = Math.max(0.1, distFactor * 0.4); // Very dark ambient
                    
                    grassColor = n % 2 ? `rgba(15, 32, 15, ${fade})` : `rgba(11, 22, 11, ${fade})`;
                    roadColor = `rgba(34, 34, 34, ${fade})`;
                    rumbleColor = n % 2 ? `rgba(102, 102, 102, ${fade})` : `rgba(51, 51, 51, ${fade})`;
                    laneColor = `rgba(85, 85, 85, ${fade})`;
                    
                    // Headlight effect: brightly illuminate the first 40 segments
                    if (n < 45) {
                        let lightFactor = Math.max(0, 1 - (n / 45)); // 1 near, 0 far
                        let rC = Math.floor(34 + 100 * lightFactor);
                        roadColor = `rgb(${rC}, ${rC}, ${rC})`;
                        
                        let lC = Math.floor(85 + 170 * lightFactor);
                        laneColor = `rgb(${lC}, ${lC}, ${lC})`;
                        
                        if (segment.color.rumble === '#FFFFFF') {
                            rumbleColor = `rgb(${Math.floor(255*lightFactor + 51)}, ${Math.floor(255*lightFactor + 51)}, ${Math.floor(255*lightFactor + 51)})`;
                        } else {
                            let rmC = Math.floor(85 + 85 * lightFactor);
                            rumbleColor = `rgb(${rmC}, ${rmC}, ${rmC})`;
                        }
                        
                        grassColor = n % 2 ? `rgb(${16 + 20*lightFactor}, ${170*lightFactor}, ${16 + 20*lightFactor})` 
                                           : `rgb(${0}, ${154*lightFactor}, ${0})`;
                    }
                }
                
                // Base grass background for segment
                ctx.fillStyle = grassColor;
                ctx.fillRect(0, segment.p2.screen.y, canvas.width, segment.p1.screen.y - segment.p2.screen.y + 1);
                
                let p1 = segment.p1.screen;
                let p2 = segment.p2.screen;
                
                // Draw Road
                drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, roadColor);
                
                // Draw Rumble strips
                let r1 = p1.w / 5;
                let r2 = p2.w / 5;
                drawPolygon(ctx, p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y, rumbleColor);
                drawPolygon(ctx, p1.x + p1.w, p1.y, p1.x + p1.w + r1, p1.y, p2.x + p2.w + r2, p2.y, p2.x + p2.w, p2.y, rumbleColor);
                
                // Draw Lane
                if (color.lane !== color.road) {
                    let l1 = p1.w / 30;
                    let l2 = p2.w / 30;
                    drawPolygon(ctx, p1.x - l1, p1.y, p1.x + l1, p1.y, p2.x + l2, p2.y, p2.x - l2, p2.y, laneColor);
                }
            }
            
            // Draw sprites (back to front)
            for (let i = renderData.length - 1; i >= 0; i--) {
                let segment = renderData[i];
                if (segment.sprite) {
                    let spriteX = segment.p1.screen.x + segment.p1.screen.scale * segment.sprite.offset * roadWidth * canvas.width / 2;
                    drawSprite(ctx, segment.sprite.type, spriteX, segment.p1.screen.y, segment.p1.screen.scale);
                }
            }
            
            // Draw Steering Wheel / Dashboard
            let wheelRot = 0;
            if (keys.ArrowLeft) wheelRot = -0.4;
            if (keys.ArrowRight) wheelRot = 0.4;
            
            if (wheelImg.complete && wheelImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height);
                ctx.rotate(wheelRot);
                // Scale wheel to fit nicely
                const wSize = 500;
                ctx.drawImage(wheelImg, -wSize/2, -wSize/2 + 20, wSize, wSize);
                ctx.restore();
            } else {
                // Fallback Dashboard
                ctx.fillStyle = '#111';
                ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
                // Fallback wheel
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height - 40);
                ctx.rotate(wheelRot);
                ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2);
                ctx.lineWidth = 15; ctx.strokeStyle = '#444'; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.stroke();
                ctx.restore();
            }
        }
        
        function updateLogic() {
            // Speed control
            if (keys.ArrowUp) speed += 2;
            else if (keys.ArrowDown) speed -= 3;
            else speed -= 1; // friction
            
            speed = Math.max(0, Math.min(speed, maxSpeed));
            playerZ += speed;
            
            // Steering
            if (speed > 0) {
                if (keys.ArrowLeft) playerX -= 0.05 * (speed / maxSpeed);
                if (keys.ArrowRight) playerX += 0.05 * (speed / maxSpeed);
                
                // Centering force based on curve
                let baseSegment = segments[Math.floor(playerZ / segmentLength) % trackLength];
                playerX -= (speed / maxSpeed) * baseSegment.curve * 0.02;
            }
            
            // Off road deceleration (bumpy grass)
            if (Math.abs(playerX) > 1.2) {
                speed = Math.max(10, speed - 5);
            }
        }
        
        function gameLoop() {
            if (!isPlaying) return;
            updateLogic();
            render();
            animationId = requestAnimationFrame(gameLoop);
        }
        
        // Setup initial scene immediately
        setTimeout(render, 500); // Give images a moment to load
    }

});

