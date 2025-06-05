const ball = document.getElementById('ball');
let x = 0;
let y = 0;
let dx = 2;
let dy = 2;
let width = window.innerWidth - ball.offsetWidth;
let height = window.innerHeight - ball.offsetHeight;

function randomizeSpeed() {
  dx = (Math.random() * 4 + 1) * (dx > 0 ? 1 : -1);
  dy = (Math.random() * 4 + 1) * (dy > 0 ? 1 : -1);
}

function move() {
  x += dx;
  y += dy;

  if (x <= 0 || x >= width) {
    dx *= -1;
    randomizeSpeed();
  }
  if (y <= 0 || y >= height) {
    dy *= -1;
    randomizeSpeed();
  }

  ball.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(move);
}

window.addEventListener('resize', () => {
  width = window.innerWidth - ball.offsetWidth;
  height = window.innerHeight - ball.offsetHeight;
});

randomizeSpeed();
move();
