// Skrypt dla strony koszyka
document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
    setupEventListeners();
});

function initializeCartPage() {
    loadProductsForCart();
    renderCartItems();
    updateCartSummary();
}

function loadProductsForCart() {
    // Ładujemy produkty do sekcji dodawania
    renderProductsForCategory('beer-menu-cart', menuData.beer);
    renderProductsForCategory('cocktails-menu-cart', menuData.cocktails);
    renderProductsForCategory('snacks-menu-cart', menuData.snacks);
}

function renderProductsForCategory(containerId, products) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    container.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'dish visible'; // Dodajemy klasę visible od razu
        productElement.innerHTML = `
            <div>
                <span class="name">${product.name}</span>
                <span class="meta">${product.meta}</span>
                ${product.promo ? `<span class="promo">${product.promo}</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="price">${product.price}</div>
                <button class="add-to-cart-btn" data-product='${JSON.stringify(product).replace(/'/g, "\\'")}'>
                    + Dodaj
                </button>
            </div>
        `;
        container.appendChild(productElement);
    });
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cart = cartManager.getCart();

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        cartItemsContainer.appendChild(emptyCartMessage);
        return;
    }

    emptyCartMessage.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">${item.meta || ''}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-name="${item.name}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase" data-name="${item.name}">+</button>
                </div>
                <div class="cart-item-price">${(parseFloat(item.price.replace(' zł', '').replace(',', '.')) * item.quantity).toFixed(2)} zł</div>
                <button class="remove-btn" data-name="${item.name}">Usuń</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    // Dodajemy obsługę zdarzeń dla nowych przycisków
    attachCartItemEvents();
}

function attachCartItemEvents() {
    // Przyciski zwiększania ilości
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-name');
            cartManager.updateQuantity(productName, 1);
            renderCartItems();
            updateCartSummary();
        });
    });

    // Przyciski zmniejszania ilości
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-name');
            cartManager.updateQuantity(productName, -1);
            renderCartItems();
            updateCartSummary();
        });
    });

    // Przyciski usuwania
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-name');
            cartManager.removeFromCart(productName);
            renderCartItems();
            updateCartSummary();
        });
    });
}

function updateCartSummary() {
    const cartSummary = document.getElementById('cart-summary');
    const totalAmount = document.getElementById('total-amount');
    const cart = cartManager.getCart();

    if (cart.length === 0) {
        cartSummary.style.display = 'none';
    } else {
        cartSummary.style.display = 'block';
        totalAmount.textContent = `${cartManager.getTotalPrice().toFixed(2)} zł`;
    }
}

function setupEventListeners() {
    // Przyciski dodawania do koszyka
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productData = e.target.getAttribute('data-product');
            if (productData) {
                const product = JSON.parse(productData);
                cartManager.addToCart(product);
                renderCartItems();
                updateCartSummary();
                
                // Ulepszona animacja dodania
                const originalText = e.target.textContent;
                const originalBackground = e.target.style.background;
                const originalTransform = e.target.style.transform;
                
                e.target.textContent = '✓ Dodano!';
                e.target.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 255, 136, 0.4)';
                
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.style.background = originalBackground;
                    e.target.style.transform = originalTransform;
                    e.target.style.boxShadow = '';
                }, 1500);
            }
        }
    });

    // Przycisk generowania listy dla kelnera
    document.getElementById('generate-order-btn').addEventListener('click', generateOrderList);

    // Przycisk nowego zamówienia - natychmiastowe czyszczenie bez potwierdzenia
    document.getElementById('new-order').addEventListener('click', startNewOrder);
}

function generateOrderList() {
    const orderContent = document.getElementById('order-content');
    const orderSection = document.getElementById('order-section');
    const cart = cartManager.getCart();

    if (cart.length === 0) {
        alert('Koszyk jest pusty! Dodaj produkty przed generowaniem listy.');
        return;
    }

    let orderHTML = '<div class="order-content">';
    
    cart.forEach(item => {
        orderHTML += `
            <div class="order-item">
                <span><strong>${item.quantity}x</strong> ${item.name}${item.meta || ''}</span>
                <span>${(parseFloat(item.price.replace(' zł', '').replace(',', '.')) * item.quantity).toFixed(2)} zł</span>
            </div>
        `;
    });

    orderHTML += `
        <div class="order-item order-total">
            <span><strong>RAZEM:</strong></span>
            <span><strong>${cartManager.getTotalPrice().toFixed(2)} zł</strong></span>
        </div>
    </div>`;

    orderContent.innerHTML = orderHTML;
    orderSection.style.display = 'block';

    // Przewiń do sekcji zamówienia
    orderSection.scrollIntoView({ behavior: 'smooth' });
}

function startNewOrder() {
    // Natychmiastowe czyszczenie koszyka bez potwierdzenia
    cartManager.clearCart();
    renderCartItems();
    updateCartSummary();
    document.getElementById('order-section').style.display = 'none';
    
    // Dodajemy animację informującą o wyczyszczeniu
    const newOrderBtn = document.getElementById('new-order');
    const originalText = newOrderBtn.textContent;
    newOrderBtn.textContent = '✓ Koszyk wyczyszczony!';
    newOrderBtn.style.background = 'linear-gradient(90deg, #00c2ff, #7c5cff)';
    
    setTimeout(() => {
        newOrderBtn.textContent = originalText;
    }, 2000);
}

// Obsługa modala 18+ dla strony koszyka
const ageModal = document.getElementById('age-modal');
const im18 = document.getElementById('im-18');
const not18 = document.getElementById('not-18');

if (ageModal && im18 && not18) {
    document.body.style.overflow = 'hidden';

    im18.addEventListener('click', () => {
        ageModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    not18.addEventListener('click', () => {
        ageModal.querySelector('.modal').innerHTML = '<h3>Dostęp ograniczony</h3><p>Nie możesz wejść na tę stronę jeśli nie masz 18 lat.</p><div style="margin-top:16px"><button class="btn-ghost" id="back-btn">OK</button></div>';
        const backBtn = document.getElementById('back-btn');
        backBtn.addEventListener('click', () => {
            window.location.href = 'about:blank';
        });
    });

    document.getElementById('im-18').focus();
}

// Mobile nav toggle dla strony koszyka
function toggleMenu(){
    const nav = document.getElementById('main-nav');
    const btn = document.querySelector('.menu-toggle');
    if(nav.classList.contains('mobile-show')){
        nav.classList.remove('mobile-show');
        btn.setAttribute('aria-expanded','false');
    } else {
        nav.classList.add('mobile-show');
        btn.setAttribute('aria-expanded','true');
    }
}