// script.js – kurv, UI, checkout, admin

let cart = JSON.parse(localStorage.getItem('nikeCart')) || [];

function saveCart() {
    localStorage.setItem('nikeCart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(productId, size, productName, price) {
    const existing = cart.find(item => item.id === productId && item.size === size);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, name: productName, size: size, price: price, quantity: 1 });
    }
    saveCart();
    alert(`${productName} (Str. ${size}) lagt i kurv!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function clearCart() {
    cart = [];
    saveCart();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total-price');
    if (!cartContainer) return;
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center;">Kurv er tom</p>';
        if (totalSpan) totalSpan.innerText = '0 kr';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price * item.quantity;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong><br>
                    Str: ${item.size} | Antal: ${item.quantity}<br>
                    ${item.price * item.quantity} kr
                </div>
                <button class="cart-item-remove" data-index="${idx}">✖</button>
            </div>
        `;
    });
    cartContainer.innerHTML = html;
    if (totalSpan) totalSpan.innerText = total + ' kr';
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            removeFromCart(idx);
        });
    });
}

function renderProductGrid(productsToRender) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    if (productsToRender.length === 0) {
        grid.innerHTML = '<p style="color:white;">Ingen produkter matcher din søgning.</p>';
        return;
    }
    grid.innerHTML = productsToRender.map(p => `
        <div class="produkt-card">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <div class="pris">${p.price} kr</div>
            <a href="product-detail.html?id=${p.id}" class="btn">Se vare</a>
        </div>
    `).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if (!searchInput) return;
    function filterProducts() {
        const term = searchInput.value.toLowerCase();
        const filtered = getProducts().filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
        renderProductGrid(filtered);
    }
    searchBtn.addEventListener('click', filterProducts);
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') filterProducts(); });
}

function renderProductDetail(productId) {
    const product = getProducts().find(p => p.id === productId);
    const container = document.getElementById('product-detail');
    if (!product) {
        container.innerHTML = '<p style="color:red;">Produkt ikke fundet.</p>';
        return;
    }
    let sizeOptions = '<option value="">Vælg størrelse</option>';
    product.sizes.forEach(s => {
        sizeOptions += `<option value="${s.size}" data-stock="${s.stock}">${s.size} - ${s.stock > 0 ? `Lager: ${s.stock}` : "Udsolgt"}</option>`;
    });
    let stockTableHtml = `<table class="stock-table"><thead><tr><th>Størrelse</th><th>Lagerbeholdning</th><th>Lagerdiagram</th></tr></thead><tbody>`;
    const maxStock = Math.max(...product.sizes.map(s => s.stock), 1);
    product.sizes.forEach(s => {
        const percent = (s.stock / maxStock) * 100;
        stockTableHtml += `
            <tr>
                <td>${s.size}</td>
                <td>${s.stock} stk</td>
                <td><div class="diagram-bar"><div class="diagram-fill" style="width: ${percent}%; background: ${s.stock === 0 ? '#d32f2f' : '#00c853'}"></div></div></td>
            </tr>`;
    });
    stockTableHtml += `</tbody></table>`;
    const detailHtml = `
        <div style="display:flex; flex-wrap:wrap; gap:30px;">
            <div class="detail-img"><img src="${product.image}" alt="${product.name}"></div>
            <div class="detail-info" style="flex:1;">
                <h1>${product.name}</h1>
                <p class="pris-big">${product.price} DKK</p>
                <p><strong>Beskrivelse:</strong><br> ${product.description}</p>
                <div style="margin:20px 0;">
                    <label for="size-select"><strong>Vælg størrelse:</strong></label>
                    <select id="size-select">${sizeOptions}</select>
                </div>
                <button id="add-to-cart-detail" class="btn">🛒 Læg i kurv</button>
                <button id="buy-now-detail" class="btn" style="background:red;">💰 Køb nu</button>
            </div>
        </div>
        <hr style="margin: 30px 0; border-color: red;">
        <h3 style="color:red;">📦 Lagerstatus & diagram</h3>
        ${stockTableHtml}
    `;
    container.innerHTML = detailHtml;
    document.getElementById('add-to-cart-detail').addEventListener('click', () => {
        const selectedSize = document.getElementById('size-select').value;
        if (!selectedSize) { alert('Vælg størrelse'); return; }
        const sizeObj = product.sizes.find(s => s.size === selectedSize);
        if (!sizeObj || sizeObj.stock <= 0) { alert('Udsolgt'); return; }
        addToCart(product.id, selectedSize, product.name, product.price);
    });
    document.getElementById('buy-now-detail').addEventListener('click', () => {
        const selectedSize = document.getElementById('size-select').value;
        if (!selectedSize) { alert('Vælg størrelse'); return; }
        const sizeObj = product.sizes.find(s => s.size === selectedSize);
        if (!sizeObj || sizeObj.stock <= 0) { alert('Udsolgt'); return; }
        // Tøm kurv og tilføj kun dette produkt
        cart = [{ id: product.id, name: product.name, size: selectedSize, price: product.price, quantity: 1 }];
        saveCart();
        window.location.href = 'checkout.html';
    });
}

function renderCheckoutCart() {
    const container = document.getElementById('checkout-cart');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = '<p>Din kurv er tom. <a href="produkter.html">Gå tilbage og køb noget</a></p>';
        return;
    }
    let html = '<ul style="list-style:none;">';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        html += `<li>${item.name} (Str. ${item.size}) x ${item.quantity} - ${item.price * item.quantity} kr</li>`;
    });
    html += `</ul><p><strong>Total: ${total} kr</strong></p>`;
    container.innerHTML = html;
}

function placeOrder() {
    if (cart.length === 0) {
        alert('Kurven er tom');
        return;
    }
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;
    if (!fullname || !email || !address || !city || !zip) {
        alert('Udfyld alle felter');
        return;
    }
    // Tjek lager for alle varer i kurven
    let stockOk = true;
    for (let item of cart) {
        const products = getProducts();
        const product = products.find(p => p.id === item.id);
        if (product) {
            const sizeStock = product.sizes.find(s => s.size === item.size);
            if (!sizeStock || sizeStock.stock < item.quantity) {
                alert(`Desværre, ${item.name} str. ${item.size} har ikke nok på lager (kun ${sizeStock?.stock || 0} stk).`);
                stockOk = false;
                break;
            }
        } else {
            stockOk = false;
        }
    }
    if (!stockOk) return;
    
    // Reducer lager
    for (let item of cart) {
        for (let i = 0; i < item.quantity; i++) {
            reduceStock(item.id, item.size);
        }
    }
    
    // Opret ordre
    const order = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        customer: { fullname, email, address, city, zip },
        items: [...cart],
        total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)
    };
    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    // Tøm kurv
    cart = [];
    saveCart();
    document.getElementById('order-message').innerHTML = '<p style="color:green;">✅ Ordre gennemført! Tak for dit køb. Du modtager en kvittering på mail (demo).</p>';
    document.getElementById('checkout-form').reset();
    renderCheckoutCart();
}

function renderAdminProducts() {
    const container = document.getElementById('admin-products');
    if (!container) return;
    const products = getProducts();
    let html = '';
    products.forEach(prod => {
        html += `<div class="admin-product"><strong>${prod.name}</strong><br>`;
        prod.sizes.forEach(sizeObj => {
            html += `<div style="margin:5px 0;">Størrelse ${sizeObj.size}: 
            <input type="number" id="stock-${prod.id}-${sizeObj.size}" value="${sizeObj.stock}" min="0" style="width:70px;">
            <button class="update-stock-btn" data-id="${prod.id}" data-size="${sizeObj.size}">Opdater</button></div>`;
        });
        html += `</div><hr>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.update-stock-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const prodId = btn.dataset.id;
            const size = btn.dataset.size;
            const input = document.getElementById(`stock-${prodId}-${size}`);
            const newStock = parseInt(input.value);
            if (!isNaN(newStock)) {
                updateStock(prodId, size, newStock);
                alert(`Lager opdateret for ${prodId} str. ${size} til ${newStock}`);
                renderAdminProducts(); // refresh
                renderAdminOrders(); // for at vise evt. ændringer
            }
        });
    });
}

function renderAdminOrders() {
    const container = document.getElementById('admin-orders');
    if (!container) return;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) {
        container.innerHTML = '<p>Ingen ordrer endnu.</p>';
        return;
    }
    let html = '';
    orders.reverse().forEach(order => {
        html += `<div class="order-card">
            <strong>Ordre #${order.id}</strong><br>
            Dato: ${order.date}<br>
            Kunde: ${order.customer.fullname}, ${order.customer.email}<br>
            Adresse: ${order.customer.address}, ${order.customer.zip} ${order.customer.city}<br>
            <strong>Varer:</strong><br><ul>`;
        order.items.forEach(item => {
            html += `<li>${item.name} (Str. ${item.size}) x ${item.quantity} = ${item.price * item.quantity} kr</li>`;
        });
        html += `</ul><strong>Total: ${order.total} kr</strong>
        </div><hr>`;
    });
    container.innerHTML = html;
}

// Mobilmenu (valgfri)
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.menu-toggle')) {
        const menu = document.getElementById('menu');
        const toggle = document.createElement('div');
        toggle.className = 'menu-toggle';
        toggle.innerText = '☰ MENU';
        toggle.addEventListener('click', () => {
            menu.classList.toggle('show');
        });
        if (menu && window.innerWidth <= 768) {
            menu.parentNode.insertBefore(toggle, menu);
        }
    }
    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => { clearCart(); updateCartUI(); });
    updateCartUI();
});