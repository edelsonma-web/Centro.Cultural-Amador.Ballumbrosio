/* ===========================
   MENU RESPONSIVE & BURGER
   =========================== */

const menu = document.querySelector(".menu");
const header = document.querySelector("header");
const burger = document.getElementById("burger");

burger.addEventListener("click", () => {
    menu.classList.toggle("menu-open");
});


/* ===========================
   SCROLL SUAVE
   =========================== */

document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
        menu.classList.remove("menu-open");
    });
});


/* ===========================
   ANIMACIONES REVEAL
   =========================== */

const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.85;

    revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < trigger) {
            el.classList.add("show");
        }
    });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);


/* ===========================
   BOTÓN FLOTANTE WHATSAPP
   =========================== */

const wspButton = document.querySelector(".wsp-floating");
if (!wspButton) {
    const wsp = document.createElement("a");
    wsp.href = "https://wa.me/51997575306";
    wsp.target = "_blank";
    wsp.classList.add("wsp-floating");
    wsp.innerHTML = "💬";
    document.body.appendChild(wsp);
}


/* ===========================
   CARRITO (LOGICA)
   =========================== */

const CART_KEY = "ccamador_cart_v1";

/* Elementos DOM del carrito */
const cartToggle = document.getElementById("cart-toggle");
const cartModal = document.getElementById("cart-modal");
const cartClose = document.getElementById("cart-close");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartClearBtn = document.getElementById("cart-clear");
const checkoutBtn = document.getElementById("checkout-btn");

let cart = loadCart();

/* Inicializar contador visual */
updateCartUI();

/* Abrir / cerrar carrito */
cartToggle.addEventListener("click", () => {
    cartModal.classList.add("show");
});

cartClose.addEventListener("click", () => {
    cartModal.classList.remove("show");
});

/* Vaciar carrito */
cartClearBtn.addEventListener("click", () => {
    if (!cart.length) return;
    if (confirm("¿Vaciar el carrito?")) {
        cart = [];
        saveCart();
        updateCartUI();
    }
});

/* Checkout: genera mensaje resumen y abre WhatsApp */
checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
        alert("Tu carrito está vacío.");
        return;
    }

    const lines = cart.map(item => {
        return `${item.qty} x ${item.name} (S/ ${item.price})`;
    });

    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    lines.push(`Total: S/ ${total.toFixed(2)}`);

    const message = encodeURIComponent(`Hola, quiero ordenar:\n${lines.join("\n")}\n\nDirección: __\nNombre: __`);
    const waLink = `https://wa.me/51997575306?text=${message}`;

    window.open(waLink, "_blank");
});

/* Agregar al carrito desde botones */
document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const card = e.target.closest(".product");
        if (!card) return;

        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseFloat(card.dataset.price || "0");

        addToCart({ id, name, price, qty: 1 });
        // animación sutil
        btn.innerText = "Agregado ✓";
        setTimeout(() => btn.innerText = "Agregar al carrito", 900);
    });
});

/* Funciones del carrito */

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(item) {
    const idx = cart.findIndex(ci => ci.id === item.id);
    if (idx > -1) {
        cart[idx].qty += item.qty;
    } else {
        cart.push({...item});
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
}

function changeQty(id, delta) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) {
        cart.splice(idx, 1);
    }
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    // contador
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    cartCountEl.innerText = totalItems;

    // lista de items
    cartItemsContainer.innerHTML = "";
    if (!cart.length) {
        const empty = document.createElement("div");
        empty.className = "cart-empty";
        empty.style.padding = "18px";
        empty.innerText = "Tu carrito está vacío.";
        cartItemsContainer.appendChild(empty);
        cartTotalEl.innerText = "S/ 0";
        return;
    }

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";

        const meta = document.createElement("div");
        meta.className = "meta";

        const title = document.createElement("h4");
        title.innerText = item.name;

        const price = document.createElement("p");
        price.innerText = `S/ ${item.price}  ·  Sub: S/ ${(item.price * item.qty).toFixed(2)}`;

        meta.appendChild(title);
        meta.appendChild(price);

        const qtyControls = document.createElement("div");
        qtyControls.className = "qty-controls";

        const btnMinus = document.createElement("button");
        btnMinus.innerText = "−";
        btnMinus.title = "Quitar 1";
        btnMinus.addEventListener("click", () => changeQty(item.id, -1));

        const qtyLabel = document.createElement("span");
        qtyLabel.innerText = item.qty;
        qtyLabel.style.minWidth = "22px";
        qtyLabel.style.textAlign = "center";

        const btnPlus = document.createElement("button");
        btnPlus.innerText = "+";
        btnPlus.title = "Agregar 1";
        btnPlus.addEventListener("click", () => changeQty(item.id, +1));

        const btnRemove = document.createElement("button");
        btnRemove.innerText = "Eliminar";
        btnRemove.title = "Eliminar artículo";
        btnRemove.style.marginLeft = "8px";
        btnRemove.addEventListener("click", () => {
            if (confirm(`Eliminar ${item.name} del carrito?`)) removeFromCart(item.id);
        });

        qtyControls.appendChild(btnMinus);
        qtyControls.appendChild(qtyLabel);
        qtyControls.appendChild(btnPlus);
        qtyControls.appendChild(btnRemove);

        row.appendChild(meta);
        row.appendChild(qtyControls);

        cartItemsContainer.appendChild(row);
    });

    const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
    cartTotalEl.innerText = `S/ ${total.toFixed(2)}`;
}

/* Cerrar modal si clic afuera del panel */
cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove("show");
    }
});

/* mantener contador actualizado al cargar la página */
document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
});
