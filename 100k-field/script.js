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
        image: 'https://i.imgur.com/tEhrC0o.jpg',
        message: 'compra aqui',
        link: 'https://tusu.com.ar',
    },
};

// No interpolation helpers are needed for now because
// searched squares simply glow in place rather than moving.


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
        this.imageLoaded = false;
        this.imageFailed = false;
        this.crop = null;
        if (this.image) {
            this.imageObj = new Image();
            this.imageObj.crossOrigin = 'anonymous';
            // Preload image and calculate crop region for object-fit: cover
            this.imageObj.onload = () => {
                const w = this.imageObj.naturalWidth;
                const h = this.imageObj.naturalHeight;
                if (w && h) {
                    if (w > h) {
                        const offset = (w - h) / 2;
                        this.crop = { sx: offset, sy: 0, sw: h, sh: h };
                    } else {
                        const offset = (h - w) / 2;
                        this.crop = { sx: 0, sy: offset, sw: w, sh: w };
                    }
                    this.imageLoaded = true;
                }
            };
            this.imageObj.onerror = () => {
                console.error('Image failed to load for square', this.id, this.image);
                this.imageFailed = true;
            };
            this.imageObj.src = this.image;
        }
        // Unique phase so each square moves differently
        this.phase = Math.random() * Math.PI * 2;
    }
    update(time) {
        const angle = time * CONFIG.driftSpeed;
        this.x = this.baseX + Math.sin(angle + this.phase) * CONFIG.driftAmplitude;
        this.y = this.baseY + Math.cos(angle * 0.7 + this.phase * 1.3) * CONFIG.driftAmplitude;

        // keep within view
        const half = CONFIG.squareSize / 2;
        this.x = Math.max(half, Math.min(canvas.width - half, this.x));
        this.y = Math.max(half, Math.min(canvas.height - half, this.y));
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
let feedbackTimer = null;

function renderSquare(sq, now, {skipHighlight = false} = {}) {
    const scale = 0.5 + sq.z;
    const breath = 1 + CONFIG.breathAmplitude * Math.sin(2 * Math.PI * (now / 1000) / CONFIG.breathPeriod + sq.id);
    let size = CONFIG.squareSize * scale * breath;
    if (hovered === sq) {
        size = CONFIG.squareSize * 2;
    }
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
    if (sq.imageObj && sq.imageLoaded && !sq.imageFailed) {
        const crop = sq.crop;
        if (crop) {
            ctx.drawImage(
                sq.imageObj,
                crop.sx,
                crop.sy,
                crop.sw,
                crop.sh,
                x - size / 2,
                y - size / 2,
                size,
                size
            );
        } else {
            ctx.drawImage(
                sq.imageObj,
                x - size / 2,
                y - size / 2,
                size,
                size
            );
        }
    } else {
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    if (!skipHighlight && (highlighted === sq || hovered === sq)) {
        ctx.strokeStyle = CONFIG.highlightColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = CONFIG.highlightColor;
        ctx.shadowBlur = CONFIG.ambientGlowSpread * 1.5;
        ctx.strokeRect(x - size / 2 - 1, y - size / 2 - 1, size + 2, size + 2);
    }
    ctx.restore();
}

// Animation loop
function animate() {
    const now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackgroundLights(now);

    squares.forEach(sq => {
        sq.update(now);
        if (sq !== hovered) {
            renderSquare(sq, now);
        }
    });
    if (hovered) {
        hovered.update(now);
        renderSquare(hovered, now);
    }

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
            showFeedback(`ID ${id} highlighted`);
        }
        else {
            highlighted = null;
            showFeedback('Not found');
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

tooltip.addEventListener('mouseleave', () => {
    hideTooltip();
    hovered = null;
});

function showTooltip(html, x, y) {
    tooltip.innerHTML = html;
    tooltip.style.left = x + 10 + 'px';
    tooltip.style.top = y + 10 + 'px';
    tooltip.hidden = false;
    tooltip.classList.add('visible');
}

function hideTooltip() {
    tooltip.classList.remove('visible');
    tooltip.hidden = true;
}

// Display brief feedback messages near the search bar
function showFeedback(msg) {
    const box = document.getElementById('feedback');
    if (!box) return;
    box.textContent = msg;
    box.classList.add('visible');
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => box.classList.remove('visible'), 2000);
}

function handleHover(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const hover = squares.find(sq => {
        const scale = 0.5 + sq.z;
        const breath = 1 + CONFIG.breathAmplitude * Math.sin(2 * Math.PI * (performance.now() / 1000) / CONFIG.breathPeriod + sq.id);
        let size = CONFIG.squareSize * scale * breath;
        if (hovered === sq) {
            size = CONFIG.squareSize * 2;
        }
        const sx = sq.x;
        const sy = sq.y;
        return Math.abs(x - sx) <= size / 2 && Math.abs(y - sy) <= size / 2;
    });
    hovered = hover || null;
    if (hover) {
        if (hover.status === 'filled') {
            let html = '';
            if (hover.imageObj && hover.imageLoaded && !hover.imageFailed) {
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
canvas.addEventListener('mouseleave', (e) => {
    if (e.relatedTarget === tooltip || tooltip.contains(e.relatedTarget)) {
        return;
    }
    hideTooltip();
    hovered = null;
});
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
