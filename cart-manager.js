// Manager koszyka - wspólny dla wszystkich stron
class CartManager {
    constructor() {
        this.cartKey = 'atlantyk_cart';
        this.init();
    }

    init() {
        // Inicjalizacja koszyka jeśli nie istnieje
        if (!this.getCart()) {
            this.saveCart([]);
        }
        this.updateCartCount();
    }

    getCart() {
        try {
            const cart = localStorage.getItem(this.cartKey);
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error('Błąd odczytu koszyka:', e);
            return [];
        }
    }

    saveCart(cart) {
        try {
            localStorage.setItem(this.cartKey, JSON.stringify(cart));
            this.updateCartCount();
            return true;
        } catch (e) {
            console.error('Błąd zapisu koszyka:', e);
            return false;
        }
    }

    addToCart(product) {
        const cart = this.getCart();
        const existingItemIndex = cart.findIndex(item => item.name === product.name);

        if (existingItemIndex > -1) {
            // Produkt już istnieje - zwiększ ilość
            cart[existingItemIndex].quantity += 1;
            console.log(`Zwiększono ilość produktu: ${product.name}, nowa ilość: ${cart[existingItemIndex].quantity}`);
        } else {
            // Nowy produkt
            cart.push({
                ...product,
                quantity: 1
            });
            console.log(`Dodano nowy produkt: ${product.name}`);
        }

        this.saveCart(cart);
        this.updateCartCount();
        return true;
    }

    removeFromCart(productName) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.name !== productName);
        this.saveCart(updatedCart);
        this.updateCartCount();
        console.log(`Usunięto produkt: ${productName}`);
    }

    updateQuantity(productName, change) {
        const cart = this.getCart();
        const itemIndex = cart.findIndex(item => item.name === productName);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;

            if (cart[itemIndex].quantity <= 0) {
                // Usuń produkt jeśli ilość <= 0
                this.removeFromCart(productName);
            } else {
                this.saveCart(cart);
                console.log(`Zmieniono ilość produktu: ${productName}, nowa ilość: ${cart[itemIndex].quantity}`);
            }
        }
    }

    clearCart() {
        this.saveCart([]);
        console.log('Koszyk został wyczyszczony');
    }

    getTotalPrice() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace(' zł', '').replace(',', '.'));
            return total + (price * item.quantity);
        }, 0);
    }

    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            if (count === 0) {
                element.style.display = 'none';
            } else {
                element.style.display = 'flex';
            }
        });
    }

    generateOrderList() {
        const cart = this.getCart();
        if (cart.length === 0) return null;

        let orderText = "ZAMÓWIENIE - ATLANTYK\n";
        orderText += "====================\n\n";
        
        cart.forEach(item => {
            orderText += `${item.quantity}x ${item.name}`;
            if (item.meta && item.meta.trim()) {
                orderText += ` ${item.meta}`;
            }
            orderText += ` - ${item.price} za szt.\n`;
        });

        orderText += `\nRAZEM: ${this.getTotalPrice().toFixed(2)} zł\n`;
        orderText += `\nData: ${new Date().toLocaleString('pl-PL')}\n`;
        orderText += "Dziękujemy za zamówienie!";

        return orderText;
    }
}

// Globalna instancja managera koszyka
const cartManager = new CartManager();