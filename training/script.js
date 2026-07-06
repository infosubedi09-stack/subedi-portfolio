/**
 * 7 Days Online AI Training Masterclass - Interactive Scripts
 * Handles Countdown Timer, Accordions, and Dynamic Particle Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initAccordions();
    initParticleCanvas();
});

/**
 * 1. LIVE COUNTDOWN TIMER
 * Today: 2083.03.19 BS (July 3, 2026). Month 03 has 32 days.
 * Training Start: 2083.04.01 BS at 7:30 PM (July 17, 2026 at 19:30:00 NPT).
 */
function initCountdown() {
    // 2083.04.01 at 7:30 PM corresponds to 2026-07-17T19:30:00+05:45
    const targetDate = new Date("2026-07-17T19:30:00+05:45").getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance <= 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minsEl.textContent = String(minutes).padStart(2, '0');
        secsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/**
 * 2. INTERACTIVE ACCORDIONS (Curriculum & FAQs)
 */
function initAccordions() {
    // 7-Day Curriculum Accordion
    const dayItems = document.querySelectorAll('.day-item');
    dayItems.forEach(item => {
        const header = item.querySelector('.day-header');
        const body = item.querySelector('.day-body');
        
        if (header && body) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Optional: close other open days for accordion feel
                dayItems.forEach(d => {
                    d.classList.remove('active');
                    const b = d.querySelector('.day-body');
                    if (b) b.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    body.style.maxHeight = body.scrollHeight + "px";
                }
            });
        }
    });

    // Automatically expand Day 1 on load
    if (dayItems.length > 0) {
        const firstDay = dayItems[0];
        firstDay.classList.add('active');
        const firstBody = firstDay.querySelector('.day-body');
        if (firstBody) firstBody.style.maxHeight = firstBody.scrollHeight + "px";
    }

    // FAQ Accordions
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(f => {
                    f.classList.remove('active');
                    const a = f.querySelector('.faq-answer');
                    if (a) a.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });
}

/**
 * 3. BACKGROUND PARTICLE CANVAS (Subtle Cyberpunk Floating Nodes)
 */
function initParticleCanvas() {
    const canvas = document.getElementById('ai-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(Math.floor(window.innerWidth / 15), 80);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.8 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(234, 214, 177, ${p.alpha})`;
            ctx.fill();

            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(234, 214, 177, ${(1 - dist / 120) * 0.15})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}
