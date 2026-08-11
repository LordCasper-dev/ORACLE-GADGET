/* =========================================================
   ORACLE GADGET
   COMPLETE SUPABASE STOREFRONT JAVASCRIPT
   FIXED PRODUCT IMAGE SYSTEM
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://hdconkdghgtysyzqvqko.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jOqTfV2bwlFT1FM1xYnJKQ_sOYzDsyD";


/* =========================================================
   CREATE SUPABASE CLIENT
========================================================= */

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
    tiktok: "@military_oracle",
    instagram: "ezeani71578",
    snapchat: "militaryoracele / oracle_gadget"
};


/* =========================================================
   SUPABASE STORAGE
========================================================= */

const STORAGE_BUCKET =
    "product-images";


/* =========================================================
   AVAILABLE COLORS
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

let selectedColor =
    AVAILABLE_COLORS[0];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const productsGrid =
    document.getElementById(
        "productsGrid"
    );

const emptyProducts =
    document.getElementById(
        "emptyProducts"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const mobileNav =
    document.getElementById(
        "mobileNav"
    );

const productModal =
    document.getElementById(
        "productModal"
    );

const modalOverlay =
    document.getElementById(
        "modalOverlay"
    );

const modalClose =
    document.getElementById(
        "modalClose"
    );

const modalImage =
    document.getElementById(
        "modalImage"
    );

const modalName =
    document.getElementById(
        "modalName"
    );

const modalDescription =
    document.getElementById(
        "modalDescription"
    );

const modalPrice =
    document.getElementById(
        "modalPrice"
    );

const modalStorage =
    document.getElementById(
        "modalStorage"
    );

const modalStatus =
    document.getElementById(
        "modalStatus"
    );

const modalCondition =
    document.getElementById(
        "modalCondition"
    );

const modalOrder =
    document.getElementById(
        "modalOrder"
    );

const yearElement =
    document.getElementById(
        "year"
    );


/* =========================================================
   FORMAT PRICE
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
   CLEAN STORAGE PATH
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

    /*
       If database already contains
       a complete URL, keep it.
    */

    if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://")
    ) {

        return cleanPath;

    }

    return cleanPath;

}


/* =========================================================
   CREATE SUPABASE STORAGE URL
========================================================= */

function createStorageUrl(imagePath) {

    const cleanPath =
        cleanStoragePath(
            imagePath
        );

    if (!cleanPath) {
        return "";
    }

    /*
       Already a complete URL.
    */

    if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://")
    ) {

        return cleanPath;

    }

    /*
       Encode each path section separately.

       This is important because filenames such as:

       iphone xr.jpg

       contain spaces.
    */

    const encodedPath =
        cleanPath
            .split("/")
            .filter(Boolean)
            .map(
                part =>
                    encodeURIComponent(
                        part
                    )
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
   GET PRODUCT IMAGE CANDIDATES
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

    const candidates = [];

    /*
       If Supabase/database already contains
       a complete URL, use it first.
    */

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {

        candidates.push(value);

        return [
            ...new Set(candidates)
        ];

    }


    /*
       Remove accidental leading slash.
    */

    let cleanPath =
        value.replace(
            /^\/+/,
            ""
        );


    /*
       IMPORTANT:

       If the database contains:

       oraimages/iphone xr.jpg

       try BOTH:

       product-images/oraimages/iphone xr.jpg

       and

       product-images/iphone xr.jpg

       This means old records can still work.
    */

    const withoutOraimages =
        cleanPath.replace(
            /^oraimages\//i,
            ""
        );


    /*
       1. Exact database path
    */

    candidates.push(
        createStorageUrl(
            cleanPath
        )
    );


    /*
       2. Root product-images path

       This specifically supports:

       product-images/iphone xr.jpg
    */

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


    /*
       If the path did not contain oraimages,
       also keep the exact root path.
    */

    if (
        !cleanPath
            .toLowerCase()
            .startsWith(
                "oraimages/"
            )
    ) {

        candidates.push(
            createStorageUrl(
                cleanPath
            )
        );

    }


    /*
       Remove duplicates and empty values.
    */

    return [
        ...new Set(
            candidates.filter(Boolean)
        )
    ];

}


/* =========================================================
   GET IMAGE URL
========================================================= */

function getProductImageUrl(imagePath) {

    const candidates =
        getProductImageCandidates(
            imagePath
        );

    return candidates[0] || "";

}


/* =========================================================
   SET IMAGE WITH FALLBACKS
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


    /*
       No image path.
    */

    if (
        candidates.length === 0
    ) {

        imageElement.removeAttribute(
            "src"
        );

        imageElement.classList.add(
            "image-unavailable"
        );

        return;

    }


    let currentIndex = 0;


    imageElement.classList.remove(
        "image-unavailable"
    );


    /*
       Remove previous error handler
       before assigning a new one.
    */

    imageElement.onerror =
        null;


    imageElement.src =
        candidates[currentIndex];


    /*
       If the first image fails,
       automatically try the next one.
    */

    imageElement.onerror =
        function () {

            currentIndex++;


            if (
                currentIndex <
                candidates.length
            ) {

                imageElement.src =
                    candidates[
                        currentIndex
                    ];

                return;

            }


            /*
               Every possible location
               failed.

               Do NOT insert a fake image
               or ORACLE logo.
            */

            imageElement.onerror =
                null;

            imageElement.removeAttribute(
                "src"
            );

            imageElement.classList.add(
                "image-unavailable"
            );

            console.error(
                "ORACLE GADGET: Unable to load image:",
                imagePath,
                candidates
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
                .from(
                    "products"
                )
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
            "ORACLE GADGET - Product loading error:",
            error
        );

        showDatabaseError();

    }

}


/* =========================================================
   LOADING MESSAGE
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


                /*
                   AVAILABLE
                */

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


                /*
                   BRAND NEW
                */

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


                /*
                   SEARCH
                */

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


    productsGrid.innerHTML =
        "";


    /*
       NO PRODUCTS
    */

    if (
        filteredProducts.length ===
        0
    ) {

        if (emptyProducts) {

            emptyProducts.hidden =
                false;

        }

        return;

    }


    if (emptyProducts) {

        emptyProducts.hidden =
            true;

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
   CREATE PRODUCT CARD
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
                    aria-label="View ${escapeAttribute(
                        product.name
                    )}"
                >
                    →
                </button>

            </div>

        </div>

    `;


    productsGrid.appendChild(
        card
    );


    /*
       Set the image after the
       card has been added to DOM.
    */

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
   ATTACH PRODUCT BUTTONS
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
                () => {

                    const productId =
                        button.dataset
                            .productId;


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
   CREATE COLOR SELECTOR
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


    const label =
        document.createElement(
            "label"
        );


    label.setAttribute(
        "for",
        "productColor"
    );


    label.textContent =
        "Choose Color";


    const select =
        document.createElement(
            "select"
        );


    select.id =
        "productColor";


    select.name =
        "productColor";


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

            updateWhatsAppButton();

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


    /*
       IMAGE
    */

    if (modalImage) {

        modalImage.alt =
            product.name;


        setImageWithFallbacks(
            modalImage,
            product.image,
            product.name
        );

    }


    /*
       NAME
    */

    if (modalName) {

        modalName.textContent =
            product.name;

    }


    /*
       DESCRIPTION
    */

    if (modalDescription) {

        modalDescription.textContent =
            product.description;

    }


    /*
       PRICE
    */

    if (modalPrice) {

        modalPrice.textContent =
            formatPrice(
                product.price
            );

    }


    /*
       STORAGE
    */

    if (modalStorage) {

        modalStorage.textContent =
            product.storage;

    }


    /*
       STATUS
    */

    if (modalStatus) {

        modalStatus.textContent =
            product.status;

    }


    /*
       CONDITION
    */

    if (modalCondition) {

        modalCondition.textContent =
            String(
                product.condition
            ).toUpperCase();

    }


    /*
       COLOR SELECTOR
    */

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


    updateWhatsAppButton();


    /*
       OPEN MODAL
    */

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
   CREATE WHATSAPP MESSAGE
========================================================= */

function createWhatsAppMessage(
    product,
    color
) {

    const message =

        `Hello ${BUSINESS.name},\n\n` +

        `I am interested in:\n` +

        `Product: ${product.name}\n` +

        `Storage: ${product.storage}\n` +

        `Color: ${color}\n` +

        `Condition: ${product.condition}\n` +

        `Price: ${formatPrice(
            product.price
        )}\n\n` +

        `Please confirm availability.`;


    return encodeURIComponent(
        message
    );

}


/* =========================================================
   UPDATE WHATSAPP BUTTON
========================================================= */

function updateWhatsAppButton() {

    if (
        !selectedProduct ||
        !modalOrder
    ) {

        return;

    }


    const message =
        createWhatsAppMessage(
            selectedProduct,
            selectedColor
        );


    modalOrder.href =
        `https://wa.me/${BUSINESS.phone}?text=${message}`;

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


    selectedColor =
        AVAILABLE_COLORS[0];


    const selector =
        document.getElementById(
            "productColorSelector"
        );


    if (selector) {
        selector.remove();
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
   MODAL CLOSE BUTTON
========================================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeProductModal
    );

}


/* =========================================================
   MODAL OVERLAY
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
            event.key === "Escape" &&
            productModal &&
            productModal.classList.contains(
                "active"
            )
        ) {

            closeProductModal();

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
   CURRENT YEAR
========================================================= */

if (yearElement) {

    yearElement.textContent =
        new Date()
            .getFullYear();

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeWebsite() {

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

} else {

    initializeWebsite();

}