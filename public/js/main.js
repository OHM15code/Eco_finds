// Main JavaScript file for EcoFinds

document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile navigation toggle
  initMobileNav();
  
  // Initialize quantity controls for cart
  initQuantityControls();
  
  // Initialize product image preview
  initImagePreview();
  
  // Search functionality
  initSearchFunctionality();
});

/**
 * Initialize mobile navigation menu toggle
 */
function initMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const nav = document.querySelector('nav');
  
  if (navToggle && navLinks && nav) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      nav.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }
}

/**
 * Initialize quantity controls for cart items
 */
function initQuantityControls() {
  const quantityControls = document.querySelectorAll('.quantity-control');
  
  quantityControls.forEach(control => {
    const decreaseBtn = control.querySelector('.decrease');
    const increaseBtn = control.querySelector('.increase');
    const quantityInput = control.querySelector('.quantity-input');
    const itemId = control.dataset.itemId;
    
    if (decreaseBtn && increaseBtn && quantityInput) {
      decreaseBtn.addEventListener('click', function() {
        updateQuantity(itemId, parseInt(quantityInput.value) - 1);
      });
      
      increaseBtn.addEventListener('click', function() {
        updateQuantity(itemId, parseInt(quantityInput.value) + 1);
      });
      
      quantityInput.addEventListener('change', function() {
        updateQuantity(itemId, parseInt(quantityInput.value));
      });
    }
  });
}

/**
 * Update item quantity in cart
 * @param {string} itemId - The ID of the cart item
 * @param {number} quantity - The new quantity
 */
function updateQuantity(itemId, quantity) {
  if (quantity < 1) quantity = 1;
  
  fetch(`/cart/update/${itemId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity: quantity }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update UI
      const quantityInput = document.querySelector(`.quantity-control[data-item-id="${itemId}"] .quantity-input`);
      const subtotalElement = document.querySelector(`.cart-item[data-item-id="${itemId}"] .subtotal`);
      const totalElement = document.querySelector('.cart-summary .total-amount');
      
      if (quantityInput) quantityInput.value = quantity;
      if (subtotalElement) subtotalElement.textContent = `$${data.subtotal.toFixed(2)}`;
      if (totalElement) totalElement.textContent = `$${data.total.toFixed(2)}`;
    }
  })
  .catch(error => console.error('Error updating quantity:', error));
}

/**
 * Initialize product image preview functionality
 */
function initImagePreview() {
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');
  
  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

/**
 * Add to cart functionality
 */
function addToCart(productId) {
  fetch(`/cart/add/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity: 1 }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show success message
      const messageElement = document.createElement('div');
      messageElement.className = 'alert alert-success';
      messageElement.textContent = 'Item added to cart!';
      
      const container = document.querySelector('.container');
      if (container) {
        container.insertBefore(messageElement, container.firstChild);
        
        // Remove message after 3 seconds
        setTimeout(() => {
          messageElement.remove();
        }, 3000);
      }
    }
  })
  .catch(error => console.error('Error adding to cart:', error));
}

/**
 * Remove item from cart
 */
function removeFromCart(itemId) {
  if (confirm('Are you sure you want to remove this item from your cart?')) {
    fetch(`/cart/remove/${itemId}`, {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Remove item from UI
        const cartItem = document.querySelector(`.cart-item[data-item-id="${itemId}"]`);
        if (cartItem) cartItem.remove();
        
        // Update total
        const totalElement = document.querySelector('.cart-summary .total-amount');
        if (totalElement) totalElement.textContent = `$${data.total.toFixed(2)}`;
        
        // Show empty cart message if no items left
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length === 0) {
          const cartContent = document.querySelector('.cart-content');
          const emptyCart = document.querySelector('.empty-cart');
          
          if (cartContent) cartContent.style.display = 'none';
          if (emptyCart) emptyCart.style.display = 'block';
        }
      }
    })
    .catch(error => console.error('Error removing item:', error));
  }
}

/**
 * Clear cart functionality
 */
function clearCart() {
  if (confirm('Are you sure you want to clear your cart?')) {
    fetch('/cart/clear', {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Show empty cart message
        const cartContent = document.querySelector('.cart-content');
        const emptyCart = document.querySelector('.empty-cart');
        
        if (cartContent) cartContent.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
      }
    })
    .catch(error => console.error('Error clearing cart:', error));
  }
}

/**
 * Initialize search functionality
 */
function initSearchFunctionality() {
  const searchForm = document.querySelector('.search-bar');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      const searchInput = this.querySelector('input[name="search"]');
      if (!searchInput.value.trim()) {
        e.preventDefault();
        alert('Please enter a search term');
      }
    });
  }

  // Category filter
  const categorySelect = document.querySelector('select[name="category"]');
  if (categorySelect) {
    categorySelect.addEventListener('change', function() {
      // Get current URL
      const url = new URL(window.location.href);
      
      // Update or add category parameter
      if (this.value) {
        url.searchParams.set('category', this.value);
      } else {
        url.searchParams.delete('category');
      }
      
      // Preserve search parameter if exists
      const searchParam = url.searchParams.get('search');
      if (!searchParam) {
        url.searchParams.delete('search');
      }
      
      // Navigate to filtered URL
      window.location.href = url.toString();
    });
  }

  // Password confirmation validation
  const registerForm = document.querySelector('form[action="/auth/register"]');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      const password = document.getElementById('password');
      const confirmPassword = document.getElementById('confirm_password');
      
      if (password.value !== confirmPassword.value) {
        e.preventDefault();
        alert('Passwords do not match');
      }
    });
  }

  // Price validation for product forms
  const productForm = document.querySelector('form[action^="/products/"]');
  if (productForm) {
    productForm.addEventListener('submit', function(e) {
      const priceInput = document.getElementById('price');
      if (priceInput && parseFloat(priceInput.value) <= 0) {
        e.preventDefault();
        alert('Price must be greater than zero');
      }
    });
  }

  // Image preview for product forms
  const imageInput = document.getElementById('image');
  if (imageInput) {
    imageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const previewContainer = document.querySelector('.image-preview') || document.createElement('div');
          previewContainer.className = 'image-preview';
          previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; margin-top: 10px;">`;;
          
          if (!document.querySelector('.image-preview')) {
            imageInput.parentNode.appendChild(previewContainer);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
};