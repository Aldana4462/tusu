// Central configuration for easy scaling/tweaking
const CONFIG = {
    totalSquares: window.innerWidth < 600 ? 50 : 100, // change for production
    squareSize: 20,
    driftAmplitude: 30,      // px movement from base position
    driftSpeed: 0.00006,     // radians per ms for peaceful motion
    breathAmplitude: 0.05,   // ±5% scaling
    breathPeriod: 7,         // seconds per full cycle
    highlightColor: '#FFD700',
    searchAnimationDuration: 600,
    ambientGlowColor: 'rgba(255, 248, 163, 0.3)',
    ambientGlowSpread: 12,
    backgroundLightCount: 50,
    backgroundLightColor: 'rgba(255,255,255,0.05)',
    backgroundFlickerSpeed: 0.002,
};

// Custom data for filled squares.
// Add entries with id as key to display images and links per square.
// Example shows square 0 with demo content.
const SQUARE_CONTENT = {
    0: {
        status: 'filled',
        image: 'https://imgur.com/a/1deHkhf',
        message: 'compra en tusu.com.ar',
        link: 'https://tusu.com.ar',
    },
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

// Prepare square collection before first resize
const squares = [];

let prevWidth = window.innerWidth;
let prevHeight = window.innerHeight;
resize();
window.addEventListener('resize', resize);

// Square object template
class Square {
    constructor(id, options = {}) {
        this.id = id;
        // Base position in pixels
        this.baseX = Math.random() * canvas.width;
        this.baseY = Math.random() * canvas.height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.z = Math.random();
        this.status = options.status || 'empty';
        this.message = options.message || '';
        this.link = options.link || '';
        this.image = options.image || null;
        this.imageObj = null;
        if (this.image) {
            this.imageObj = new Image();
            this.imageObj.src = this.image;
        }
        // Unique phase so each square moves differently
        this.phase = Math.random() * Math.PI * 2;
        this.tween = null;
    }
    update(time) {
        if (this.tween) {
            const elapsed = performance.now();
            const t = Math.min((elapsed - this.tween.start) / this.tween.duration, 1);
            const eased = this.tween.easing(t);
            this.x = this.tween.from.x + (this.tween.to.x - this.tween.from.x) * eased;
            this.y = this.tween.from.y + (this.tween.to.y - this.tween.from.y) * eased;
            this.z = this.tween.from.z + (this.tween.to.z - this.tween.from.z) * eased;
            if (t === 1) this.tween = null;
        } else {
            const angle = time * CONFIG.driftSpeed;
            this.x = this.baseX + Math.sin(angle + this.phase) * CONFIG.driftAmplitude;
            this.y = this.baseY + Math.cos(angle * 0.7 + this.phase * 1.3) * CONFIG.driftAmplitude;

            // keep within view
            const half = CONFIG.squareSize / 2;
            this.x = Math.max(half, Math.min(canvas.width - half, this.x));
            this.y = Math.max(half, Math.min(canvas.height - half, this.y));
        }
    }
}

// Generate squares from custom data then fill remaining ids
Object.keys(SQUARE_CONTENT).forEach(id => {
    squares.push(new Square(parseInt(id, 10), SQUARE_CONTENT[id]));
});

for (let i = 1; i <= CONFIG.totalSquares; i++) {
    if (!SQUARE_CONTENT[i]) {
        squares.push(new Square(i));
    }
}

let backgroundLights = null;

function initBackgroundLights() {
    backgroundLights = Array.from({ length: CONFIG.backgroundLightCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseAlpha: Math.random() * 0.1,
        flickerOffset: Math.random() * 1000,
    }));
}

function drawBackgroundLights(time) {
    if (!backgroundLights) initBackgroundLights();
    backgroundLights.forEach(light => {
        const alpha = light.baseAlpha + 0.05 * Math.sin(time * CONFIG.backgroundFlickerSpeed + light.flickerOffset);
        ctx.fillStyle = CONFIG.backgroundLightColor.replace(/[\d\.]+\)$/g, `${alpha})`);
        ctx.beginPath();
        ctx.arc(light.x, light.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

let highlighted = null;
let hovered = null;

// Animation loop
function animate() {
    const now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackgroundLights(now);

    const elapsed = now / 1000;

    squares.forEach(sq => {
        sq.update(now);
        const scale = 0.5 + sq.z;
        const breath = 1 + CONFIG.breathAmplitude * Math.sin(2 * Math.PI * elapsed / CONFIG.breathPeriod + sq.id);
        const size = CONFIG.squareSize * scale * breath;
        const x = sq.x;
        const y = sq.y;
        let alpha = sq.z * 0.5 + 0.5;
        if (sq.status === 'reserved') {
            alpha *= 0.5;
        }

        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowColor = CONFIG.ambientGlowColor;
        ctx.shadowBlur = CONFIG.ambientGlowSpread;
        ctx.globalAlpha = alpha;
        if (sq.imageObj && sq.imageObj.complete && sq.imageObj.naturalWidth) {
            ctx.drawImage(
                sq.imageObj,
                x - CONFIG.squareSize / 2,
                y - CONFIG.squareSize / 2,
                CONFIG.squareSize,
                CONFIG.squareSize
            );
        } else {
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        ctx.globalAlpha = 1;

        if (highlighted === sq || hovered === sq) {
            ctx.strokeStyle = CONFIG.highlightColor;
            ctx.lineWidth = 2;
            ctx.shadowColor = CONFIG.highlightColor;
            ctx.shadowBlur = CONFIG.ambientGlowSpread * 1.5;
            ctx.strokeRect(x - size / 2 - 1, y - size / 2 - 1, size + 2, size + 2);
        }
        ctx.restore();
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
            animatePosition(
                sq,
                { x: canvas.width / 2, y: canvas.height / 2, z: 1 },
                CONFIG.searchAnimationDuration
            );
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

function showTooltip(html, x, y) {
    tooltip.innerHTML = html;
    tooltip.style.left = x + 10 + 'px';
    tooltip.style.top = y + 10 + 'px';
    tooltip.hidden = false;
    tooltip.classList.add('visible');
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => tooltip.classList.remove('visible'), 3000);
}

function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltip.hidden = true;
}

function handleHover(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const hover = squares.find(sq => {
        const scale = 0.5 + sq.z;
        const breath = 1 + CONFIG.breathAmplitude * Math.sin(2 * Math.PI * (performance.now() / 1000) / CONFIG.breathPeriod + sq.id);
        const size = CONFIG.squareSize * scale * breath;
        const sx = sq.x;
        const sy = sq.y;
        return Math.abs(x - sx) <= size / 2 && Math.abs(y - sy) <= size / 2;
    });
    hovered = hover || null;
    if (hover) {
        if (hover.status === 'filled') {
            let html = '';
            if (hover.imageObj && hover.imageObj.complete && hover.imageObj.naturalWidth) {
                html += `<img src="${hover.image}" width="300" height="300"><br>`;
            }
            if (hover.link) {
                html += `<a href="${hover.link}" target="_blank">${hover.message || hover.link}</a>`;
            } else if (hover.message) {
                html += hover.message;
            } else {
                html += `ID: ${hover.id}`;
            }
            showTooltip(html, clientX, clientY);
        } else {
            const label = `ID: ${hover.id} — ${hover.status === 'reserved' ? 'Reserved' : 'Available'}`;
            showTooltip(label, clientX, clientY);
        }
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
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const ratioX = newWidth / prevWidth;
    const ratioY = newHeight / prevHeight;

    squares.forEach(sq => {
        sq.baseX *= ratioX;
        sq.baseY *= ratioY;
        sq.x *= ratioX;
        sq.y *= ratioY;
    });

    canvas.width = newWidth;
    canvas.height = newHeight;
    prevWidth = newWidth;
    prevHeight = newHeight;
}
