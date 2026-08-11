/* =========================================================
   ORACLE GADGET ADMIN SYSTEM
   PRODUCTS + IMAGE MANAGEMENT
   FIXED SUPABASE IMAGE SYSTEM
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
   ADMIN
========================================================= */

const ADMIN_EMAIL =
    "ezeanifrancis15@gmail.com";

const STORAGE_BUCKET =
    "product-images";

const STORAGE_FOLDER =
    "oraimages";


/* =========================================================
   STATE
========================================================= */

let products = [];

let editingProduct = null;

let selectedImageFile = null;


/* =========================================================
   DOM
========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const adminApp =
    document.getElementById(
        "adminApp"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );

const pageTitle =
    document.getElementById(
        "pageTitle"
    );

const totalProducts =
    document.getElementById(
        "totalProducts"
    );

const availableProducts =
    document.getElementById(
        "availableProducts"
    );

const soldProducts =
    document.getElementById(
        "soldProducts"
    );

const productValue =
    document.getElementById(
        "productValue"
    );

const miniProducts =
    document.getElementById(
        "miniProducts"
    );

const adminProducts =
    document.getElementById(
        "adminProducts"
    );

const adminSearch =
    document.getElementById(
        "adminSearch"
    );

const adminStatusFilter =
    document.getElementById(
        "adminStatusFilter"
    );

const productModal =
    document.getElementById(
        "productModal"
    );

const productModalOverlay =
    document.getElementById(
        "productModalOverlay"
    );

const closeProductModal =
    document.getElementById(
        "closeProductModal"
    );

const cancelProduct =
    document.getElementById(
        "cancelProduct"
    );

const productForm =
    document.getElementById(
        "productForm"
    );

const productModalTitle =
    document.getElementById(
        "productModalTitle"
    );

const productId =
    document.getElementById(
        "productId"
    );

const productName =
    document.getElementById(
        "productName"
    );

const productPrice =
    document.getElementById(
        "productPrice"
    );

const productStorage =
    document.getElementById(
        "productStorage"
    );

const productCondition =
    document.getElementById(
        "productCondition"
    );

const productStatus =
    document.getElementById(
        "productStatus"
    );

const productDescription =
    document.getElementById(
        "productDescription"
    );

const productImage =
    document.getElementById(
        "productImage"
    );

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const saveProduct =
    document.getElementById(
        "saveProduct"
    );

const productMessage =
    document.getElementById(
        "productMessage"
    );

const colorGrid =
    document.getElementById(
        "colorGrid"
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
   CLEAN IMAGE PATH
========================================================= */

function cleanImagePath(imagePath) {

    if (!imagePath) {
        return "";
    }

    let path =
        String(
            imagePath
        ).trim();

    path =
        path.replace(
            /^\/+/,
            ""
        );

    return path;

}


/* =========================================================
   CREATE STORAGE URL
========================================================= */

function createStorageUrl(path) {

    if (!path) {
        return "";
    }

    const cleanPath =
        cleanImagePath(
            path
        );

    if (!cleanPath) {
        return "";
    }

    if (
        cleanPath.startsWith(
            "http://"
        ) ||
        cleanPath.startsWith(
            "https://"
        )
    ) {

        return cleanPath;

    }

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
   GET IMAGE CANDIDATES
========================================================= */

function getImageCandidates(
    imagePath
) {

    if (!imagePath) {
        return [];
    }

    const original =
        cleanImagePath(
            imagePath
        );

    if (!original) {
        return [];
    }


    /*
       If database already contains
       a complete URL, use it directly.
    */

    if (
        original.startsWith(
            "http://"
        ) ||
        original.startsWith(
            "https://"
        )
    ) {

        return [
            original
        ];

    }


    const candidates = [];


    /*
       Remove "oraimages/" from a copy.

       Example:

       oraimages/iphone xr.jpg

       becomes:

       iphone xr.jpg
    */

    const withoutFolder =
        original.replace(
            /^oraimages[\\/]/i,
            ""
        );


    /*
       =====================================================
       CANDIDATE 1
       EXACT DATABASE PATH
       =====================================================

       If database contains:

       iphone xr.jpg

       this produces:

       product-images/iphone xr.jpg

       If database contains:

       oraimages/iphone xr.jpg

       this produces:

       product-images/oraimages/iphone xr.jpg
    */

    candidates.push(
        createStorageUrl(
            original
        )
    );


    /*
       =====================================================
       CANDIDATE 2
       ROOT OF BUCKET
       =====================================================

       This is important for your current image:

       product-images/iphone xr.jpg
    */

    if (
        withoutFolder !==
        original
    ) {

        candidates.push(
            createStorageUrl(
                withoutFolder
            )
        );

    }


    /*
       If the database contains a filename
       without the folder, make sure the
       root location is explicitly included.
    */

    if (
        !original
            .toLowerCase()
            .startsWith(
                "oraimages/"
            )
    ) {

        candidates.push(
            createStorageUrl(
                original
            )
        );

    }


    return [
        ...new Set(
            candidates.filter(
                Boolean
            )
        )
    ];

}


/* =========================================================
   GET PRIMARY IMAGE URL
========================================================= */

function getImageUrl(
    imagePath
) {

    const candidates =
        getImageCandidates(
            imagePath
        );

    return (
        candidates[0] ||
        ""
    );

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
        getImageCandidates(
            imagePath
        );


    imageElement.alt =
        altText;


    imageElement.onerror =
        null;


    /*
       No image path.
    */

    if (
        candidates.length ===
        0
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
       Load first candidate.
    */

    imageElement.src =
        candidates[
            currentIndex
        ];


    /*
       If it fails, try the next
       possible location.
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
               All real image paths failed.

               Do not silently replace the
               image with the Oracle logo.

               Leave the image empty instead.
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
                "ORACLE GADGET: Image failed:",
                imagePath,
                candidates
            );

        };

}


/* =========================================================
   CHECK ADMIN SESSION
========================================================= */

async function checkAdminSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


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
            user.email
                ?.toLowerCase() !==
            ADMIN_EMAIL
                .toLowerCase()
        ) {

            await supabaseClient
                .auth
                .signOut();


            showLogin();


            showLoginError(
                "This account is not authorized."
            );


            return;

        }


        await showAdminApp(
            user
        );


    } catch (error) {

        console.error(
            "Session error:",
            error
        );

        showLogin();

    }

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    if (loginScreen) {

        loginScreen.hidden =
            false;

    }


    if (adminApp) {

        adminApp.hidden =
            true;

    }

}


/* =========================================================
   SHOW ADMIN
========================================================= */

async function showAdminApp(
    user
) {

    if (loginScreen) {

        loginScreen.hidden =
            true;

    }


    if (adminApp) {

        adminApp.hidden =
            false;

    }


    if (adminEmail) {

        adminEmail.textContent =
            user.email;

    }


    await loadProducts();

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
                ADMIN_EMAIL
                    .toLowerCase()
            ) {

                showLoginError(
                    "Unauthorized email address."
                );

                return;

            }


            setLoginLoading(
                true
            );


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({
                            email,
                            password
                        });


                if (error) {
                    throw error;
                }


                if (
                    data.user?.email
                        ?.toLowerCase() !==
                    ADMIN_EMAIL
                        .toLowerCase()
                ) {

                    await supabaseClient
                        .auth
                        .signOut();


                    throw new Error(
                        "This account is not authorized."
                    );

                }


                loginMessage.textContent =
                    "";


                await showAdminApp(
                    data.user
                );


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showLoginError(
                    error.message ||
                    "Unable to sign in."
                );


            } finally {

                setLoginLoading(
                    false
                );

            }

        }
    );

}


/* =========================================================
   LOGIN HELPERS
========================================================= */

function showLoginError(
    message
) {

    if (loginMessage) {

        loginMessage.textContent =
            message;

    }

}


function setLoginLoading(
    loading
) {

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
   LOGOUT
========================================================= */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await supabaseClient
                .auth
                .signOut();


            products = [];


            showLogin();


            if (loginPassword) {

                loginPassword.value =
                    "";

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
            event ===
                "SIGNED_OUT" ||
            !session
        ) {

            showLogin();

            return;

        }


        const user =
            session.user;


        if (
            user.email
                ?.toLowerCase() !==
            ADMIN_EMAIL
                .toLowerCase()
        ) {

            await supabaseClient
                .auth
                .signOut();


            showLogin();

            return;

        }


        await showAdminApp(
            user
        );

    }
);


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
            "ORACLE GADGET PRODUCTS:",
            products
        );


        /*
           Log image paths so we can see
           exactly what Supabase returns.
        */

        products.forEach(
            product => {

                console.log(
                    "PRODUCT IMAGE:",
                    product.name,
                    product.image_url,
                    getImageCandidates(
                        product.image_url
                    )
                );

            }
        );


        updateDashboard();

        renderAdminProducts();

        renderMiniProducts();


    } catch (error) {

        console.error(
            "Load products error:",
            error
        );


        alert(
            "Unable to load products: " +
            error.message
        );

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
                )
                    .toLowerCase() ===
                "available"
        ).length;


    const sold =
        products.filter(
            product =>
                String(
                    product.status
                )
                    .toLowerCase() !==
                "available"
        ).length;


    const value =
        products.reduce(
            (
                totalValue,
                product
            ) => {

                return (
                    totalValue +
                    (
                        Number(
                            product.price
                        ) || 0
                    )
                );

            },
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
            formatPrice(
                value
            );

    }

}


/* =========================================================
   MINI PRODUCTS
========================================================= */

function renderMiniProducts() {

    if (!miniProducts) {
        return;
    }


    miniProducts.innerHTML =
        "";


    if (!products.length) {

        miniProducts.innerHTML = `
            <p>
                No products found.
            </p>
        `;

        return;

    }


    products
        .slice(
            0,
            10
        )
        .forEach(
            product => {

                const item =
                    document.createElement(
                        "div"
                    );


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


                const img =
                    item.querySelector(
                        "img"
                    );


                setImageWithFallbacks(
                    img,
                    product.image_url,
                    product.name
                );


                miniProducts.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   RENDER ADMIN PRODUCTS
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

                const searchable = `

                    ${product.name || ""}

                    ${product.description || ""}

                    ${product.storage || ""}

                    ${product.condition || ""}

                `.toLowerCase();


                const matchesSearch =
                    searchable.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||
                    product.status ===
                        status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    adminProducts.innerHTML =
        "";


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
                document.createElement(
                    "article"
                );


            const available =
                String(
                    product.status
                )
                    .toLowerCase() ===
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


                    <p class="
                        admin-product-description
                    ">

                        ${escapeHTML(
                            product.description
                        )}

                    </p>


                    <div class="
                        admin-product-price
                    ">

                        ${formatPrice(
                            product.price
                        )}

                    </div>


                    <div class="
                        product-actions
                    ">

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


            const image =
                card.querySelector(
                    "img"
                );


            setImageWithFallbacks(
                image,
                product.image_url,
                product.name
            );


            adminProducts.appendChild(
                card
            );

        }
    );


    attachProductActions();

}


/* =========================================================
   PRODUCT ACTION BUTTONS
========================================================= */

function attachProductActions() {

    document
        .querySelectorAll(
            ".edit-product"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditProduct(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".delete-product"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ADD PRODUCT
========================================================= */

function openAddProduct() {

    editingProduct =
        null;


    selectedImageFile =
        null;


    if (productForm) {

        productForm.reset();

    }


    if (productId) {

        productId.value =
            "";

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

        productMessage.textContent =
            "";

    }


    openProductModal();

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function openEditProduct(
    id
) {

    const product =
        products.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (!product) {
        return;
    }


    editingProduct =
        product;


    selectedImageFile =
        null;


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
        Array.isArray(
            product.colors
        )
            ? product.colors
            : [];


    document
        .querySelectorAll(
            "#colorGrid input[type='checkbox']"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    colors.includes(
                        checkbox.value
                    );

            }
        );


    if (imagePreview) {

        imagePreview.innerHTML = `

            <img
                alt="${escapeAttribute(
                    product.name
                )}"
            >

        `;


        const previewImage =
            imagePreview.querySelector(
                "img"
            );


        setImageWithFallbacks(
            previewImage,
            product.image_url,
            product.name
        );

    }


    if (productMessage) {

        productMessage.textContent =
            "";

    }


    openProductModal();

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openProductModal() {

    if (!productModal) {
        return;
    }


    productModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    if (productModal) {

        productModal.hidden =
            true;

    }


    document.body.style.overflow =
        "";


    editingProduct =
        null;


    selectedImageFile =
        null;

}


if (closeProductModal) {

    closeProductModal.addEventListener(
        "click",
        closeModal
    );

}


if (cancelProduct) {

    cancelProduct.addEventListener(
        "click",
        closeModal
    );

}


if (productModalOverlay) {

    productModalOverlay.addEventListener(
        "click",
        closeModal
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

if (productImage) {

    productImage.addEventListener(
        "change",
        event => {

            const file =
                event.target
                    .files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                if (productMessage) {

                    productMessage.textContent =
                        "Please select a valid image.";

                }


                productImage.value =
                    "";


                return;

            }


            selectedImageFile =
                file;


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    if (!imagePreview) {
                        return;
                    }


                    imagePreview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Selected image"
                        >

                    `;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   SAVE PRODUCT
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
   SAVE PRODUCT TO DATABASE
========================================================= */

async function saveProductToDatabase() {

    if (!saveProduct) {
        return;
    }


    /*
       Keep a copy because closeModal()
       clears editingProduct.
    */

    const productBeingEdited =
        editingProduct;


    if (productMessage) {

        productMessage.textContent =
            "";

    }


    saveProduct.disabled =
        true;


    saveProduct.textContent =
        productBeingEdited
            ? "Updating..."
            : "Saving...";


    try {

        const name =
            productName.value
                .trim();


        const price =
            Number(
                productPrice.value
            );


        const storage =
            productStorage.value
                .trim();


        const condition =
            productCondition.value
                .trim();


        const status =
            productStatus.value;


        const description =
            productDescription.value
                .trim();


        const colors =
            getSelectedColors();


        if (!name) {

            throw new Error(
                "Product name is required."
            );

        }


        if (
            !Number.isFinite(
                price
            ) ||
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
            productBeingEdited
                ?.image_url ||
            "";


        /*
           UPLOAD NEW IMAGE
        */

        if (selectedImageFile) {

            const uploadedPath =
                await uploadProductImage(
                    selectedImageFile
                );


            imagePath =
                uploadedPath;


            /*
               Delete old image after
               successful new upload.
            */

            if (
                productBeingEdited &&
                productBeingEdited.image_url
            ) {

                await deleteStorageImage(
                    productBeingEdited.image_url
                );

            }

        }


        /*
           NEW PRODUCT REQUIRES IMAGE
        */

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

            image_url:
                imagePath

        };


        /*
           INSERT
        */

        if (!productBeingEdited) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "products"
                    )
                    .insert(
                        productData
                    );


            if (error) {
                throw error;
            }

        }


        /*
           UPDATE
        */

        else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "products"
                    )
                    .update(
                        productData
                    )
                    .eq(
                        "id",
                        productBeingEdited.id
                    );


            if (error) {
                throw error;
            }

        }


        closeModal();


        await loadProducts();


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
                error.message ||
                "Unable to save product.";

        }


    } finally {

        saveProduct.disabled =
            false;


        saveProduct.textContent =
            productBeingEdited
                ? "Update Product"
                : "Save Product";

    }

}


/* =========================================================
   UPLOAD PRODUCT IMAGE
========================================================= */

async function uploadProductImage(
    file
) {

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


    const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}-${safeName}`;


    /*
       New uploads continue going into
       the existing ORACLE folder.
    */

    const path =
        `${STORAGE_FOLDER}/${uniqueName}`;


    const {
        error
    } =
        await supabaseClient
            .storage
            .from(
                STORAGE_BUCKET
            )
            .upload(
                path,
                file,
                {
                    cacheControl:
                        "3600",

                    upsert:
                        false
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

async function deleteStorageImage(
    imagePath
) {

    if (!imagePath) {
        return;
    }


    let path =
        String(
            imagePath
        ).trim();


    /*
       Full URL handling.
    */

    if (
        path.startsWith(
            "http://"
        ) ||
        path.startsWith(
            "https://"
        )
    ) {

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;


        const markerIndex =
            path.indexOf(
                marker
            );


        if (
            markerIndex ===
            -1
        ) {

            return;

        }


        path =
            path.substring(
                markerIndex +
                marker.length
            );

    }


    path =
        decodeURIComponent(
            path
        );


    path =
        path.replace(
            /^\/+/,
            ""
        );


    /*
       If the path already contains
       the folder, keep it.

       Otherwise assume it is in
       oraimages.
    */

    if (
        !path
            .toLowerCase()
            .startsWith(
                `${STORAGE_FOLDER}/`
                    .toLowerCase()
            )
    ) {

        path =
            `${STORAGE_FOLDER}/${path}`;

    }


    const {
        error
    } =
        await supabaseClient
            .storage
            .from(
                STORAGE_BUCKET
            )
            .remove([
                path
            ]);


    if (error) {

        console.warn(
            "Storage image could not be deleted:",
            error
        );

    }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
    id
) {

    const product =
        products.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${product.name}?\n\n` +
            `This will remove the product from the website ` +
            `and delete its image from Storage.`
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
           Delete database row.
        */

        const {
            error
        } =
            await supabaseClient
                .from(
                    "products"
                )
                .delete()
                .eq(
                    "id",
                    product.id
                );


        if (error) {
            throw error;
        }


        /*
           Delete image.

           This supports both:

           product-images/iphone xr.jpg

           and:

           product-images/oraimages/filename.jpg
        */

        if (
            product.image_url
        ) {

            await deleteStorageImage(
                product.image_url
            );

        }


        await loadProducts();


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
            error.message
        );

    }

}


/* =========================================================
   COLOR HELPERS
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
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

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
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".nav-item"
    )
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

                        pageTitle.textContent =
                            sectionId ===
                            "productsSection"
                                ? "Products"
                                : "Dashboard";

                    }

                }
            );

        }
    );


/* =========================================================
   ADD PRODUCT BUTTONS
========================================================= */

const addProductButton =
    document.getElementById(
        "addProductButton"
    );


if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        openAddProduct
    );

}


const dashboardAddProduct =
    document.getElementById(
        "dashboardAddProduct"
    );


if (dashboardAddProduct) {

    dashboardAddProduct.addEventListener(
        "click",
        () => {

            const productsNav =
                document.querySelector(
                    '[data-section="productsSection"]'
                );


            if (productsNav) {

                productsNav.click();

            }


            openAddProduct();

        }
    );

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
                !productModal.hidden
            ) {

                closeModal();

            }

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

checkAdminSession();