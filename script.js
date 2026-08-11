/* =========================================================
ORACLE GADGET
COMPLETE STOREFRONT SYSTEM

FLOW:

PRODUCT
↓
ADD TO CART
↓
CART
↓
CUSTOMER DETAILS
↓
CUSTOMERS TABLE
↓
ORDERS TABLE
↓
ORDER_ITEMS TABLE
↓
WHATSAPP
========================================================= */


/* =========================================================
SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://hdconkdghgtysyzqvqko.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jOqTfV2bwlFT1FM1xYnJKQ_sOYzDsyD";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
BUSINESS INFORMATION
========================================================= */

const BUSINESS = {
    name: "ORACLE GADGET",
    phone: "2348129803111",
    email: "ezeanifrancis15@gmail.com",
    location: "Akure, Ondo State, Nigeria",
    instagram: "ezeani71578",
    tiktok: "@military_oracle"
};


/* =========================================================
STORAGE
========================================================= */

const STORAGE_BUCKET = "product-images";


/* =========================================================
COLORS
========================================================= */

const AVAILABLE_COLORS = [
    "Black",
    "White",
    "Yellow",
    "Blue",
    "Red",
    "Purple",
    "Green",
    "Silver",
    "Space Grey",
    "Gold",
    "Magenta",
    "Cyan"
];


/* =========================================================
APPLICATION STATE
========================================================= */

let products = [];

let currentFilter = "all";

let currentSearch = "";

let selectedProduct = null;

let selectedColor = "";

let cart = [];


/* =========================================================
DOM
========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const emptyProducts =
    document.getElementById("emptyProducts");

const searchInput =
    document.getElementById("searchInput");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const menuButton =
    document.getElementById("menuButton");

const mobileNav =
    document.getElementById("mobileNav");

const productModal =
    document.getElementById("productModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalClose =
    document.getElementById("modalClose");

const modalImage =
    document.getElementById("modalImage");

const modalName =
    document.getElementById("modalName");

const modalDescription =
    document.getElementById("modalDescription");

const modalPrice =
    document.getElementById("modalPrice");

const modalStorage =
    document.getElementById("modalStorage");

const modalStatus =
    document.getElementById("modalStatus");

const modalCondition =
    document.getElementById("modalCondition");

const modalOrder =
    document.getElementById("modalOrder");

const yearElement =
    document.getElementById("year");


/* =========================================================
PRICE FORMAT
========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(
        Number(price) || 0
    );
}


/* =========================================================
STORAGE PATH CLEANER
========================================================= */

function cleanStoragePath(imagePath) {

    if (!imagePath) {
        return "";
    }

    let cleanPath =
        String(imagePath).trim();

    cleanPath =
        cleanPath.replace(
            /^\/+/,
            ""
        );

    if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://")
    ) {
        return cleanPath;
    }

    return cleanPath;
}


/* =========================================================
STORAGE URL
========================================================= */

function createStorageUrl(imagePath) {

    const cleanPath =
        cleanStoragePath(
            imagePath
        );

    if (!cleanPath) {
        return "";
    }

    if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://")
    ) {
        return cleanPath;
    }

    const encodedPath =
        cleanPath
            .split("/")
            .filter(Boolean)
            .map(
                part =>
                    encodeURIComponent(part)
            )
            .join("/");

    return (
        `${SUPABASE_URL}` +
        `/storage/v1/object/public/` +
        `${STORAGE_BUCKET}/` +
        `${encodedPath}`
    );
}


/* =========================================================
IMAGE CANDIDATES
========================================================= */

function getProductImageCandidates(imagePath) {

    if (!imagePath) {
        return [];
    }

    const value =
        String(imagePath).trim();

    if (!value) {
        return [];
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return [value];
    }

    let cleanPath =
        value.replace(
            /^\/+/,
            ""
        );

    const candidates = [];

    candidates.push(
        createStorageUrl(
            cleanPath
        )
    );

    const withoutOraimages =
        cleanPath.replace(
            /^oraimages\//i,
            ""
        );

    if (
        withoutOraimages &&
        withoutOraimages !== cleanPath
    ) {

        candidates.push(
            createStorageUrl(
                withoutOraimages
            )
        );

    }

    return [
        ...new Set(
            candidates.filter(Boolean)
        )
    ];
}


/* =========================================================
IMAGE FALLBACK
========================================================= */

function setImageWithFallbacks(
    imageElement,
    imagePath,
    altText = "Product image"
) {

    if (!imageElement) {
        return;
    }

    const candidates =
        getProductImageCandidates(
            imagePath
        );

    imageElement.alt =
        altText;

    if (
        candidates.length === 0
    ) {

        imageElement.removeAttribute(
            "src"
        );

        return;
    }

    let currentIndex = 0;

    imageElement.onerror = null;

    imageElement.src =
        candidates[currentIndex];

    imageElement.onerror =
        function () {

            currentIndex++;

            if (
                currentIndex <
                candidates.length
            ) {

                imageElement.src =
                    candidates[currentIndex];

                return;
            }

            imageElement.onerror =
                null;

            imageElement.removeAttribute(
                "src"
            );

            console.error(
                "ORACLE GADGET: Image failed:",
                imagePath
            );

        };
}


/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent =
        String(
            value ?? ""
        );

    return element.innerHTML;
}


/* =========================================================
ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );
}


/* =========================================================
NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(product) {

    let colors =
        AVAILABLE_COLORS;

    if (
        Array.isArray(
            product.colors
        ) &&
        product.colors.length > 0
    ) {

        colors =
            product.colors;

    }

    return {

        id:
            product.id,

        name:
            product.name ||
            "iPhone",

        price:
            Number(
                product.price
            ) || 0,

        description:
            product.description ||
            "",

        storage:
            product.storage ||
            "",

        condition:
            product.condition ||
            "",

        status:
            product.status ||
            "Available",

        colors:
            colors,

        image:
            product.image_url ||
            product.image ||
            "",

        created_at:
            product.created_at ||
            ""

    };
}


/* =========================================================
LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        showLoading();

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {
            throw error;
        }

        products =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "ORACLE GADGET products:",
            products
        );

        renderProducts();

    }

    catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );

        showDatabaseError();

    }
}


/* =========================================================
LOADING
========================================================= */

function showLoading() {

    if (!productsGrid) {
        return;
    }

    productsGrid.innerHTML = `
        <div class="products-loading">
            <p>Loading products...</p>
        </div>
    `;
}


/* =========================================================
DATABASE ERROR
========================================================= */

function showDatabaseError() {

    if (!productsGrid) {
        return;
    }

    productsGrid.innerHTML = `
        <div class="products-error">
            <h3>Unable to load products</h3>
            <p>
                Please refresh the page and try again.
            </p>
        </div>
    `;
}


/* =========================================================
RENDER PRODUCTS
========================================================= */

function renderProducts() {

    if (!productsGrid) {
        return;
    }

    const normalizedProducts =
        products.map(
            normalizeProduct
        );

    const searchTerm =
        currentSearch
            .toLowerCase()
            .trim();

    const filteredProducts =
        normalizedProducts.filter(
            product => {

                let matchesFilter =
                    true;

                if (
                    currentFilter ===
                    "available"
                ) {

                    matchesFilter =
                        String(
                            product.status
                        )
                            .toLowerCase() ===
                        "available";

                }

                if (
                    currentFilter ===
                    "new"
                ) {

                    matchesFilter =
                        String(
                            product.condition
                        )
                            .toLowerCase()
                            .includes(
                                "brand new"
                            );

                }

                const searchableText = `
                    ${product.name}
                    ${product.description}
                    ${product.storage}
                    ${product.condition}
                    ${product.status}
                `.toLowerCase();

                const matchesSearch =
                    searchableText.includes(
                        searchTerm
                    );

                return (
                    matchesFilter &&
                    matchesSearch
                );

            }
        );

    productsGrid.innerHTML = "";

    if (
        filteredProducts.length ===
        0
    ) {

        if (emptyProducts) {
            emptyProducts.hidden = false;
        }

        return;
    }

    if (emptyProducts) {
        emptyProducts.hidden = true;
    }

    filteredProducts.forEach(
        product => {
            createProductCard(
                product
            );
        }
    );

    attachProductButtons();
}


/* =========================================================
PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "product-card";

    if (
        String(
            product.status
        )
            .toLowerCase() !==
        "available"
    ) {

        card.classList.add(
            "sold-out"
        );

    }

    card.innerHTML = `

        <div class="product-image-container">

            <img
                class="product-image"
                alt="${escapeAttribute(
                    product.name
                )}"
                loading="lazy"
            >

        </div>

        <div class="product-info">

            <span class="product-condition">
                ${escapeHTML(
                    product.condition
                )}
            </span>

            <h3 class="product-name">
                ${escapeHTML(
                    product.name
                )}
            </h3>

            <p class="product-description">
                ${escapeHTML(
                    product.description
                )}
            </p>

            <div class="product-bottom">

                <strong class="product-price">
                    ${formatPrice(
                        product.price
                    )}
                </strong>

                <button
                    type="button"
                    class="view-product"
                    data-product-id="${escapeAttribute(
                        product.id
                    )}"
                >
                    View
                </button>

            </div>

        </div>

    `;

    productsGrid.appendChild(
        card
    );

    const image =
        card.querySelector(
            ".product-image"
        );

    setImageWithFallbacks(
        image,
        product.image,
        product.name
    );
}


/* =========================================================
PRODUCT BUTTONS
========================================================= */

function attachProductButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-product"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        this.dataset.productId;

                    const product =
                        products
                            .map(
                                normalizeProduct
                            )
                            .find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        productId
                                    )
                            );

                    if (!product) {

                        console.error(
                            "Product not found:",
                            productId
                        );

                        return;

                    }

                    openProductModal(
                        product
                    );

                }
            );

        }
    );
}


/* =========================================================
COLOR SELECTOR
========================================================= */

function createColorSelector(product) {

    const oldSelector =
        document.getElementById(
            "productColorSelector"
        );

    if (oldSelector) {
        oldSelector.remove();
    }

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.id =
        "productColorSelector";

    wrapper.className =
        "product-color-selector";

    wrapper.style.margin =
        "15px 0";

    const label =
        document.createElement(
            "label"
        );

    label.textContent =
        "Choose Color";

    label.style.display =
        "block";

    label.style.marginBottom =
        "6px";

    const select =
        document.createElement(
            "select"
        );

    select.id =
        "productColor";

    select.style.width =
        "100%";

    select.style.padding =
        "12px";

    select.style.border =
        "1px solid #ccc";

    select.style.borderRadius =
        "8px";

    const colors =
        Array.isArray(
            product.colors
        ) &&
        product.colors.length
            ? product.colors
            : AVAILABLE_COLORS;

    colors.forEach(
        color => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                color;

            option.textContent =
                color;

            select.appendChild(
                option
            );

        }
    );

    selectedColor =
        colors[0] ||
        AVAILABLE_COLORS[0];

    select.value =
        selectedColor;

    select.addEventListener(
        "change",
        event => {

            selectedColor =
                event.target.value;

        }
    );

    wrapper.appendChild(
        label
    );

    wrapper.appendChild(
        select
    );

    return wrapper;
}


/* =========================================================
OPEN PRODUCT MODAL
========================================================= */

function openProductModal(product) {

    if (!productModal) {
        return;
    }

    selectedProduct =
        product;

    selectedColor =
        product.colors?.[0] ||
        AVAILABLE_COLORS[0];

    if (modalImage) {

        setImageWithFallbacks(
            modalImage,
            product.image,
            product.name
        );

    }

    if (modalName) {
        modalName.textContent =
            product.name;
    }

    if (modalDescription) {
        modalDescription.textContent =
            product.description;
    }

    if (modalPrice) {
        modalPrice.textContent =
            formatPrice(
                product.price
            );
    }

    if (modalStorage) {
        modalStorage.textContent =
            product.storage;
    }

    if (modalStatus) {
        modalStatus.textContent =
            product.status;
    }

    if (modalCondition) {

        modalCondition.textContent =
            String(
                product.condition
            ).toUpperCase();

    }

    const colorSelector =
        createColorSelector(
            product
        );

    const details =
        document.querySelector(
            ".modal-details"
        );

    if (details) {

        details.parentNode.insertBefore(
            colorSelector,
            details
        );

    }

    if (modalOrder) {

        modalOrder.removeAttribute(
            "href"
        );

        modalOrder.removeAttribute(
            "target"
        );

        modalOrder.textContent =
            "Add to Cart";

        modalOrder.onclick =
            function (event) {

                event.preventDefault();

                addToCart(
                    selectedProduct,
                    selectedColor
                );

            };

    }

    productModal.classList.add(
        "active"
    );

    productModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
CLOSE PRODUCT MODAL
========================================================= */

function closeProductModal() {

    if (!productModal) {
        return;
    }

    productModal.classList.remove(
        "active"
    );

    productModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    selectedProduct =
        null;

    const selector =
        document.getElementById(
            "productColorSelector"
        );

    if (selector) {
        selector.remove();
    }
}


/* =========================================================
CART STORAGE
========================================================= */

function saveCart() {

    try {

        localStorage.setItem(
            "oracle_gadget_cart",
            JSON.stringify(cart)
        );

    }

    catch (error) {

        console.error(
            "Could not save cart:",
            error
        );

    }
}


/* =========================================================
LOAD CART
========================================================= */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                "oracle_gadget_cart"
            );

        if (!saved) {
            cart = [];
            return;
        }

        const parsed =
            JSON.parse(
                saved
            );

        cart =
            Array.isArray(parsed)
                ? parsed
                : [];

    }

    catch (error) {

        console.error(
            "Could not load cart:",
            error
        );

        cart = [];

    }
}


/* =========================================================
CART TOTAL
========================================================= */

function getCartTotal() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            const price =
                Number(
                    item.unit_price
                ) || 0;

            const quantity =
                Number(
                    item.quantity
                ) || 0;

            return (
                total +
                price * quantity
            );

        },
        0
    );
}


/* =========================================================
CART COUNT
========================================================= */

function getCartCount() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                (
                    Number(
                        item.quantity
                    ) || 0
                )
            );

        },
        0
    );
}


/* =========================================================
ADD TO CART
========================================================= */

function addToCart(
    product,
    color
) {

    if (!product) {
        return;
    }

    if (
        String(
            product.status
        )
            .toLowerCase() !==
        "available"
    ) {

        alert(
            "This product is currently unavailable."
        );

        return;
    }

    const chosenColor =
        color ||
        product.colors?.[0] ||
        AVAILABLE_COLORS[0];

    const existingIndex =
        cart.findIndex(
            item =>
                String(
                    item.product_id
                ) ===
                String(
                    product.id
                ) &&
                item.color ===
                chosenColor
        );

    if (
        existingIndex !==
        -1
    ) {

        cart[
            existingIndex
        ].quantity += 1;

    }

    else {

        cart.push({

            product_id:
                product.id,

            product_name:
                product.name,

            storage:
                product.storage,

            color:
                chosenColor,

            quantity:
                1,

            unit_price:
                Number(
                    product.price
                ) || 0,

            image:
                product.image

        });

    }

    saveCart();

    updateCartButton();

    closeProductModal();

    showCart();
}


/* =========================================================
REMOVE CART ITEM
========================================================= */

function removeFromCart(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }

    cart.splice(
        index,
        1
    );

    saveCart();

    updateCartButton();

    showCart();
}


/* =========================================================
CHANGE CART QUANTITY
========================================================= */

function changeCartQuantity(
    index,
    change
) {

    if (
        !cart[index]
    ) {
        return;
    }

    cart[index].quantity +=
        Number(change);

    if (
        cart[index].quantity <=
        0
    ) {

        cart.splice(
            index,
            1
        );

    }

    saveCart();

    updateCartButton();

    showCart();
}


/* =========================================================
CART BUTTON
========================================================= */

let cartButton = null;

function createCartButton() {

    if (cartButton) {
        return;
    }

    cartButton =
        document.createElement(
            "button"
        );

    cartButton.id =
        "oracleCartButton";

    cartButton.type =
        "button";

    cartButton.textContent =
        "Cart 0";

    cartButton.style.position =
        "fixed";

    cartButton.style.right =
        "20px";

    cartButton.style.bottom =
        "85px";

    cartButton.style.zIndex =
        "9998";

    cartButton.style.background =
        "#000";

    cartButton.style.color =
        "#fff";

    cartButton.style.border =
        "none";

    cartButton.style.borderRadius =
        "30px";

    cartButton.style.padding =
        "15px 22px";

    cartButton.style.fontWeight =
        "700";

    cartButton.style.cursor =
        "pointer";

    cartButton.addEventListener(
        "click",
        showCart
    );

    document.body.appendChild(
        cartButton
    );

    updateCartButton();
}


/* =========================================================
UPDATE CART BUTTON
========================================================= */

function updateCartButton() {

    if (!cartButton) {
        return;
    }

    cartButton.textContent =
        `Cart ${getCartCount()}`;
}


/* =========================================================
CART MODAL
========================================================= */

let cartModal = null;

function createCartModal() {

    if (cartModal) {
        return;
    }

    cartModal =
        document.createElement(
            "div"
        );

    cartModal.id =
        "oracleCartModal";

    cartModal.style.position =
        "fixed";

    cartModal.style.inset =
        "0";

    cartModal.style.zIndex =
        "10000";

    cartModal.style.background =
        "rgba(0,0,0,0.65)";

    cartModal.style.display =
        "none";

    cartModal.style.alignItems =
        "center";

    cartModal.style.justifyContent =
        "center";

    cartModal.innerHTML = `

        <div
            style="
                background:#fff;
                width:min(95%,600px);
                max-height:90vh;
                overflow-y:auto;
                border-radius:16px;
                padding:25px;
                position:relative;
                color:#111;
            "
        >

            <button
                type="button"
                id="closeOracleCart"
                style="
                    position:absolute;
                    top:15px;
                    right:18px;
                    border:none;
                    background:none;
                    font-size:28px;
                    cursor:pointer;
                "
            >
                ×
            </button>

            <h2
                style="
                    margin-top:0;
                    margin-bottom:20px;
                "
            >
                Your Cart
            </h2>

            <div
                id="oracleCartItems"
            ></div>

            <div
                id="oracleCartFooter"
            ></div>

        </div>

    `;

    document.body.appendChild(
        cartModal
    );

    const closeButton =
        document.getElementById(
            "closeOracleCart"
        );

    closeButton.addEventListener(
        "click",
        closeCart
    );

    cartModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                cartModal
            ) {

                closeCart();

            }

        }
    );
}


/* =========================================================
SHOW CART
========================================================= */

function showCart() {

    createCartModal();

    const itemsContainer =
        document.getElementById(
            "oracleCartItems"
        );

    const footer =
        document.getElementById(
            "oracleCartFooter"
        );

    if (
        !itemsContainer ||
        !footer
    ) {
        return;
    }

    if (
        cart.length ===
        0
    ) {

        itemsContainer.innerHTML = `

            <div
                style="
                    padding:30px 10px;
                    text-align:center;
                "
            >
                <h3>Your cart is empty</h3>

                <p>
                    Add an iPhone to your cart
                    before placing an order.
                </p>
            </div>

        `;

        footer.innerHTML = "";

    }

    else {

        itemsContainer.innerHTML =
            cart.map(
                (
                    item,
                    index
                ) => {

                    const subtotal =
                        (
                            Number(
                                item.unit_price
                            ) || 0
                        ) *
                        (
                            Number(
                                item.quantity
                            ) || 0
                        );

                    return `

                        <div
                            style="
                                border-bottom:1px solid #ddd;
                                padding:15px 0;
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    gap:15px;
                                "
                            >

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            item.product_name
                                        )}
                                    </strong>

                                    <p
                                        style="
                                            margin:6px 0;
                                            color:#666;
                                        "
                                    >
                                        Storage:
                                        ${escapeHTML(
                                            item.storage
                                        )}
                                    </p>

                                    <p
                                        style="
                                            margin:6px 0;
                                            color:#666;
                                        "
                                    >
                                        Color:
                                        ${escapeHTML(
                                            item.color
                                        )}
                                    </p>

                                    <strong>
                                        ${formatPrice(
                                            subtotal
                                        )}
                                    </strong>

                                </div>

                                <button
                                    type="button"
                                    class="oracle-remove-item"
                                    data-index="${index}"
                                    style="
                                        border:none;
                                        background:none;
                                        color:#d00;
                                        cursor:pointer;
                                    "
                                >
                                    Remove
                                </button>

                            </div>

                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:12px;
                                    margin-top:12px;
                                "
                            >

                                <button
                                    type="button"
                                    class="oracle-quantity-button"
                                    data-index="${index}"
                                    data-change="-1"
                                >
                                    −
                                </button>

                                <strong>
                                    ${item.quantity}
                                </strong>

                                <button
                                    type="button"
                                    class="oracle-quantity-button"
                                    data-index="${index}"
                                    data-change="1"
                                >
                                    +
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

        const total =
            getCartTotal();

        footer.innerHTML = `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    font-size:20px;
                    font-weight:700;
                    margin:20px 0;
                "
            >
                <span>Total</span>

                <span>
                    ${formatPrice(total)}
                </span>
            </div>

            <button
                type="button"
                id="oracleCheckoutButton"
                style="
                    width:100%;
                    padding:16px;
                    background:#000;
                    color:#fff;
                    border:none;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                Proceed to Checkout
            </button>

        `;

        document
            .querySelectorAll(
                ".oracle-remove-item"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            removeFromCart(
                                Number(
                                    this.dataset.index
                                )
                            );

                        }
                    );

                }
            );

        document
            .querySelectorAll(
                ".oracle-quantity-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            changeCartQuantity(
                                Number(
                                    this.dataset.index
                                ),
                                Number(
                                    this.dataset.change
                                )
                            );

                        }
                    );

                }
            );

        const checkoutButton =
            document.getElementById(
                "oracleCheckoutButton"
            );

        if (checkoutButton) {

            checkoutButton.addEventListener(
                "click",
                openCustomerDetails
            );

        }

    }

    cartModal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
CLOSE CART
========================================================= */

function closeCart() {

    if (!cartModal) {
        return;
    }

    cartModal.style.display =
        "none";

    document.body.style.overflow =
        "";
}


/* =========================================================
CUSTOMER MODAL
========================================================= */

let customerModal = null;

function createCustomerModal() {

    if (customerModal) {
        return;
    }

    customerModal =
        document.createElement(
            "div"
        );

    customerModal.id =
        "oracleCustomerModal";

    customerModal.style.position =
        "fixed";

    customerModal.style.inset =
        "0";

    customerModal.style.zIndex =
        "10001";

    customerModal.style.background =
        "rgba(0,0,0,0.65)";

    customerModal.style.display =
        "none";

    customerModal.style.alignItems =
        "center";

    customerModal.style.justifyContent =
        "center";

    customerModal.innerHTML = `

        <div
            style="
                background:#fff;
                width:min(95%,500px);
                max-height:90vh;
                overflow-y:auto;
                border-radius:16px;
                padding:25px;
                color:#111;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <h2>
                    Customer Details
                </h2>

                <button
                    type="button"
                    id="closeCustomerModal"
                    style="
                        border:none;
                        background:none;
                        font-size:28px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>

            </div>

            <form
                id="oracleCustomerForm"
            >

                <label
                    style="
                        display:block;
                        margin:15px 0 6px;
                    "
                >
                    Full Name
                </label>

                <input
                    type="text"
                    id="oracleFullName"
                    required
                    autocomplete="name"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #bbb;
                        border-radius:8px;
                    "
                >

                <label
                    style="
                        display:block;
                        margin:15px 0 6px;
                    "
                >
                    Phone Number
                </label>

                <input
                    type="tel"
                    id="oraclePhone"
                    required
                    autocomplete="tel"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #bbb;
                        border-radius:8px;
                    "
                >

                <label
                    style="
                        display:block;
                        margin:15px 0 6px;
                    "
                >
                    Delivery Address
                </label>

                <textarea
                    id="oracleDeliveryAddress"
                    required
                    rows="4"
                    autocomplete="street-address"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #bbb;
                        border-radius:8px;
                        resize:vertical;
                    "
                ></textarea>

                <div
                    id="oracleOrderMessage"
                    style="
                        margin-top:15px;
                        display:none;
                    "
                ></div>

                <button
                    type="submit"
                    id="oraclePlaceOrder"
                    style="
                        width:100%;
                        margin-top:20px;
                        padding:16px;
                        background:#000;
                        color:#fff;
                        border:none;
                        border-radius:10px;
                        font-size:16px;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    Place Order
                </button>

            </form>

        </div>

    `;

    document.body.appendChild(
        customerModal
    );

    const closeCustomerButton =
        document.getElementById(
            "closeCustomerModal"
        );

    if (closeCustomerButton) {

        closeCustomerButton.addEventListener(
            "click",
            closeCustomerDetails
        );

    }

    const customerForm =
        document.getElementById(
            "oracleCustomerForm"
        );

    if (customerForm) {

        customerForm.addEventListener(
            "submit",
            handlePlaceOrder
        );

    }
}


/* =========================================================
OPEN CUSTOMER DETAILS
========================================================= */

function openCustomerDetails() {

    if (
        cart.length ===
        0
    ) {

        alert(
            "Your cart is empty."
        );

        return;
    }

    createCustomerModal();

    closeCart();

    customerModal.style.display =
        "flex";

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
CLOSE CUSTOMER DETAILS
========================================================= */

function closeCustomerDetails() {

    if (!customerModal) {
        return;
    }

    customerModal.style.display =
        "none";

    document.body.style.overflow =
        "";
}


/* =========================================================
SHOW ORDER MESSAGE
========================================================= */

function showOrderMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "oracleOrderMessage"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.style.display =
        "block";

    if (
        type ===
        "error"
    ) {

        element.style.color =
            "red";

    }

    else {

        element.style.color =
            "green";

    }
}


/* =========================================================
GENERATE ORDER REFERENCE
========================================================= */

function generateOrderReference() {

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );

    return (
        `OG-${year}${month}${day}-${random}`
    );
}


/* =========================================================
NORMALIZE PHONE
========================================================= */

function normalizePhone(phone) {

    let value =
        String(
            phone || ""
        )
            .trim()
            .replace(
                /\s+/g,
                ""
            );

    if (
        value.startsWith("+")
    ) {

        value =
            value.substring(1);

    }

    if (
        value.startsWith("0")
    ) {

        value =
            "234" +
            value.substring(1);

    }

    return value;
}


/* =========================================================
FIND OR CREATE CUSTOMER
========================================================= */

async function findOrCreateCustomer(
    fullName,
    phone,
    deliveryAddress
) {

    const normalizedPhone =
        normalizePhone(
            phone
        );

    const {
        data: existingCustomers,
        error: searchError
    } =
        await supabaseClient
            .from("customers")
            .select(
                "id, full_name, phone, delivery_address"
            )
            .eq(
                "phone",
                normalizedPhone
            )
            .limit(1);

    if (searchError) {

        console.error(
            "CUSTOMER SEARCH ERROR:",
            searchError
        );

        throw searchError;

    }

    if (
        existingCustomers &&
        existingCustomers.length > 0
    ) {

        const customer =
            existingCustomers[0];

        const {
            data: updatedCustomer,
            error: updateError
        } =
            await supabaseClient
                .from("customers")
                .update({

                    full_name:
                        fullName,

                    phone:
                        normalizedPhone,

                    delivery_address:
                        deliveryAddress,

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    customer.id
                )
                .select()
                .single();

        if (updateError) {
            throw updateError;
        }

        return updatedCustomer;
    }


    /* =====================================================
    NEW CUSTOMER
    ===================================================== */

    const {
        data: newCustomer,
        error: insertError
    } =
        await supabaseClient
            .from("customers")
            .insert({

                full_name:
                    fullName,

                phone:
                    normalizedPhone,

                delivery_address:
                    deliveryAddress

            })
            .select()
            .single();

    if (insertError) {

        console.error(
            "CUSTOMER INSERT ERROR:",
            insertError
        );

        throw insertError;

    }

    return newCustomer;
}


/* =========================================================
CREATE ORDER
========================================================= */

async function createOrder(
    customer,
    deliveryAddress
) {

    const orderReference =
        generateOrderReference();

    const total =
        getCartTotal();

    const orderData = {

        customer_id:
            customer.id,

        status:
            "Pending",

        total:
            Number(total),

        order_reference:
            orderReference,

        delivery_address:
            deliveryAddress

    };

    const {
        data: order,
        error: orderError
    } =
        await supabaseClient
            .from("orders")
            .insert(
                orderData
            )
            .select()
            .single();

    if (orderError) {

        console.error(
            "ORDER INSERT ERROR:",
            orderError
        );

        throw orderError;

    }

    return order;
}


/* =========================================================
CREATE ORDER ITEMS
========================================================= */

async function createOrderItems(
    orderId
) {

    const items =
        cart.map(
            item => {

                const quantity =
                    Number(
                        item.quantity
                    ) || 0;

                const unitPrice =
                    Number(
                        item.unit_price
                    ) || 0;

                return {

                    order_id:
                        orderId,

                    product_id:
                        item.product_id,

                    product_name:
                        item.product_name,

                    storage:
                        item.storage,

                    color:
                        item.color,

                    quantity:
                        quantity,

                    unit_price:
                        unitPrice,

                    subtotal:
                        unitPrice *
                        quantity

                };

            }
        );

    const {
        data,
        error
    } =
        await supabaseClient
            .from("order_items")
            .insert(
                items
            )
            .select();

    if (error) {

        console.error(
            "ORDER ITEMS ERROR:",
            error
        );

        throw error;

    }

    return data;
}


/* =========================================================
WHATSAPP MESSAGE
========================================================= */

function createOrderWhatsAppMessage(
    customer,
    order
) {

    let message =
        `Hello ${BUSINESS.name},\n\n`;

    message +=
        `NEW ORDER\n\n`;

    message +=
        `Order ID: ${order.order_reference || order.id}\n`;

    message +=
        `Customer: ${customer.full_name}\n`;

    message +=
        `Phone: ${customer.phone}\n`;

    message +=
        `Delivery Address: ${customer.delivery_address}\n\n`;

    message +=
        `ITEMS:\n`;

    cart.forEach(
        (
            item,
            index
        ) => {

            const subtotal =
                (
                    Number(
                        item.unit_price
                    ) || 0
                ) *
                (
                    Number(
                        item.quantity
                    ) || 0
                );

            message +=
                `${index + 1}. ${item.product_name}\n`;

            message +=
                `Storage: ${item.storage}\n`;

            message +=
                `Color: ${item.color}\n`;

            message +=
                `Quantity: ${item.quantity}\n`;

            message +=
                `Unit Price: ${formatPrice(
                    item.unit_price
                )}\n`;

            message +=
                `Subtotal: ${formatPrice(
                    subtotal
                )}\n\n`;

        }
    );

    message +=
        `TOTAL: ${formatPrice(
            getCartTotal()
        )}\n\n`;

    message +=
        `Status: Pending`;

    return encodeURIComponent(
        message
    );
}


/* =========================================================
PLACE ORDER
FIXED CHECKOUT FLOW
========================================================= */

async function handlePlaceOrder(
    event
) {

    event.preventDefault();

    if (
        cart.length ===
        0
    ) {

        showOrderMessage(
            "Your cart is empty.",
            "error"
        );

        return;
    }

    const fullNameInput =
        document.getElementById(
            "oracleFullName"
        );

    const phoneInput =
        document.getElementById(
            "oraclePhone"
        );

    const addressInput =
        document.getElementById(
            "oracleDeliveryAddress"
        );

    const placeOrderButton =
        document.getElementById(
            "oraclePlaceOrder"
        );

    if (
        !fullNameInput ||
        !phoneInput ||
        !addressInput ||
        !placeOrderButton
    ) {

        console.error(
            "CHECKOUT ERROR: Customer form elements are missing."
        );

        return;
    }

    const fullName =
        fullNameInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const deliveryAddress =
        addressInput.value.trim();

    if (
        !fullName ||
        !phone ||
        !deliveryAddress
    ) {

        showOrderMessage(
            "Please complete all customer details.",
            "error"
        );

        return;
    }


    /* =====================================================
    PREVENT DOUBLE SUBMISSION
    ===================================================== */

    placeOrderButton.disabled =
        true;

    placeOrderButton.textContent =
        "Placing Order...";

    showOrderMessage(
        "Submitting your order...",
        "success"
    );


    try {

        /* =================================================
        STEP 1
        FIND OR CREATE CUSTOMER
        ================================================= */

        const customer =
            await findOrCreateCustomer(
                fullName,
                phone,
                deliveryAddress
            );

        console.log(
            "CUSTOMER CREATED/FOUND:",
            customer
        );


        /* =================================================
        STEP 2
        CREATE ORDER
        ================================================= */

        const order =
            await createOrder(
                customer,
                deliveryAddress
            );

        console.log(
            "ORDER CREATED:",
            order
        );


        /* =================================================
        STEP 3
        CREATE ORDER ITEMS
        ================================================= */

        await createOrderItems(
            order.id
        );


        /* =================================================
        STEP 4
        BUILD WHATSAPP MESSAGE
        ================================================= */

        const message =
            createOrderWhatsAppMessage(
                customer,
                order
            );

        const whatsappUrl =
            `https://wa.me/${BUSINESS.phone}?text=${message}`;


        /* =================================================
        STEP 5
        CLEAR CART ONLY AFTER
        SUPABASE SUCCESS
        ================================================= */

        cart = [];

        saveCart();

        updateCartButton();


        /* =================================================
        STEP 6
        CLOSE CUSTOMER MODAL
        ================================================= */

        closeCustomerDetails();


        /* =================================================
        STEP 7
        SUCCESS MESSAGE
        ================================================= */

        alert(
            `Order placed successfully!\n\nOrder ID: ${
                order.order_reference ||
                order.id
            }\n\nYou will now be taken to WhatsApp to send the order.`
        );


        /* =================================================
        STEP 8
        NAVIGATE CURRENT TAB TO WHATSAPP

        IMPORTANT:
        Do NOT use window.open().
        Current-page navigation avoids popup blocking.
        ================================================= */

        window.location.href =
            whatsappUrl;

    }

    catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );

        showOrderMessage(
            "Unable to place order. Please try again.",
            "error"
        );


        /* =================================================
        IMPORTANT

        Cart is intentionally NOT cleared if
        any Supabase operation fails.
        ================================================= */

    }

    finally {

        placeOrderButton.disabled =
            false;

        placeOrderButton.textContent =
            "Place Order";

    }
}


/* =========================================================
SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;

            renderProducts();

        }
    );

}


/* =========================================================
FILTER BUTTONS
========================================================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );

                button.classList.add(
                    "active"
                );

                currentFilter =
                    button.dataset.filter;

                renderProducts();

            }
        );

    }
);


/* =========================================================
CLOSE PRODUCT MODAL
========================================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeProductModal
    );

}


/* =========================================================
PRODUCT MODAL OVERLAY
========================================================= */

if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeProductModal
    );

}


/* =========================================================
ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            if (
                productModal &&
                productModal.classList.contains(
                    "active"
                )
            ) {

                closeProductModal();

            }

            if (
                cartModal &&
                cartModal.style.display ===
                "flex"
            ) {

                closeCart();

            }

            if (
                customerModal &&
                customerModal.style.display ===
                "flex"
            ) {

                closeCustomerDetails();

            }

        }

    }
);


/* =========================================================
MOBILE MENU
========================================================= */

if (
    menuButton &&
    mobileNav
) {

    menuButton.addEventListener(
        "click",
        () => {

            mobileNav.classList.toggle(
                "active"
            );

            const expanded =
                mobileNav.classList.contains(
                    "active"
                );

            menuButton.setAttribute(
                "aria-expanded",
                String(expanded)
            );

        }
    );

    const mobileLinks =
        mobileNav.querySelectorAll(
            "a"
        );

    mobileLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    mobileNav.classList.remove(
                        "active"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        }
    );
}


/* =========================================================
SNAPCHAT
========================================================= */

const snapchatLink =
    document.getElementById(
        "snapchatLink"
    );

if (snapchatLink) {

    snapchatLink.addEventListener(
        "click",
        event => {

            event.preventDefault();

            alert(
                "Snapchat: militaryoracele / oracle_gadget"
            );

        }
    );
}


/* =========================================================
YEAR
========================================================= */

if (yearElement) {

    yearElement.textContent =
        new Date()
            .getFullYear();

}


/* =========================================================
INITIALIZE CART
========================================================= */

function initializeCart() {

    loadCart();

    createCartButton();

    createCartModal();

    createCustomerModal();
}


/* =========================================================
INITIALIZE WEBSITE
========================================================= */

async function initializeWebsite() {

    initializeCart();

    await loadProducts();
}


/* =========================================================
START
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeWebsite
    );

}

else {

    initializeWebsite();

}
