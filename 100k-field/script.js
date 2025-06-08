// Central configuration for easy scaling/tweaking
const CONFIG = {
    totalSquares: window.innerWidth < 600 ? 50 : 100, // change for production
    foregroundCount: 11,
    squareSize: 20,
    highlightColor: '#FFF8A3',
    searchAnimationDuration: 600,
};

// Simple easing function for smooth transitions
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Tween helper to interpolate square position
function animatePosition(square, target, duration, easing = easeOutCubic) {
    square.tween = {
        start: performance.now(),
        duration,
        from: { x: square.x, y: square.y, z: square.z },
        to: target,
        easing,
    };
}

// Canvas setup
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
resize();
window.addEventListener('resize', resize);

// Square object template
class Square {
    constructor(id) {
        this.id = id;
        this.x = Math.random();
        this.y = Math.random();
        this.z = Math.random();
        this.status = 'empty';
        // velocity for random walk
        this.vx = (Math.random() - 0.5) * 0.001;
        this.vy = (Math.random() - 0.5) * 0.001;
        this.vz = (Math.random() - 0.5) * 0.001;
        this.tween = null;
    }
    update() {
        if (this.tween) {
            const now = performance.now();
            const t = Math.min((now - this.tween.start) / this.tween.duration, 1);
            const eased = this.tween.easing(t);
            this.x = this.tween.from.x + (this.tween.to.x - this.tween.from.x) * eased;
            this.y = this.tween.from.y + (this.tween.to.y - this.tween.from.y) * eased;
            this.z = this.tween.from.z + (this.tween.to.z - this.tween.from.z) * eased;
            if (t === 1) this.tween = null;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            // wrap around [0,1]
            this.x = (this.x + 1) % 1;
            this.y = (this.y + 1) % 1;
            this.z = (this.z + 1) % 1;
        }
    }
}

// Generate squares
const squares = [];
for (let i = 1; i <= CONFIG.totalSquares; i++) {
    squares.push(new Square(i));
}

let highlighted = null;
let hovered = null;

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    squares.forEach(sq => {
        sq.update();
        const scale = 0.5 + sq.z; // depth scaling
        const size = CONFIG.squareSize * scale;
        let alpha = 0.3 + sq.z * 0.7;
        const x = sq.x * canvas.width;
        const y = sq.y * canvas.height;

        if (sq.status === 'reserved') {
            alpha *= 0.5;
            ctx.fillStyle = `rgba(180,180,180,${alpha})`;
        } else {
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        }

        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        // highlight outline for hovered or searched square
        if (highlighted === sq || hovered === sq) {
            ctx.strokeStyle = CONFIG.highlightColor;
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(255, 248, 163, 0.9)';
            ctx.shadowBlur = 6;
            ctx.strokeRect(x - size / 2 - 1, y - size / 2 - 1, size + 2, size + 2);
            ctx.shadowBlur = 0;
        }
    });

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// Search logic
const searchInput = document.getElementById('search');
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const id = parseInt(searchInput.value, 10);
        const sq = squares.find(s => s.id === id);
        if (sq) {
            highlighted = sq;
            animatePosition(sq, { x: 0.5, y: 0.5, z: 1 }, CONFIG.searchAnimationDuration);
        }
    }
});

// Buy logic
const buyBtn = document.getElementById('buy');
buyBtn.addEventListener('click', () => {
    const next = squares.find(s => s.status === 'empty');
    if (next) {
        next.status = 'reserved';
        const url = `https://ko-fi.com/YourPage/?utm_source=field&utm_medium=web&utm_campaign=id_${next.id}`; // TODO replace with your Ko-fi page
        window.open(url, '_blank');
    }
});

// Tooltip logic
const tooltip = document.getElementById('tooltip');
let tooltipTimer = null;

function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.style.left = x + 10 + 'px';
    tooltip.style.top = y + 10 + 'px';
    tooltip.classList.add('visible');
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => tooltip.classList.remove('visible'), 3000);
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

function handleHover(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const hover = squares.find(sq => {
        const scale = 0.5 + sq.z;
        const size = CONFIG.squareSize * scale;
        const sx = sq.x * canvas.width;
        const sy = sq.y * canvas.height;
        return Math.abs(x - sx) <= size / 2 && Math.abs(y - sy) <= size / 2;
    });
    hovered = hover || null;
    if (hover) {
        const label = hover.status === 'filled' ? `ID: ${hover.id}` :
            `ID: ${hover.id} — ${hover.status === 'reserved' ? 'Reserved' : 'Available'}`;
        showTooltip(label, clientX, clientY);
    } else {
        hideTooltip();
    }
}

canvas.addEventListener('mousemove', e => handleHover(e.clientX, e.clientY));
canvas.addEventListener('mouseleave', () => { hideTooltip(); hovered = null; });
canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (t) handleHover(t.clientX, t.clientY);
});
canvas.addEventListener('touchend', () => { hideTooltip(); hovered = null; });

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
