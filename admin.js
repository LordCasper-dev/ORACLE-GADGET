/* =========================================================
   ORACLE GADGET ADMIN SYSTEM
   PRODUCTS + ORDERS + CUSTOMERS
   SUPABASE VERSION
   COMPLETE ADMIN JAVASCRIPT
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
   ADMIN CONFIG
   ========================================================= */

const ADMIN_EMAIL =
    "ezeanifrancis15@gmail.com";

const STORAGE_BUCKET =
    "product-images";

const STORAGE_FOLDER =
    "oraimages";

/*
   Personal admin control.

   If your HTML already contains elements for these controls,
   the script will automatically connect to them.

   Supported IDs:
   adminStatusToggle
   adminAccountStatus
   activateAdmin
   suspendAdmin
   adminStatusMessage
*/

const PERSONAL_ADMIN_EMAIL =
    ADMIN_EMAIL;


/* =========================================================
   DATABASE TABLES
   ========================================================= */

const CUSTOMER_TABLE =
    "customer";

const ORDERS_TABLE =
    "orders";

const ORDER_ITEMS_TABLE =
    "order_items";

const PRODUCTS_TABLE =
    "products";


/* =========================================================
   STATE
   ========================================================= */

let products = [];
let orders = [];
let customers = [];
let orderItems = [];

let editingProduct = null;
let selectedImageFile = null;

let loadingAdmin = false;
let deletingCustomer = false;
let deletingOrder = false;
let deletingProduct = false;


/* =========================================================
   DOM
   ========================================================= */

/* Authentication */

const loginScreen =
    document.getElementById("loginScreen");

const adminApp =
    document.getElementById("adminApp");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const logoutButton =
    document.getElementById("logoutButton");

const adminEmail =
    document.getElementById("adminEmail");

const pageTitle =
    document.getElementById("pageTitle");


/* =========================================================
   DASHBOARD
   ========================================================= */

const totalProducts =
    document.getElementById("totalProducts");

const availableProducts =
    document.getElementById("availableProducts");

const soldProducts =
    document.getElementById("soldProducts");

const productValue =
    document.getElementById("productValue");

const totalOrders =
    document.getElementById("totalOrders");

const totalCustomers =
    document.getElementById("totalCustomers");

const pendingOrders =
    document.getElementById("pendingOrders");

const totalSales =
    document.getElementById("totalSales");

const miniProducts =
    document.getElementById("miniProducts");

const recentOrders =
    document.getElementById("recentOrders");


/* =========================================================
   PRODUCTS
   ========================================================= */

const adminProducts =
    document.getElementById("adminProducts");

const adminSearch =
    document.getElementById("adminSearch");

const adminStatusFilter =
    document.getElementById("adminStatusFilter");


/* =========================================================
   ORDERS
   ========================================================= */

const adminOrders =
    document.getElementById("adminOrders");

const orderSearch =
    document.getElementById("orderSearch");

const orderStatusFilter =
    document.getElementById("orderStatusFilter");


/* =========================================================
   CUSTOMERS
   ========================================================= */

const adminCustomers =
    document.getElementById("adminCustomers");

const customerSearch =
    document.getElementById("customerSearch");


/* =========================================================
   PRODUCT MODAL
   ========================================================= */

const productModal =
    document.getElementById("productModal");

const productModalOverlay =
    document.getElementById("productModalOverlay");

const closeProductModal =
    document.getElementById("closeProductModal");

const cancelProduct =
    document.getElementById("cancelProduct");

const productForm =
    document.getElementById("productForm");

const productModalTitle =
    document.getElementById("productModalTitle");

const productId =
    document.getElementById("productId");

const productName =
    document.getElementById("productName");

const productPrice =
    document.getElementById("productPrice");

const productStorage =
    document.getElementById("productStorage");

const productCondition =
    document.getElementById("productCondition");

const productStatus =
    document.getElementById("productStatus");

const productDescription =
    document.getElementById("productDescription");

const productImage =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");

const saveProduct =
    document.getElementById("saveProduct");

const productMessage =
    document.getElementById("productMessage");

const colorGrid =
    document.getElementById("colorGrid");


/* =========================================================
   PERSONAL ADMIN CONTROLS
   ========================================================= */

const adminStatusToggle =
    document.getElementById("adminStatusToggle");

const adminAccountStatus =
    document.getElementById("adminAccountStatus");

const activateAdmin =
    document.getElementById("activateAdmin");

const suspendAdmin =
    document.getElementById("suspendAdmin");

const adminStatusMessage =
    document.getElementById("adminStatusMessage");


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
   DATE FORMAT
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


/* =========================================================
   SUPABASE ERROR
   ========================================================= */

function getSupabaseErrorMessage(error) {

    if (!error) {
        return "Unknown Supabase error.";
    }

    return (
        error.message ||
        error.details ||
        error.hint ||
        JSON.stringify(error)
    );
}


/* =========================================================
   IMAGE PATH CLEANING
   ========================================================= */

function cleanImagePath(imagePath) {

    if (!imagePath) {
        return "";
    }

    return String(imagePath)
        .trim()
        .replace(/^\/+/, "");
}


/* =========================================================
   CREATE STORAGE URL
   ========================================================= */

function createStorageUrl(path) {

    if (!path) {
        return "";
    }

    const cleanPath =
        cleanImagePath(path);

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
        SUPABASE_URL +
        "/storage/v1/object/public/" +
        STORAGE_BUCKET +
        "/" +
        encodedPath
    );
}


/* =========================================================
   IMAGE CANDIDATES
   ========================================================= */

function getImageCandidates(imagePath) {

    if (!imagePath) {
        return [];
    }

    const original =
        cleanImagePath(imagePath);

    if (!original) {
        return [];
    }

    if (
        original.startsWith("http://") ||
        original.startsWith("https://")
    ) {
        return [original];
    }

    const candidates = [];

    const withoutFolder =
        original.replace(
            /^oraimages[\\/]/i,
            ""
        );

    candidates.push(
        createStorageUrl(original)
    );

    if (
        withoutFolder !== original
    ) {
        candidates.push(
            createStorageUrl(
                withoutFolder
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
   IMAGE LOADER
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
        getImageCandidates(
            imagePath
        );

    imageElement.alt =
        altText;

    imageElement.onerror =
        null;

    if (!candidates.length) {

        imageElement.removeAttribute(
            "src"
        );

        return;
    }

    let index = 0;

    imageElement.src =
        candidates[index];

    imageElement.onerror =
        function () {

            index++;

            if (
                index <
                candidates.length
            ) {

                imageElement.src =
                    candidates[index];

                return;
            }

            imageElement.onerror =
                null;

            imageElement.removeAttribute(
                "src"
            );
        };
}


/* =========================================================
   LOGIN SCREEN
   ========================================================= */

function showLogin() {

    if (loginScreen) {
        loginScreen.hidden = false;
    }

    if (adminApp) {
        adminApp.hidden = true;
    }
}


function showLoginError(message) {

    if (loginMessage) {
        loginMessage.textContent =
            message;
    }
}


function setLoginLoading(loading) {

    if (!loginButton) {
        return;
    }

    loginButton.disabled =
        loading;

    loginButton.textContent =
        loading
            ? "Signing In..."
            : "Sign In";
}


/* =========================================================
   SHOW ADMIN
   ========================================================= */

async function showAdminApp(user) {

    if (
        !user ||
        user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
    ) {

        showLogin();

        return;
    }

    if (loginScreen) {
        loginScreen.hidden = true;
    }

    if (adminApp) {
        adminApp.hidden = false;
    }

    if (adminEmail) {
        adminEmail.textContent =
            user.email;
    }

    await loadAllAdminData();

    setupPersonalAdminControls();
}


/* =========================================================
   SESSION CHECK
   ========================================================= */

async function checkAdminSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        const session =
            data.session;

        if (!session) {

            showLogin();

            return;
        }

        const user =
            session.user;

        if (
            user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient.auth.signOut();

            showLoginError(
                "This account is not authorized."
            );

            showLogin();

            return;
        }

        await showAdminApp(user);

    } catch (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();
    }
}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const email =
                loginEmail.value
                    .trim()
                    .toLowerCase();

            const password =
                loginPassword.value;

            if (
                email !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                showLoginError(
                    "Unauthorized email address."
                );

                return;
            }

            if (!password) {

                showLoginError(
                    "Enter your password."
                );

                return;
            }

            setLoginLoading(true);

            showLoginError("");

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });

                if (error) {
                    throw error;
                }

                if (
                    data.user?.email?.toLowerCase() !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    await supabaseClient.auth.signOut();

                    throw new Error(
                        "This account is not authorized."
                    );
                }

                await showAdminApp(
                    data.user
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                showLoginError(
                    getSupabaseErrorMessage(
                        error
                    )
                );

            } finally {

                setLoginLoading(false);
            }
        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await supabaseClient.auth.signOut();

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );
            }

            products = [];
            orders = [];
            customers = [];
            orderItems = [];

            showLogin();

            if (loginPassword) {
                loginPassword.value = "";
            }
        }
    );
}


/* =========================================================
   AUTH STATE
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (
            event === "SIGNED_OUT" ||
            !session
        ) {

            showLogin();

            return;
        }

        const user =
            session.user;

        if (
            user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient.auth.signOut();

            showLogin();

            return;
        }

        if (!loadingAdmin) {

            await showAdminApp(
                user
            );
        }
    }
);


/* =========================================================
   LOAD ALL DATA
   ========================================================= */

async function loadAllAdminData() {

    if (loadingAdmin) {
        return;
    }

    loadingAdmin = true;

    try {

        await Promise.all([
            loadProducts(),
            loadCustomers(),
            loadOrders()
        ]);

        await loadOrderItems();

        updateDashboard();

        renderAdminProducts();
        renderMiniProducts();
        renderAdminOrders();
        renderAdminCustomers();
        renderRecentOrders();

    } catch (error) {

        console.error(
            "Admin data loading error:",
            error
        );

    } finally {

        loadingAdmin = false;
    }
}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(PRODUCTS_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        products =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Load products error:",
            error
        );

        products = [];
    }
}


/* =========================================================
   LOAD CUSTOMERS
   ========================================================= */

async function loadCustomers() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(CUSTOMER_TABLE)
                .select(
                    "id,full_name,phone,delivery_address,created_at,updated_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        customers =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Load customers error:",
            error
        );

        customers = [];
    }
}


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(ORDERS_TABLE)
                .select(
                    "id,customer_id,status,total,created_at,updated_at,order_reference,delivery_address,quantity,subtotal"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        orders =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );

        orders = [];
    }
}


/* =========================================================
   LOAD ORDER ITEMS
   ========================================================= */

async function loadOrderItems() {

    try {

        if (!orders.length) {

            orderItems = [];

            return;
        }

        const orderIds =
            orders.map(
                order => order.id
            );

        const {
            data,
            error
        } =
            await supabaseClient
                .from(ORDER_ITEMS_TABLE)
                .select(
                    "id,order_id,product_id,product_name,storage,color,quantity,unit_price,subtotal,created_at"
                )
                .in(
                    "order_id",
                    orderIds
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {
            throw error;
        }

        orderItems =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Load order items error:",
            error
        );

        orderItems = [];
    }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const total =
        products.length;

    const available =
        products.filter(
            product =>
                String(
                    product.status
                ).toLowerCase() ===
                "available"
        ).length;

    const sold =
        products.filter(
            product =>
                String(
                    product.status
                ).toLowerCase() !==
                "available"
        ).length;

    const value =
        products.reduce(
            (
                sum,
                product
            ) =>
                sum +
                (
                    Number(
                        product.price
                    ) || 0
                ),
            0
        );

    const pending =
        orders.filter(
            order =>
                String(
                    order.status
                ).toLowerCase() ===
                "pending"
        ).length;

    const sales =
        orders
            .filter(
                order =>
                    String(
                        order.status
                    ).toLowerCase() !==
                    "cancelled"
            )
            .reduce(
                (
                    sum,
                    order
                ) =>
                    sum +
                    (
                        Number(
                            order.total
                        ) || 0
                    ),
                0
            );

    if (totalProducts) {
        totalProducts.textContent =
            total;
    }

    if (availableProducts) {
        availableProducts.textContent =
            available;
    }

    if (soldProducts) {
        soldProducts.textContent =
            sold;
    }

    if (productValue) {
        productValue.textContent =
            formatPrice(value);
    }

    if (totalOrders) {
        totalOrders.textContent =
            orders.length;
    }

    if (totalCustomers) {
        totalCustomers.textContent =
            customers.length;
    }

    if (pendingOrders) {
        pendingOrders.textContent =
            pending;
    }

    if (totalSales) {
        totalSales.textContent =
            formatPrice(sales);
    }
}


/* =========================================================
   MINI PRODUCTS
   ========================================================= */

function renderMiniProducts() {

    if (!miniProducts) {
        return;
    }

    miniProducts.innerHTML = "";

    if (!products.length) {

        miniProducts.innerHTML =
            "<p>No products found.</p>";

        return;
    }

    products
        .slice(0, 10)
        .forEach(
            product => {

                const item =
                    document.createElement("div");

                item.className =
                    "mini-product";

                item.innerHTML = `
                    <img
                        alt="${escapeAttribute(
                            product.name
                        )}"
                    >

                    <div class="mini-product-info">

                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>

                        <span>
                            ${formatPrice(
                                product.price
                            )}
                        </span>

                    </div>
                `;

                setImageWithFallbacks(
                    item.querySelector("img"),
                    product.image_url,
                    product.name
                );

                miniProducts.appendChild(item);
            }
        );
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderAdminProducts() {

    if (!adminProducts) {
        return;
    }

    const search =
        adminSearch
            ? adminSearch.value
                .trim()
                .toLowerCase()
            : "";

    const status =
        adminStatusFilter
            ? adminStatusFilter.value
            : "all";

    const filtered =
        products.filter(
            product => {

                const searchable = [
                    product.name,
                    product.description,
                    product.storage,
                    product.condition
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    searchable.includes(
                        search
                    );

                const matchesStatus =
                    status === "all" ||
                    String(
                        product.status
                    ).toLowerCase() ===
                    String(status).toLowerCase();

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );

    adminProducts.innerHTML = "";

    if (!filtered.length) {

        adminProducts.innerHTML = `
            <div class="products-empty">
                No products found.
            </div>
        `;

        return;
    }

    filtered.forEach(
        product => {

            const card =
                document.createElement("article");

            const available =
                String(
                    product.status
                ).toLowerCase() ===
                "available";

            card.className =
                "admin-product-card";

            card.innerHTML = `

                <div class="admin-product-image">

                    <img
                        alt="${escapeAttribute(
                            product.name
                        )}"
                    >

                </div>

                <div class="admin-product-info">

                    <span class="
                        product-status
                        ${available
                            ? "available"
                            : "sold"}
                    ">
                        ${escapeHTML(
                            product.status ||
                            "Available"
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>

                    <p class="admin-product-description">
                        ${escapeHTML(
                            product.description
                        )}
                    </p>

                    <div class="admin-product-price">
                        ${formatPrice(
                            product.price
                        )}
                    </div>

                    <div class="product-actions">

                        <button
                            type="button"
                            class="edit-product"
                            data-id="${escapeAttribute(
                                product.id
                            )}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-product"
                            data-id="${escapeAttribute(
                                product.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;

            setImageWithFallbacks(
                card.querySelector("img"),
                product.image_url,
                product.name
            );

            adminProducts.appendChild(card);
        }
    );

    attachProductActions();
}


/* =========================================================
   PRODUCT ACTIONS
   ========================================================= */

function attachProductActions() {

    document
        .querySelectorAll(".edit-product")
        .forEach(
            button => {

                button.onclick =
                    () => {

                        openEditProduct(
                            button.dataset.id
                        );
                    };
            }
        );

    document
        .querySelectorAll(".delete-product")
        .forEach(
            button => {

                button.onclick =
                    () => {

                        deleteProduct(
                            button.dataset.id
                        );
                    };
            }
        );
}


/* =========================================================
   ADD PRODUCT
   ========================================================= */

function openAddProduct() {

    editingProduct = null;
    selectedImageFile = null;

    if (productForm) {
        productForm.reset();
    }

    if (productId) {
        productId.value = "";
    }

    if (productModalTitle) {
        productModalTitle.textContent =
            "Add Product";
    }

    if (saveProduct) {
        saveProduct.textContent =
            "Save Product";
    }

    clearColorSelections();

    if (imagePreview) {

        imagePreview.innerHTML = `
            <span>
                No image selected
            </span>
        `;
    }

    if (productMessage) {
        productMessage.textContent = "";
    }

    openProductModal();
}


/* =========================================================
   EDIT PRODUCT
   ========================================================= */

function openEditProduct(id) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!product) {
        return;
    }

    editingProduct = product;
    selectedImageFile = null;

    if (productModalTitle) {
        productModalTitle.textContent =
            "Edit Product";
    }

    if (saveProduct) {
        saveProduct.textContent =
            "Update Product";
    }

    if (productId) {
        productId.value =
            product.id;
    }

    if (productName) {
        productName.value =
            product.name || "";
    }

    if (productPrice) {
        productPrice.value =
            product.price || "";
    }

    if (productStorage) {
        productStorage.value =
            product.storage || "";
    }

    if (productCondition) {
        productCondition.value =
            product.condition || "";
    }

    if (productStatus) {
        productStatus.value =
            product.status ||
            "Available";
    }

    if (productDescription) {
        productDescription.value =
            product.description || "";
    }

    clearColorSelections();

    const colors =
        Array.isArray(product.colors)
            ? product.colors
            : [];

    if (colorGrid) {

        colorGrid
            .querySelectorAll(
                "input[type='checkbox']"
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        colors.includes(
                            checkbox.value
                        );
                }
            );
    }

    if (imagePreview) {

        imagePreview.innerHTML = `
            <img
                alt="${escapeAttribute(
                    product.name
                )}"
            >
        `;

        setImageWithFallbacks(
            imagePreview.querySelector("img"),
            product.image_url,
            product.name
        );
    }

    if (productMessage) {
        productMessage.textContent = "";
    }

    openProductModal();
}


/* =========================================================
   OPEN PRODUCT MODAL
   ========================================================= */

function openProductModal() {

    if (!productModal) {
        return;
    }

    productModal.hidden = false;

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
   CLOSE PRODUCT MODAL
   ========================================================= */

function closeModal() {

    if (productModal) {
        productModal.hidden = true;
    }

    document.body.style.overflow = "";

    editingProduct = null;
    selectedImageFile = null;
}


/* =========================================================
   MODAL EVENTS
   ========================================================= */

if (closeProductModal) {

    closeProductModal.onclick =
        closeModal;
}

if (cancelProduct) {

    cancelProduct.onclick =
        closeModal;
}

if (productModalOverlay) {

    productModalOverlay.onclick =
        closeModal;
}


/* =========================================================
   IMAGE SELECTION
   ========================================================= */

if (productImage) {

    productImage.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith("image/")
            ) {

                if (productMessage) {
                    productMessage.textContent =
                        "Please select a valid image.";
                }

                productImage.value = "";

                selectedImageFile = null;

                return;
            }

            selectedImageFile = file;

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    if (imagePreview) {

                        imagePreview.innerHTML = `
                            <img
                                src="${event.target.result}"
                                alt="Selected image"
                            >
                        `;
                    }
                };

            reader.readAsDataURL(file);
        }
    );
}


/* =========================================================
   SAVE PRODUCT FORM
   ========================================================= */

if (productForm) {

    productForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await saveProductToDatabase();
        }
    );
}


/* =========================================================
   SAVE PRODUCT
   ========================================================= */

async function saveProductToDatabase() {

    if (!saveProduct) {
        return;
    }

    const productBeingEdited =
        editingProduct;

    saveProduct.disabled = true;

    saveProduct.textContent =
        productBeingEdited
            ? "Updating..."
            : "Saving...";

    if (productMessage) {
        productMessage.textContent = "";
    }

    try {

        const name =
            productName?.value.trim() || "";

        const price =
            Number(
                productPrice?.value
            );

        const storage =
            productStorage?.value.trim() || "";

        const condition =
            productCondition?.value.trim() || "";

        const status =
            productStatus?.value ||
            "Available";

        const description =
            productDescription?.value.trim() || "";

        const colors =
            getSelectedColors();

        if (!name) {
            throw new Error(
                "Product name is required."
            );
        }

        if (
            !Number.isFinite(price) ||
            price < 0
        ) {
            throw new Error(
                "Enter a valid price."
            );
        }

        if (!storage) {
            throw new Error(
                "Storage is required."
            );
        }

        if (!condition) {
            throw new Error(
                "Condition is required."
            );
        }

        if (!description) {
            throw new Error(
                "Description is required."
            );
        }

        if (!colors.length) {
            throw new Error(
                "Select at least one color."
            );
        }

        let imagePath =
            productBeingEdited?.image_url ||
            "";

        if (selectedImageFile) {

            imagePath =
                await uploadProductImage(
                    selectedImageFile
                );
        }

        if (
            !productBeingEdited &&
            !imagePath
        ) {

            throw new Error(
                "Please choose a product image."
            );
        }

        const productData = {
            name,
            price,
            description,
            storage,
            condition,
            status,
            colors,
            image_url: imagePath
        };

        if (!productBeingEdited) {

            const {
                error
            } =
                await supabaseClient
                    .from(PRODUCTS_TABLE)
                    .insert(productData);

            if (error) {
                throw error;
            }

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(PRODUCTS_TABLE)
                    .update(productData)
                    .eq(
                        "id",
                        productBeingEdited.id
                    );

            if (error) {

                if (
                    selectedImageFile &&
                    imagePath &&
                    imagePath !==
                        productBeingEdited.image_url
                ) {

                    await deleteStorageImage(
                        imagePath
                    );
                }

                throw error;
            }

            if (
                selectedImageFile &&
                productBeingEdited.image_url &&
                productBeingEdited.image_url !==
                    imagePath
            ) {

                await deleteStorageImage(
                    productBeingEdited.image_url
                );
            }
        }

        closeModal();

        await loadProducts();

        updateDashboard();

        renderAdminProducts();

        renderMiniProducts();

        alert(
            productBeingEdited
                ? "Product updated successfully."
                : "Product added successfully."
        );

    } catch (error) {

        console.error(
            "Save product error:",
            error
        );

        if (productMessage) {

            productMessage.textContent =
                getSupabaseErrorMessage(
                    error
                );
        }

    } finally {

        saveProduct.disabled = false;

        saveProduct.textContent =
            productBeingEdited
                ? "Update Product"
                : "Save Product";
    }
}


/* =========================================================
   UPLOAD PRODUCT IMAGE
   ========================================================= */

async function uploadProductImage(file) {

    if (!file) {
        throw new Error(
            "No image selected."
        );
    }

    const safeName =
        file.name
            .toLowerCase()
            .replace(
                /[^a-z0-9._-]/g,
                "-"
            );

    const uniqueId =
        crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

    const uniqueName =
        `${Date.now()}-${uniqueId}-${safeName}`;

    const path =
        `${STORAGE_FOLDER}/${uniqueName}`;

    const {
        error
    } =
        await supabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .upload(
                path,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );

    if (error) {
        throw error;
    }

    return path;
}


/* =========================================================
   DELETE STORAGE IMAGE
   ========================================================= */

async function deleteStorageImage(imagePath) {

    if (!imagePath) {
        return;
    }

    let path =
        String(imagePath).trim();

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;

        const index =
            path.indexOf(marker);

        if (index === -1) {
            return;
        }

        path =
            path.substring(
                index + marker.length
            );
    }

    try {

        path =
            decodeURIComponent(path)
                .replace(/^\/+/, "");

    } catch {
        path =
            path.replace(/^\/+/, "");
    }

    if (!path) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .storage
            .from(STORAGE_BUCKET)
            .remove([path]);

    if (error) {

        console.warn(
            "Storage deletion failed:",
            error
        );
    }
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

async function deleteProduct(id) {

    if (deletingProduct) {
        return;
    }

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!product) {
        return;
    }

    const confirmed =
        confirm(
            `Delete ${product.name}?\n\n` +
            "This will remove the product from the website."
        );

    if (!confirmed) {
        return;
    }

    deletingProduct = true;

    try {

        const {
            error
        } =
            await supabaseClient
                .from(PRODUCTS_TABLE)
                .delete()
                .eq(
                    "id",
                    product.id
                );

        if (error) {
            throw error;
        }

        if (product.image_url) {

            await deleteStorageImage(
                product.image_url
            );
        }

        await loadProducts();

        updateDashboard();

        renderAdminProducts();

        renderMiniProducts();

        alert(
            "Product deleted successfully."
        );

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Unable to delete product:\n\n" +
            getSupabaseErrorMessage(
                error
            )
        );

    } finally {

        deletingProduct = false;
    }
}


/* =========================================================
   COLORS
   ========================================================= */

function getSelectedColors() {

    if (!colorGrid) {
        return [];
    }

    return Array.from(
        colorGrid.querySelectorAll(
            "input[type='checkbox']:checked"
        )
    ).map(
        checkbox =>
            checkbox.value
    );
}


function clearColorSelections() {

    if (!colorGrid) {
        return;
    }

    colorGrid
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;
            }
        );
}


/* =========================================================
   GET CUSTOMER
   ========================================================= */

function getCustomerById(id) {

    return customers.find(
        customer =>
            String(customer.id) ===
            String(id)
    );
}


/* =========================================================
   GET ORDER ITEMS
   ========================================================= */

function getItemsForOrder(orderId) {

    return orderItems.filter(
        item =>
            String(item.order_id) ===
            String(orderId)
    );
}


/* =========================================================
   RENDER ORDERS
   ========================================================= */

function renderAdminOrders() {

    if (!adminOrders) {
        return;
    }

    const search =
        orderSearch
            ? orderSearch.value
                .trim()
                .toLowerCase()
            : "";

    const status =
        orderStatusFilter
            ? orderStatusFilter.value
            : "all";

    const filtered =
        orders.filter(
            order => {

                const customer =
                    getCustomerById(
                        order.customer_id
                    );

                const searchable = [
                    order.order_reference,
                    order.status,
                    order.delivery_address,
                    customer?.full_name,
                    customer?.phone
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    searchable.includes(
                        search
                    );

                const matchesStatus =
                    status === "all" ||
                    String(
                        order.status
                    ).toLowerCase() ===
                    String(status).toLowerCase();

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );

    adminOrders.innerHTML = "";

    if (!filtered.length) {

        adminOrders.innerHTML = `
            <div class="products-empty">
                No orders found.
            </div>
        `;

        return;
    }

    filtered.forEach(
        order => {

            const customer =
                getCustomerById(
                    order.customer_id
                );

            const items =
                getItemsForOrder(
                    order.id
                );

            const card =
                document.createElement("article");

            card.className =
                "dashboard-card";

            const itemHTML =
                items.length
                    ? items.map(
                        item => `
                            <div>
                                <strong>
                                    ${escapeHTML(
                                        item.product_name
                                    )}
                                </strong>

                                ${
                                    item.storage
                                        ? ` — ${escapeHTML(
                                            item.storage
                                        )}`
                                        : ""
                                }

                                ${
                                    item.color
                                        ? ` — ${escapeHTML(
                                            item.color
                                        )}`
                                        : ""
                                }

                                × ${
                                    Number(
                                        item.quantity
                                    ) || 0
                                }
                            </div>
                        `
                    ).join("")
                    : "<div>No item details found.</div>";

            card.innerHTML = `

                <div class="card-heading">

                    <div>

                        <p class="admin-label">
                            ORDER
                        </p>

                        <h2>
                            ${escapeHTML(
                                order.order_reference ||
                                order.id
                            )}
                        </h2>

                    </div>

                </div>

                <div>

                    <p>
                        <strong>Customer:</strong>
                        ${escapeHTML(
                            customer?.full_name ||
                            "Unknown customer"
                        )}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${escapeHTML(
                            customer?.phone ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>Delivery:</strong>
                        ${escapeHTML(
                            order.delivery_address ||
                            customer?.delivery_address ||
                            "—"
                        )}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${formatDate(
                            order.created_at
                        )}
                    </p>

                    <p>
                        <strong>Quantity:</strong>
                        ${
                            Number(
                                order.quantity
                            ) || 0
                        }
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ${formatPrice(
                            order.total
                        )}
                    </p>

                    <p>
                        <strong>Status:</strong>

                        <select
                            class="order-status-select"
                            data-order-id="${escapeAttribute(
                                order.id
                            )}"
                        >

                            <option
                                value="pending"
                                ${
                                    String(
                                        order.status
                                    ).toLowerCase() ===
                                    "pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Pending
                            </option>

                            <option
                                value="processing"
                                ${
                                    String(
                                        order.status
                                    ).toLowerCase() ===
                                    "processing"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Processing
                            </option>

                            <option
                                value="completed"
                                ${
                                    String(
                                        order.status
                                    ).toLowerCase() ===
                                    "completed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Completed
                            </option>

                            <option
                                value="cancelled"
                                ${
                                    String(
                                        order.status
                                    ).toLowerCase() ===
                                    "cancelled"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Cancelled
                            </option>

                        </select>

                    </p>

                </div>

                <div>

                    <strong>
                        Order Items
                    </strong>

                    <div style="margin-top:10px;">
                        ${itemHTML}
                    </div>

                </div>

                <div class="product-actions">

                    <button
                        type="button"
                        class="delete-order"
                        data-id="${escapeAttribute(
                            order.id
                        )}"
                    >
                        Delete Order
                    </button>

                </div>
            `;

            adminOrders.appendChild(card);
        }
    );

    attachOrderActions();
}


/* =========================================================
   ORDER ACTIONS
   ========================================================= */

function attachOrderActions() {

    document
        .querySelectorAll(
            ".order-status-select"
        )
        .forEach(
            select => {

                select.onchange =
                    async () => {

                        await updateOrderStatus(
                            select.dataset.orderId,
                            select.value
                        );
                    };
            }
        );

    document
        .querySelectorAll(
            ".delete-order"
        )
        .forEach(
            button => {

                button.onclick =
                    async () => {

                        await deleteOrder(
                            button.dataset.id
                        );
                    };
            }
        );
}


/* =========================================================
   UPDATE ORDER STATUS
   ========================================================= */

async function updateOrderStatus(
    orderId,
    status
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from(ORDERS_TABLE)
                .update({
                    status
                })
                .eq(
                    "id",
                    orderId
                );

        if (error) {
            throw error;
        }

        const order =
            orders.find(
                item =>
                    String(item.id) ===
                    String(orderId)
            );

        if (order) {
            order.status = status;
        }

        updateDashboard();

        renderAdminOrders();

        renderRecentOrders();

    } catch (error) {

        console.error(
            "Update order status error:",
            error
        );

        alert(
            "Unable to update order:\n\n" +
            getSupabaseErrorMessage(
                error
            )
        );

        renderAdminOrders();
    }
}


/* =========================================================
   DELETE ORDER
   ========================================================= */

async function deleteOrder(orderId) {

    if (deletingOrder) {
        return;
    }

    const order =
        orders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) {
        return;
    }

    const reference =
        order.order_reference ||
        order.id;

    const confirmed =
        confirm(
            `Delete order ${reference}?\n\n` +
            "The order items and order record will be deleted."
        );

    if (!confirmed) {
        return;
    }

    deletingOrder = true;

    try {

        /*
           Delete child order items first.
        */

        const {
            error:
                itemDeleteError
        } =
            await supabaseClient
                .from(ORDER_ITEMS_TABLE)
                .delete()
                .eq(
                    "order_id",
                    order.id
                );

        if (itemDeleteError) {
            throw itemDeleteError;
        }

        /*
           Then delete the order.
        */

        const {
            error
        } =
            await supabaseClient
                .from(ORDERS_TABLE)
                .delete()
                .eq(
                    "id",
                    order.id
                );

        if (error) {
            throw error;
        }

        await loadOrders();

        await loadOrderItems();

        updateDashboard();

        renderAdminOrders();

        renderRecentOrders();

        alert(
            "Order deleted successfully."
        );

    } catch (error) {

        console.error(
            "Delete order error:",
            error
        );

        alert(
            "Unable to delete order:\n\n" +
            getSupabaseErrorMessage(
                error
            )
        );

    } finally {

        deletingOrder = false;
    }
}


/* =========================================================
   RECENT ORDERS
   ========================================================= */

function renderRecentOrders() {

    if (!recentOrders) {
        return;
    }

    recentOrders.innerHTML = "";

    if (!orders.length) {

        recentOrders.innerHTML =
            "<p>No orders yet.</p>";

        return;
    }

    orders
        .slice(0, 5)
        .forEach(
            order => {

                const customer =
                    getCustomerById(
                        order.customer_id
                    );

                const row =
                    document.createElement("div");

                row.className =
                    "mini-product";

                row.innerHTML = `

                    <div class="mini-product-info">

                        <strong>
                            ${escapeHTML(
                                order.order_reference ||
                                order.id
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                customer?.full_name ||
                                "Unknown"
                            )}
                        </span>

                        <span>
                            ${formatPrice(
                                order.total
                            )}
                        </span>

                        <small>
                            ${formatDate(
                                order.created_at
                            )}
                        </small>

                    </div>
                `;

                recentOrders.appendChild(row);
            }
        );
}


/* =========================================================
   RENDER CUSTOMERS
   ========================================================= */

function renderAdminCustomers() {

    if (!adminCustomers) {
        return;
    }

    const search =
        customerSearch
            ? customerSearch.value
                .trim()
                .toLowerCase()
            : "";

    const filtered =
        customers.filter(
            customer => {

                const searchable = [
                    customer.full_name,
                    customer.phone,
                    customer.delivery_address
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchable.includes(
                    search
                );
            }
        );

    adminCustomers.innerHTML = "";

    if (!filtered.length) {

        adminCustomers.innerHTML = `
            <div class="products-empty">
                No customers found.
            </div>
        `;

        return;
    }

    filtered.forEach(
        customer => {

            const customerOrders =
                orders.filter(
                    order =>
                        String(
                            order.customer_id
                        ) ===
                        String(
                            customer.id
                        )
                );

            const totalCustomerSales =
                customerOrders.reduce(
                    (
                        sum,
                        order
                    ) =>
                        sum +
                        (
                            Number(
                                order.total
                            ) || 0
                        ),
                    0
                );

            const card =
                document.createElement("article");

            card.className =
                "dashboard-card";

            card.innerHTML = `

                <div class="card-heading">

                    <div>

                        <p class="admin-label">
                            CUSTOMER
                        </p>

                        <h2>
                            ${escapeHTML(
                                customer.full_name
                            )}
                        </h2>

                    </div>

                </div>

                <p>
                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        customer.phone ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>
                        Delivery Address:
                    </strong>

                    ${escapeHTML(
                        customer.delivery_address ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>
                        Orders:
                    </strong>

                    ${customerOrders.length}
                </p>

                <p>
                    <strong>
                        Total Orders Value:
                    </strong>

                    ${formatPrice(
                        totalCustomerSales
                    )}
                </p>

                <p>
                    <strong>
                        Customer Since:
                    </strong>

                    ${formatDate(
                        customer.created_at
                    )}
                </p>

                <div class="product-actions">

                    <button
                        type="button"
                        class="delete-customer"
                        data-id="${escapeAttribute(
                            customer.id
                        )}"
                    >
                        Delete Customer
                    </button>

                </div>
            `;

            adminCustomers.appendChild(card);
        }
    );

    attachCustomerActions();
}


/* =========================================================
   CUSTOMER ACTIONS
   ========================================================= */

function attachCustomerActions() {

    document
        .querySelectorAll(
            ".delete-customer"
        )
        .forEach(
            button => {

                button.onclick =
                    async () => {

                        await deleteCustomer(
                            button.dataset.id
                        );
                    };
            }
        );
}


/* =========================================================
   DELETE CUSTOMER
   ========================================================= */

async function deleteCustomer(customerId) {

    if (deletingCustomer) {
        return;
    }

    const customer =
        getCustomerById(customerId);

    if (!customer) {
        return;
    }

    const customerOrders =
        orders.filter(
            order =>
                String(
                    order.customer_id
                ) ===
                String(
                    customer.id
                )
        );

    const confirmed =
        confirm(
            `Delete customer ${customer.full_name}?\n\n` +
            `Orders belonging to this customer: ${customerOrders.length}\n\n` +
            "Deleting the customer will also delete the customer's order items and orders."
        );

    if (!confirmed) {
        return;
    }

    deletingCustomer = true;

    try {

        /*
           Step 1:
           Delete order items for every order.
        */

        for (
            const order of customerOrders
        ) {

            const {
                error:
                    itemError
            } =
                await supabaseClient
                    .from(ORDER_ITEMS_TABLE)
                    .delete()
                    .eq(
                        "order_id",
                        order.id
                    );

            if (itemError) {
                throw itemError;
            }
        }

        /*
           Step 2:
           Delete the customer's orders.
        */

        if (customerOrders.length) {

            const orderIds =
                customerOrders.map(
                    order => order.id
                );

            const {
                error:
                    orderError
            } =
                await supabaseClient
                    .from(ORDERS_TABLE)
                    .delete()
                    .in(
                        "id",
                        orderIds
                    );

            if (orderError) {
                throw orderError;
            }
        }

        /*
           Step 3:
           Delete customer.
        */

        const {
            error
        } =
            await supabaseClient
                .from(CUSTOMER_TABLE)
                .delete()
                .eq(
                    "id",
                    customer.id
                );

        if (error) {
            throw error;
        }

        /*
           Step 4:
           Refresh everything.
        */

        await loadCustomers();

        await loadOrders();

        await loadOrderItems();

        updateDashboard();

        renderAdminCustomers();

        renderAdminOrders();

        renderRecentOrders();

        alert(
            "Customer and associated order data deleted successfully."
        );

    } catch (error) {

        console.error(
            "Delete customer error:",
            error
        );

        alert(
            "Unable to delete customer:\n\n" +
            getSupabaseErrorMessage(
                error
            )
        );

    } finally {

        deletingCustomer = false;
    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const sectionId =
                        button.dataset.section;

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    document
                        .querySelectorAll(
                            ".admin-section"
                        )
                        .forEach(
                            section =>
                                section.classList.remove(
                                    "active"
                                )
                        );

                    const section =
                        document.getElementById(
                            sectionId
                        );

                    if (section) {

                        section.classList.add(
                            "active"
                        );
                    }

                    if (pageTitle) {

                        if (
                            sectionId ===
                            "productsSection"
                        ) {

                            pageTitle.textContent =
                                "Products";

                        } else if (
                            sectionId ===
                            "ordersSection"
                        ) {

                            pageTitle.textContent =
                                "Orders";

                        } else if (
                            sectionId ===
                            "customersSection"
                        ) {

                            pageTitle.textContent =
                                "Customers";

                        } else {

                            pageTitle.textContent =
                                "Dashboard";
                        }
                    }
                }
            );
        }
    );


/* =========================================================
   ADD PRODUCT BUTTON
   ========================================================= */

const addProductButton =
    document.getElementById(
        "addProductButton"
    );

if (addProductButton) {

    addProductButton.onclick =
        openAddProduct;
}


/* =========================================================
   DASHBOARD ADD PRODUCT
   ========================================================= */

const dashboardAddProduct =
    document.getElementById(
        "dashboardAddProduct"
    );

if (dashboardAddProduct) {

    dashboardAddProduct.onclick =
        () => {

            const productsNav =
                document.querySelector(
                    '[data-section="productsSection"]'
                );

            if (productsNav) {
                productsNav.click();
            }

            openAddProduct();
        };
}


/* =========================================================
   SEARCH
   ========================================================= */

if (adminSearch) {

    adminSearch.addEventListener(
        "input",
        renderAdminProducts
    );
}


if (adminStatusFilter) {

    adminStatusFilter.addEventListener(
        "change",
        renderAdminProducts
    );
}


if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        renderAdminOrders
    );
}


if (orderStatusFilter) {

    orderStatusFilter.addEventListener(
        "change",
        renderAdminOrders
    );
}


if (customerSearch) {

    customerSearch.addEventListener(
        "input",
        renderAdminCustomers
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
            !productModal.hidden
        ) {

            closeModal();
        }
    }
);


/* =========================================================
   PERSONAL ADMIN STATUS
   ========================================================= */

/*
   IMPORTANT:

   The frontend cannot securely decide whether an account
   is active or suspended.

   This section is designed to work with an optional
   admin_settings table.

   Expected table:

   admin_settings

   columns:
   id
   admin_email
   status
   updated_at

   status should be:
   "active"
   or
   "suspended"
*/


async function loadPersonalAdminStatus() {

    if (!isPersonalAdmin()) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("admin_settings")
                .select(
                    "id,admin_email,status,updated_at"
                )
                .eq(
                    "admin_email",
                    PERSONAL_ADMIN_EMAIL
                )
                .maybeSingle();

        if (error) {
            throw error;
        }

        const status =
            data?.status || "active";

        updatePersonalAdminUI(
            status
        );

    } catch (error) {

        console.warn(
            "Admin status could not be loaded:",
            error
        );

        /*
           We do not block the admin panel if this
           optional control has not yet been created.
        */
    }
}


function isPersonalAdmin() {

    return (
        adminEmail?.textContent
            ?.trim()
            .toLowerCase() ===
        PERSONAL_ADMIN_EMAIL.toLowerCase()
    );
}


function updatePersonalAdminUI(status) {

    const normalized =
        String(status || "active")
            .toLowerCase();

    const active =
        normalized === "active";

    if (adminAccountStatus) {

        adminAccountStatus.textContent =
            active
                ? "Active"
                : "Suspended";
    }

    if (adminStatusToggle) {

        if (
            adminStatusToggle.type ===
            "checkbox"
        ) {

            adminStatusToggle.checked =
                active;
        }
    }

    if (activateAdmin) {

        activateAdmin.disabled =
            active;
    }

    if (suspendAdmin) {

        suspendAdmin.disabled =
            !active;
    }
}


async function setPersonalAdminStatus(
    status
) {

    if (!isPersonalAdmin()) {

        alert(
            "You are not authorized to change this account."
        );

        return;
    }

    const normalized =
        status === "suspended"
            ? "suspended"
            : "active";

    try {

        const {
            data: existing,
            error: existingError
        } =
            await supabaseClient
                .from("admin_settings")
                .select("id")
                .eq(
                    "admin_email",
                    PERSONAL_ADMIN_EMAIL
                )
                .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        let error;

        if (existing?.id) {

            const response =
                await supabaseClient
                    .from("admin_settings")
                    .update({
                        status: normalized,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        existing.id
                    );

            error =
                response.error;

        } else {

            const response =
                await supabaseClient
                    .from("admin_settings")
                    .insert({
                        admin_email:
                            PERSONAL_ADMIN_EMAIL,
                        status:
                            normalized,
                        updated_at:
                            new Date().toISOString()
                    });

            error =
                response.error;
        }

        if (error) {
            throw error;
        }

        updatePersonalAdminUI(
            normalized
        );

        if (adminStatusMessage) {

            adminStatusMessage.textContent =
                normalized === "active"
                    ? "Admin account activated."
                    : "Admin account suspended.";
        }

    } catch (error) {

        console.error(
            "Admin status update error:",
            error
        );

        if (adminStatusMessage) {

            adminStatusMessage.textContent =
                getSupabaseErrorMessage(
                    error
                );
        }

        alert(
            "Unable to change admin status:\n\n" +
            getSupabaseErrorMessage(
                error
            )
        );
    }
}


function setupPersonalAdminControls() {

    if (!isPersonalAdmin()) {
        return;
    }

    if (activateAdmin) {

        activateAdmin.onclick =
            () => {

                setPersonalAdminStatus(
                    "active"
                );
            };
    }

    if (suspendAdmin) {

        suspendAdmin.onclick =
            () => {

                const confirmed =
                    confirm(
                        "Suspend your admin status?"
                    );

                if (confirmed) {

                    setPersonalAdminStatus(
                        "suspended"
                    );
                }
            };
    }

    if (adminStatusToggle) {

        adminStatusToggle.onchange =
            () => {

                setPersonalAdminStatus(
                    adminStatusToggle.checked
                        ? "active"
                        : "suspended"
                );
            };
    }

    loadPersonalAdminStatus();
}


/* =========================================================
   INITIALIZE
   ========================================================= */

checkAdminSession();
