// ========================
// Particle Background
// ========================
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;
function initParticles() {
  particlesArray = [];
  let numberOfParticles = (canvas.width * canvas.height) / 9000;
  for (let i = 0; i < numberOfParticles; i++) {
    let size = Math.random() * 2 + 1;
    let x = Math.random() * (innerWidth - size * 2);
    let y = Math.random() * (innerHeight - size * 2);
    let directionX = Math.random() * 0.4 - 0.2;
    let directionY = Math.random() * 0.4 - 0.2;
    particlesArray.push({ x, y, directionX, directionY, size });
  }
}
function drawParticles(p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
  ctx.fillStyle = "rgba(16,185,129,0.5)";
  ctx.fill();
}
function moveParticles(p) {
  if (p.x > canvas.width || p.x < 0) p.directionX = -p.directionX;
  if (p.y > canvas.height || p.y < 0) p.directionY = -p.directionY;
  p.x += p.directionX; p.y += p.directionY;
  drawParticles(p);
}
function animateParticles() {
  requestAnimationFrame(animateParticles);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particlesArray.forEach(moveParticles);
}
initParticles(); animateParticles();
window.addEventListener("resize", () => {
  canvas.width = innerWidth; canvas.height = innerHeight; initParticles();
});

// ========================
// Theme Toggle
// ========================
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
});

// ========================
// Product Data
// ========================
let products = [
  {
    title: "Eco Bottle",
    price: "$12",
    image: "https://images.unsplash.com/photo-1526401485004-2fda9f6d93d8?auto=format&fit=crop&w=600&q=80",
    category: "Home",
    desc: "Reusable eco-friendly stainless steel bottle."
  },
  {
    title: "Organic T-Shirt",
    price: "$25",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
    desc: "Soft organic cotton, comfortable and breathable."
  },
  {
    title: "Solar Charger",
    price: "$40",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=600&q=80",
    category: "Electronics",
    desc: "Compact eco solar charger for your devices."
  },
  {
    title: "Bamboo Toothbrush",
    price: "$5",
    image: "https://images.unsplash.com/photo-1606813902773-19aab4e3d7c1?auto=format&fit=crop&w=600&q=80",
    category: "Home",
    desc: "Biodegradable bamboo toothbrush with soft bristles."
  },
  {
    title: "Eco Tote Bag",
    price: "$15",
    image: "https://images.unsplash.com/photo-1585386959984-a4155223f8d3?auto=format&fit=crop&w=600&q=80",
    category: "Clothing",
    desc: "Reusable eco-friendly tote bag – replace plastic bags forever."
  },
  {
    title: "Recycled Notebook",
    price: "$8",
    image: "https://images.unsplash.com/photo-1600250398539-0a6f6c1db73b?auto=format&fit=crop&w=600&q=80",
    category: "Books",
    desc: "Notebook made from 100% recycled paper."
  },
  {
    title: "Glass Food Containers",
    price: "$30",
    image: "https://images.unsplash.com/photo-1590080876476-bd0a5a9b1f5d?auto=format&fit=crop&w=600&q=80",
    category: "Home",
    desc: "Set of reusable glass food containers with bamboo lids."
  }
];



// ========================
// Filters & Search
// ========================
const productGrid = document.getElementById("productGrid");
const filterBar = document.getElementById("filterBar");
const searchInput = document.getElementById("searchInput");

let filters = { category: "All", search: "" };
const categories = ["All", "Electronics", "Clothing", "Books", "Home"];

function renderFilters() {
  filterBar.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if (filters.category === cat) btn.classList.add("active");
    btn.addEventListener("click", () => {
      filters.category = cat; renderFilters(); renderProducts();
    });
    filterBar.appendChild(btn);
  });
}

function renderProducts() {
  productGrid.innerHTML = "";
  products
    .filter(p =>
      (filters.category === "All" || p.category === filters.category) &&
      p.title.toLowerCase().includes(filters.search.toLowerCase())
    )
    .forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.title    = p.title;
      card.dataset.price    = p.price;
      card.dataset.image    = p.image;
      card.dataset.category = p.category;
      card.dataset.desc     = p.desc || "";

      card.innerHTML = `
        ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ""}
        <div class="info">
          <div class="title">${p.title}</div>
          <div class="price">${p.price}</div>
        </div>
        <div class="actions">
          <button class="quick-view" aria-label="Quick view ${p.title}">Quick View</button>
          <button class="add-cart" aria-label="Add ${p.title} to cart">Add to Cart</button>
        </div>
      `;
      productGrid.appendChild(card);
    });
}
searchInput.addEventListener("input", e => {
  filters.search = e.target.value; renderProducts();
});

// ========================
// Quick View Modal
// ========================
const quickViewModal = document.getElementById("quickViewModal");
const quickImage = document.getElementById("quickImage");
const quickTitle = document.getElementById("quickTitle");
const quickPrice = document.getElementById("quickPrice");
const quickCategory = document.getElementById("quickCategory");
const quickDesc = document.getElementById("quickDesc");
const closeQuickView = document.querySelector(".close-quick-view");

productGrid.addEventListener("click", e => {
  if (e.target.classList.contains("quick-view")) {
    const card = e.target.closest(".card");
    quickImage.src = card.dataset.image;
    quickTitle.textContent = card.dataset.title;
    quickPrice.textContent = card.dataset.price;
    quickCategory.textContent = `Category: ${card.dataset.category}`;
    quickDesc.textContent = card.dataset.desc;
    quickViewModal.style.display = "flex";
  }
});
closeQuickView.addEventListener("click", () => {
  quickViewModal.style.display = "none";
});

// ========================
// Add New Product Modal
// ========================
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

addBtn.addEventListener("click", () => { modal.style.display = "flex"; });
cancelBtn.addEventListener("click", () => { modal.style.display = "none"; });

saveBtn.addEventListener("click", () => {
  const title = document.getElementById("titleInput").value.trim();
  const price = `$${document.getElementById("priceInput").value.trim()}`;
  const fileInput = document.getElementById("imageInput");
  const category = document.getElementById("categoryInput").value;
  const desc = document.getElementById("descInput").value.trim();

  let image = "";
  if (fileInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = e => {
      image = e.target.result;
      products.push({ title, price, image, category, desc });
      renderProducts(); modal.style.display = "none"; showToast("Product added!");
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    products.push({ title, price, image, category, desc });
    renderProducts(); modal.style.display = "none"; showToast("Product added!");
  }
});

// ========================
// Skeleton Loader
// ========================
function showSkeleton() {
  productGrid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton";
    skeleton.innerHTML = `
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    `;
    productGrid.appendChild(skeleton);
  }
}

// ========================
// Toast
// ========================
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast"; toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ========================
// Add to Cart
// ========================
productGrid.addEventListener("click", e => {
  if (e.target.classList.contains("add-cart")) {
    const card = e.target.closest(".card");
    const item = {
      title: card.dataset.title,
      price: card.dataset.price,
      image: card.dataset.image,
      category: card.dataset.category,
      desc: card.dataset.desc,
      qty: 1
    };
    addToCart(item);
  }
});
function addToCart(item) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(c => c.title === item.title);
  if (existing) { existing.qty += 1; }
  else { cart.push(item); }
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast(`${item.title} added to cart`);
}

// ========================
// Init
// ========================
showSkeleton();
setTimeout(() => { renderFilters(); renderProducts(); }, 1000);
