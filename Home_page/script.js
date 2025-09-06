// -------------------------------------
// 1. Particle Background Animation
// -------------------------------------
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let w = canvas.width = innerWidth;
let h = canvas.height = innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
});

const mouse = { x: null, y: null };
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
});

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - .5) * .5;
    this.vy = (Math.random() - .5) * .5;
    this.size = Math.random() * 2 + 1;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(16,185,129,0.7)';
    ctx.fill();
  }
}

const particles = Array.from({ length: 80 }, () => new Particle());

function animateBg() {
  ctx.clearRect(0,0,w,h);
  particles.forEach(p => { p.update(); p.draw(); });
  // connect close particles
  for (let i=0; i<particles.length; i++) {
    for (let j=i+1; j<particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        ctx.strokeStyle = `rgba(16,185,129,${1 - dist/100})`;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  // mouse highlight
  if (mouse.x && mouse.y) {
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(16,185,129,0.1)';
    ctx.stroke();
  }
  requestAnimationFrame(animateBg);
}
animateBg();


// -------------------------------------
// 2. Theme Toggle
// -------------------------------------
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', next);
});
// persist theme
const stored = localStorage.getItem('theme');
if (stored) {
  document.documentElement.setAttribute('data-theme', stored);
  themeToggle.textContent = stored === 'dark' ? '☀️' : '🌙';
}


// -------------------------------------
// 3. Product Feed & UI Logic
// -------------------------------------
const products = [
  { title: 'Wireless Headphones', price: '$59.99', image: '', category: 'Electronics' },
  { title: 'Denim Jacket',        price: '$42.00', image: '', category: 'Clothing' },
  { title: 'Sci-Fi Novel',        price: '$15.50', image: '', category: 'Books' },
  { title: 'Coffee Maker',        price: '$89.99', image: '', category: 'Home' },
];

let currentFilters = { search: '', category: 'All' };
let initialLoad = true;

const filterBar   = document.getElementById('filterBar');
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const addBtn      = document.getElementById('addBtn');
const modal       = document.getElementById('modal');
const cancelBtn   = document.getElementById('cancelBtn');
const saveBtn     = document.getElementById('saveBtn');
const titleInput  = document.getElementById('titleInput');
const priceInput  = document.getElementById('priceInput');
const imageInput  = document.getElementById('imageInput');
const categoryInput = document.getElementById('categoryInput');

// Render category filters
function renderFilters() {
  const cats = ['All', ...new Set(products.map(p => p.category))];
  filterBar.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = cat === currentFilters.category ? 'active' : '';
    btn.onclick = () => {
      currentFilters.category = cat;
      renderFilters();
      renderProducts();
    };
    filterBar.appendChild(btn);
  });
}

// Show skeleton placeholders
function showSkeleton() {
  productGrid.innerHTML = Array(6).fill('<div class="card skeleton" style="height:240px;"></div>').join('');
}

// Render products
function renderProducts() {
  productGrid.innerHTML = '';
  products
    .filter(p =>
      (currentFilters.category === 'All' || p.category === currentFilters.category) &&
      p.title.toLowerCase().includes(currentFilters.search.toLowerCase())
    )
    .forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
        <div class="info">
          <div class="title">${p.title}</div>
          <div class="price">${p.price}</div>
        </div>
        <button class="quick-view" aria-label="Quick view ${p.title}">Quick View</button>
      `;
      productGrid.appendChild(card);
    });
}

// Initial load with skeleton
function loadFeed() {
  if (initialLoad) {
    showSkeleton();
    setTimeout(() => {
      renderFilters();
      renderProducts();
      initialLoad = false;
    }, 600);
  } else {
    renderFilters();
    renderProducts();
  }
}

// Search input handler
searchInput.addEventListener('input', e => {
  currentFilters.search = e.target.value;
  renderProducts();
});

// Modal controls
addBtn.addEventListener('click', () => modal.classList.add('open'));
cancelBtn.addEventListener('click', () => modal.classList.remove('open'));

// Drag & drop for image input
const fileDrop = document.querySelector('.file-drop');
fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.classList.add('dragover'); });
fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('dragover'));
fileDrop.addEventListener('drop', e => {
  e.preventDefault();
  imageInput.files = e.dataTransfer.files;
  fileDrop.classList.remove('dragover');
});

// Save new product
saveBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const priceVal = priceInput.value.trim();
  const file = imageInput.files[0];
  const category = categoryInput.value;

  if (!title || !priceVal || !file || !category) {
    return alert('All fields are required.');
  }
  if (isNaN(priceVal) || Number(priceVal) < 0) {
    return alert('Price must be a non-negative number.');
  }

  const newProd = {
    title,
    price: `$${Number(priceVal).toFixed(2)}`,
    image: '',
    category
  };

  const reader = new FileReader();
  reader.onload = () => {
    newProd.image = reader.result;
    products.unshift(newProd);
    finalizeAdd();
  };
  reader.readAsDataURL(file);
});

function finalizeAdd() {
  modal.classList.remove('open');
  titleInput.value = '';
  priceInput.value = '';
  imageInput.value = '';
  categoryInput.value = '';
  showToast('Product added successfully!');
  loadFeed();
}

// Toast helper
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    t.addEventListener('transitionend', () => t.remove());
  }, 2000);
}

// Initialize feed
loadFeed();
