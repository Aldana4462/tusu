// Configuration
const TOTAL_SQUARES = window.innerWidth < 600 ? 50 : 100; // change for scaling
const SQUARE_SIZE = 10;

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
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        // wrap around [0,1]
        this.x = (this.x + 1) % 1;
        this.y = (this.y + 1) % 1;
        this.z = (this.z + 1) % 1;
    }
}

// Generate squares
const squares = [];
for (let i = 1; i <= TOTAL_SQUARES; i++) {
    squares.push(new Square(i));
}

let highlighted = null;

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    squares.forEach(sq => {
        sq.update();
        const scale = 0.5 + sq.z; // depth scaling
        const size = SQUARE_SIZE * scale;
        const alpha = 0.3 + sq.z * 0.7;
        const x = sq.x * canvas.width;
        const y = sq.y * canvas.height;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        // highlight outline
        if (highlighted === sq) {
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - size / 2 - 1, y - size / 2 - 1, size + 2, size + 2);
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
            sq.z = 1; // bring to front
            sq.x = 0.5;
            sq.y = 0.5;
        }
    }
});

// Buy logic
const buyBtn = document.getElementById('buy');
buyBtn.addEventListener('click', () => {
    const next = squares.find(s => s.status === 'empty');
    if (next) {
        const url = `https://ko-fi.com/YourPage/?utm_source=field&utm_medium=web&utm_campaign=id_${next.id}`; // TODO replace with your Ko-fi page
        window.open(url, '_blank');
    }
});

// Tooltip logic
const tooltip = document.getElementById('tooltip');
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hover = squares.find(sq => {
        const scale = 0.5 + sq.z;
        const size = SQUARE_SIZE * scale;
        const sx = sq.x * canvas.width;
        const sy = sq.y * canvas.height;
        return Math.abs(x - sx) <= size / 2 && Math.abs(y - sy) <= size / 2;
    });
    if (hover) {
        tooltip.textContent = `ID: ${hover.id} — Available`;
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
        tooltip.hidden = false;
    } else {
        tooltip.hidden = true;
    }
});
canvas.addEventListener('mouseleave', () => { tooltip.hidden = true; });

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
