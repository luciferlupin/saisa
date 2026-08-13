/**
 * saisa - E-commerce Application Controller
 * Dynamic Catalog, Cart Manager, Wishlist Engine, and Checkout Logic (Vanilla JS)
 * Built with Bulletproof Callback Error Boundaries & Safari Private Browsing safeguards.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let cart = [];
  let wishlist = [];
  let activeFilter = 'all';
  let sortBy = 'featured';
  let searchQuery = '';
  let selectedModalProduct = null;
  let selectedModalSize = null;
  let selectedModalColor = null;
  let currentUser = null;
  let recentlyViewed = [];
  let razorpayCheckoutType = null; // 'cart' or 'single'
  let singleProductToBuy = null; // if single product
  let currentRazorpayAmount = 0;

  // Supabase Configuration
  const SUPABASE_URL = "https://mhwwwkbkihcwzcwccqyu.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1od3d3a2JraWhjd3pjd2NjcXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjQwMzMsImV4cCI6MjA5NjgwMDAzM30.9GQww_gkyIjXnbAIhFzrQBcFUbhj9vc5ZgLcaPCQNNY";
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  // DOM Cache
  const productGrid = document.getElementById('product-grid-display');
  const filterButtons = document.querySelectorAll('.filter-tab-btn');
  const sortSelect = document.getElementById('catalog-sort-by');
  const cartBadge = document.getElementById('cart-badge-count');
  const wishlistBadge = document.getElementById('wishlist-badge-count');
  
  // Profile & Orders UI DOM Cache
  const profileModal = document.getElementById('profile-modal');
  const profileModalBackdrop = document.getElementById('profile-modal-backdrop');
  const ordersDrawer = document.getElementById('orders-drawer');
  const ordersDrawerOverlay = document.getElementById('orders-drawer-overlay');
  
  // Side Drawers
  const menuDrawer = document.getElementById('menu-drawer');
  const menuDrawerOverlay = document.getElementById('menu-drawer-overlay');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const wishlistDrawer = document.getElementById('wishlist-drawer');
  const wishlistDrawerOverlay = document.getElementById('wishlist-drawer-overlay');
  
  // Search
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input-field');
  
  // Modals & Backdrops
  const productModal = document.getElementById('product-detail-modal');
  const productModalBackdrop = document.getElementById('product-modal-backdrop');
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutModalBackdrop = document.getElementById('checkout-modal-backdrop');
  const sizeGuideModal = document.getElementById('size-guide-modal');
  const sizeGuideBackdrop = document.getElementById('size-guide-backdrop');

  // SVG Fallback for broken product photos
  const fallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='%23F2EFE9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%231F2E28' font-family='sans-serif' font-size='14'>Saisa Lookbook</text></svg>";

  /* ==========================================================================
     1. SAFE EVENT WRAPPERS (CALLBACK ERROR BOUNDARIES)
     ========================================================================== */
  function safeBind(elementId, event, callback) {
    const el = document.getElementById(elementId);
    if (!el) {
      console.warn(`[Saisa Error Boundary] Element #${elementId} was not found in DOM.`);
      return;
    }
    el.addEventListener(event, (e) => {
      try {
        callback(e);
      } catch (err) {
        console.error(`[Saisa Callback Error] Crash in #${elementId} event listener:`, err);
        showToast("A temporary browser error occurred. Please try again.");
      }
    });
  }

  function safeBindAll(selector, event, callback) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      return;
    }
    elements.forEach((el, index) => {
      el.addEventListener(event, (e) => {
        try {
          callback(e, el, index);
        } catch (err) {
          console.error(`[Saisa Callback Error] Crash in selector '${selector}' at index ${index}:`, err);
        }
      });
    });
  }

  /* ==========================================================================
     2. INITIALIZATION & DATA LOADING
     ========================================================================== */
  function init() {
    try {
      // Catalog checks
      if (!window.PRODUCTS) {
        console.error("[Saisa Catalog Error] Products list not found! Initializing fallback mock database.");
        window.PRODUCTS = [];
      }

      loadCartFromLocalStorage();
      loadWishlistFromLocalStorage();
      initSessionTracker();
      renderProducts();
      renderBestSellers();
      renderNewArrivals();
      loadRecentlyViewed();
      setupHeaderScrollEffects();
      setupScrollRevealObserver();
      bindEvents();
      startAnnouncementRotation();
      initHeroCarousel();

      // Standalone product page initialization
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      const isProductPage = window.location.pathname.includes('product.html');
      if (isProductPage && productId) {
        openProductModal(productId);
      }
    } catch (err) {
      console.error("[Saisa Init Error] Core initialization failed:", err);
      showToast("Website loaded with errors. Please refresh the page.");
    }
  }

  // Local Storage Handlers wrapped in Try-Catch (Safari Private mode protection)
  function loadCartFromLocalStorage() {
    try {
      const savedCart = localStorage.getItem('saisa_cart');
      if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
      }
    } catch (e) {
      console.warn("[Saisa Storage Error] Could not load cart from localStorage:", e);
      cart = [];
    }
  }

  function saveCartToLocalStorage() {
    try {
      localStorage.setItem('saisa_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("[Saisa Storage Error] localStorage write blocked (e.g., Safari Private Browsing):", e);
    }
  }

  function loadWishlistFromLocalStorage() {
    try {
      const savedWishlist = localStorage.getItem('saisa_wishlist');
      if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
        updateWishlistUI();
      }
    } catch (e) {
      console.warn("[Saisa Storage Error] Could not load wishlist from localStorage:", e);
      wishlist = [];
    }
  }

  function saveWishlistToLocalStorage() {
    try {
      localStorage.setItem('saisa_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn("[Saisa Storage Error] localStorage write blocked (e.g., Safari Private Browsing):", e);
    }
  }

  /* ==========================================================================
     2.1 USER SESSION & MOCK AUTHENTICATION HANDLERS
     ========================================================================== */
  function loadUserFromLocalStorage() {
    try {
      const savedUser = localStorage.getItem('saisa_user');
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
      }
    } catch (e) {
      console.warn("[Saisa Storage Error] Could not load user from localStorage:", e);
      currentUser = null;
    }
  }

  function loadGuestProfileFromStorage() {
    try {
      const savedGuest = localStorage.getItem('saisa_guest_profile');
      if (savedGuest) return JSON.parse(savedGuest);
    } catch (e) {
      console.warn("[Saisa Storage Error] Could not load guest profile:", e);
    }
    return null;
  }

  function isAnonymousUser(user) {
    return !!(user && user.is_anonymous);
  }

  function isRegisteredUser(user) {
    return !!(user && !user.is_anonymous);
  }

  async function ensureGuestSession() {
    if (!supabase) return false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) return true;

      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("[Saisa Guest Auth] Anonymous sign-in failed:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[Saisa Guest Auth] ensureGuestSession failed:", err);
      return false;
    }
  }

  async function syncGuestProfileToSupabase(userId, guestProfile) {
    if (!supabase || !guestProfile) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: guestProfile.name,
          phone: guestProfile.phone,
          address: guestProfile.address,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("[Saisa Database Error] Guest profile sync failed:", err);
      return null;
    }
  }

  async function applyAuthSession(session) {
    if (!session?.user) {
      currentUser = null;
      updateUserUI();
      return;
    }

    const user = session.user;
    const guestProfile = loadGuestProfileFromStorage();
    let profile = null;
    const isAnon = isAnonymousUser(user);

    if (guestProfile && guestProfile.name) {
      profile = await syncGuestProfileToSupabase(user.id, guestProfile);
      // Only clear local guest profile after a successful sync to a registered account
      if (profile && isRegisteredUser(user)) {
        try {
          localStorage.removeItem('saisa_guest_profile');
        } catch (e) {}
        showToast("Guest profile synchronized with your account!");
      }
    }

    if (!profile) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = data;
    }

    currentUser = {
      id: user.id,
      email: user.email || "",
      name: profile?.name || guestProfile?.name || user.user_metadata?.full_name || (isAnon ? "Guest" : "Valued Customer"),
      phone: profile?.phone || guestProfile?.phone || "",
      address: profile?.address || guestProfile?.address || "",
      isAnonymous: isAnon
    };

    fetchAndShowOrderCount();
    updateUserUI();
  }

  function initSessionTracker() {
    // Paint guest profile from localStorage immediately (before async auth resolves)
    updateUserUI();

    if (!supabase) {
      loadUserFromLocalStorage();
      return;
    }

    let authHydrated = false;

    async function hydrateAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await applyAuthSession(session);

        // Returning guest shoppers: restore anonymous Supabase session for order tracking
        if (!session && loadGuestProfileFromStorage()) {
          await ensureGuestSession();
        }
      } catch (err) {
        console.error("[Saisa Supabase Auth Error] Initial session hydration failed:", err);
        currentUser = null;
        updateUserUI();
      } finally {
        authHydrated = true;
      }
    }

    try {
      supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (!authHydrated && event === 'INITIAL_SESSION') return;
          if (event === 'INITIAL_SESSION') return;
          await applyAuthSession(session);
        } catch (authErr) {
          console.error("[Saisa Supabase Auth Error] Session handler crashed:", authErr);
        }
      });

      hydrateAuth();
    } catch (e) {
      console.error("[Saisa Supabase Auth Error] Auth listener binding failed:", e);
      loadUserFromLocalStorage();
    }
  }

  async function fetchAndShowOrderCount() {
    if (!currentUser) return;
    try {
      let count = 0;
      if (supabase) {
        const { count: dbCount, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);
        if (error) throw error;
        count = dbCount || 0;
      } else {
        const savedOrders = JSON.parse(localStorage.getItem('saisa_orders') || '[]');
        count = savedOrders.filter(o => o.user_email === currentUser.email).length;
      }
      const orderBtn = document.getElementById('account-orders-btn');
      if (orderBtn) orderBtn.textContent = `My Orders (${count})`;
    } catch (err) {
      console.error("[Saisa Database Error] Failed to fetch order count:", err);
    }
  }

  async function saveCustomerAddress(name, phone, address) {
    try {
      const guestProfile = { name, phone, address };

      if (supabase && currentUser && !currentUser.isAnonymous) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: currentUser.id,
            name: name,
            phone: phone,
            address: address,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
      } else if (supabase) {
        // Guest / anonymous shopper — persist locally and create a Supabase guest session
        try {
          localStorage.setItem('saisa_guest_profile', JSON.stringify(guestProfile));
        } catch (e) {}

        await ensureGuestSession();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncGuestProfileToSupabase(session.user.id, guestProfile);
          await applyAuthSession(session);
        }
      }
      
      if (currentUser && !currentUser.isAnonymous) {
        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.address = address;
        try {
          localStorage.setItem('saisa_user', JSON.stringify(currentUser));
        } catch (e) {}
      } else if (!supabase) {
        try {
          localStorage.setItem('saisa_guest_profile', JSON.stringify(guestProfile));
        } catch (e) {}
      }
      
      // Prefill checkout fields
      const nameInput = document.getElementById('shipping-name');
      const phoneInput = document.getElementById('shipping-phone');
      const addressInput = document.getElementById('shipping-address');
      if (nameInput) nameInput.value = name;
      if (phoneInput) phoneInput.value = phone;
      if (addressInput) addressInput.value = address;
      
      updateUserUI();
      showToast("Profile settings saved successfully!");
    } catch (err) {
      console.error("[Saisa Database Error] Failed to save address:", err);
      showToast("Failed to save profile settings.");
    }
  }

  async function recordCheckoutOrder(totalAmount, paymentMethod) {
    if (!currentUser && supabase) {
      await ensureGuestSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await applyAuthSession(session);
    }
    if (!currentUser) return false;
    const orderItems = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.selectedSize,
      color: item.selectedColor
    }));
    try {
      if (supabase) {
        const { error } = await supabase
          .from('orders')
          .insert({
            user_id: currentUser.id,
            items: orderItems,
            total_amount: totalAmount,
            payment_method: paymentMethod,
            status: 'Processing'
          });
        if (error) throw error;
      } else {
        const savedOrders = JSON.parse(localStorage.getItem('saisa_orders') || '[]');
        savedOrders.push({
          id: Math.random().toString(36).substr(2, 9),
          user_email: currentUser.email,
          items: orderItems,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          status: 'Processing',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('saisa_orders', JSON.stringify(savedOrders));
      }
      return true;
    } catch (err) {
      console.error("[Saisa Database Error] Failed to save order:", err);
      return false;
    }
  }

  async function fetchAndRenderOrders() {
    const emptyView = document.getElementById('orders-empty-view');
    const container = document.getElementById('orders-items-container');
    if (!container || !emptyView) return;

    if (!currentUser) {
      emptyView.style.display = 'flex';
      container.style.display = 'none';
      const helpText = emptyView.querySelector('p');
      if (helpText) {
        helpText.textContent = loadGuestProfileFromStorage()
          ? "Save your guest profile or sign in to view orders."
          : "Please sign in or set up a guest profile to view your orders.";
      }
      return;
    }

    try {
      let orders = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        orders = data || [];
      } else {
        const savedOrders = JSON.parse(localStorage.getItem('saisa_orders') || '[]');
        orders = savedOrders
          .filter(o => o.user_email === currentUser.email)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      if (orders.length === 0) {
        emptyView.style.display = 'flex';
        container.style.display = 'none';
        const helpText = emptyView.querySelector('p');
        if (helpText) helpText.textContent = "You haven't placed any orders yet.";
        return;
      }

      emptyView.style.display = 'none';
      container.style.display = 'flex';
      container.innerHTML = '';

      orders.forEach(order => {
        const card = document.createElement('div');
        card.className = 'cart-item';
        card.style.flexDirection = 'column';
        card.style.gap = '8px';
        card.style.padding = '16px';
        card.style.border = '1px solid var(--border-color)';
        card.style.marginBottom = '12px';

        const date = new Date(order.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        let itemsListHtml = '';
        order.items.forEach(item => {
          const product = window.PRODUCTS.find(p => p.id === item.productId);
          const title = product ? product.title : item.productId;
          itemsListHtml += `<p style="font-size: 0.8rem; margin: 2px 0;">• ${title} (${item.size}/${item.color}) x ${item.quantity}</p>`;
        });

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
            <span>Date: ${date}</span>
            <span style="text-transform: uppercase; font-weight: 600; color: var(--accent-hover);">${order.status}</span>
          </div>
          <div style="padding: 4px 0; width: 100%;">
            ${itemsListHtml}
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%; font-family: var(--font-headings); font-weight: 500; font-size: 0.9rem; margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 6px;">
            <span>Total: ₹${order.total_amount.toLocaleString('en-IN')}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-body); text-transform: uppercase;">${order.payment_method}</span>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error("[Saisa Database Error] Failed to load orders:", err);
      showToast("Failed to load order history.");
    }
  }

  function triggerProfileModal(show) {
    try {
      if (!profileModal || !profileModalBackdrop) return;
      if (show) {
        profileModal.classList.add('active');
        profileModalBackdrop.classList.add('active');
      } else {
        profileModal.classList.remove('active');
        profileModalBackdrop.classList.remove('active');
      }
    } catch (err) {
      console.error("[Saisa UI Error] Profile modal toggle failed:", err);
    }
  }

  function triggerOrdersDrawer(show) {
    try {
      if (!ordersDrawer || !ordersDrawerOverlay) return;
      if (show) {
        ordersDrawer.classList.add('active');
        ordersDrawerOverlay.classList.add('active');
        fetchAndRenderOrders();
      } else {
        ordersDrawer.classList.remove('active');
        ordersDrawerOverlay.classList.remove('active');
      }
    } catch (err) {
      console.error("[Saisa UI Error] Orders drawer toggle failed:", err);
    }
  }

  function updateUserUI() {
    try {
      const nameEl = document.getElementById('account-user-name');
      const statusEl = document.getElementById('account-user-status');
      const outView = document.getElementById('account-signed-out-view');
      const inView = document.getElementById('account-signed-in-view');
      const mobOut = document.getElementById('mob-account-signed-out');
      const mobIn = document.getElementById('mob-account-signed-in');
      const mobUser = document.getElementById('mob-user-display');

      if (currentUser) {
        const isGuestSession = !!currentUser.isAnonymous;
        if (nameEl) nameEl.textContent = `Welcome, ${currentUser.name}!`;
        if (statusEl) statusEl.textContent = isGuestSession ? "Guest Checkout" : "Premium Member";
        if (outView) outView.style.display = 'none';
        if (inView) inView.style.display = 'block';
        
        if (mobOut) mobOut.style.display = 'none';
        if (mobIn) mobIn.style.display = 'block';
        if (mobUser) mobUser.textContent = currentUser.name;

        // Prefill checkout if empty or defaults
        const nameInput = document.getElementById('shipping-name');
        const phoneInput = document.getElementById('shipping-phone');
        const addressInput = document.getElementById('shipping-address');
        if (nameInput && (!nameInput.value || nameInput.value === "Jane Doe" || nameInput.value === "")) nameInput.value = currentUser.name || "";
        if (phoneInput && (!phoneInput.value || phoneInput.value === "+91 98765 43210" || phoneInput.value === "")) phoneInput.value = currentUser.phone || "";
        if (addressInput && (!addressInput.value || addressInput.value === "Flat 402, Alabaster Heights, New Delhi, 110001" || addressInput.value === "")) addressInput.value = currentUser.address || "";

        // Prefill profile settings modal
        const profNameInput = document.getElementById('profile-name');
        const profPhoneInput = document.getElementById('profile-phone');
        const profAddressInput = document.getElementById('profile-address');
        if (profNameInput) profNameInput.value = currentUser.name || "";
        if (profPhoneInput) profPhoneInput.value = currentUser.phone || "";
        if (profAddressInput) profAddressInput.value = currentUser.address || "";
      } else {
        if (nameEl) nameEl.textContent = "Welcome guest";
        if (statusEl) statusEl.textContent = "Not signed in";
        if (outView) outView.style.display = 'block';
        if (inView) inView.style.display = 'none';

        if (mobOut) mobOut.style.display = 'block';
        if (mobIn) mobIn.style.display = 'none';

        const guestProfile = loadGuestProfileFromStorage();

        const nameInput = document.getElementById('shipping-name');
        const phoneInput = document.getElementById('shipping-phone');
        const addressInput = document.getElementById('shipping-address');
        const profNameInput = document.getElementById('profile-name');
        const profPhoneInput = document.getElementById('profile-phone');
        const profAddressInput = document.getElementById('profile-address');

        if (guestProfile) {
          if (nameEl) nameEl.textContent = `Welcome, ${guestProfile.name || "guest"}!`;
          if (nameInput) nameInput.value = guestProfile.name || "";
          if (phoneInput) phoneInput.value = guestProfile.phone || "";
          if (addressInput) addressInput.value = guestProfile.address || "";
          if (profNameInput) profNameInput.value = guestProfile.name || "";
          if (profPhoneInput) profPhoneInput.value = guestProfile.phone || "";
          if (profAddressInput) profAddressInput.value = guestProfile.address || "";
        } else {
          if (nameInput) nameInput.value = "";
          if (phoneInput) phoneInput.value = "";
          if (addressInput) addressInput.value = "";
          if (profNameInput) profNameInput.value = "";
          if (profPhoneInput) profPhoneInput.value = "";
          if (profAddressInput) profAddressInput.value = "";
        }
      }
    } catch (err) {
      console.error("[Saisa UI Error] Failed to update authentication UI:", err);
    }
  }

  function triggerAuthModal(show, isSignUp = false) {
    try {
      const authModal = document.getElementById('auth-modal');
      const authModalBackdrop = document.getElementById('auth-modal-backdrop');
      const authTitle = document.getElementById('auth-modal-title');
      const authSubtitle = document.getElementById('auth-modal-subtitle');
      const nameGroup = document.getElementById('auth-name-group');
      const submitBtn = document.getElementById('auth-submit-btn');
      const toggleText = document.getElementById('auth-toggle-text');
      const toggleBtn = document.getElementById('auth-toggle-btn');
      const authForm = document.getElementById('auth-form');

      if (authForm) authForm.reset();

      if (show) {
        if (authModal) authModal.classList.add('active');
        if (authModalBackdrop) authModalBackdrop.classList.add('active');
        
        if (isSignUp) {
          if (authTitle) authTitle.textContent = "Create Account";
          if (authSubtitle) authSubtitle.textContent = "Sign up to start saving your wishlist and track orders.";
          if (nameGroup) nameGroup.style.display = 'block';
          if (submitBtn) submitBtn.textContent = "Register";
          if (toggleText) toggleText.textContent = "Already have an account?";
          if (toggleBtn) toggleBtn.textContent = "Sign In";
        } else {
          if (authTitle) authTitle.textContent = "Sign In";
          if (authSubtitle) authSubtitle.textContent = "Enter your email and password to log in to saisa.";
          if (nameGroup) nameGroup.style.display = 'none';
          if (submitBtn) submitBtn.textContent = "Sign In";
          if (toggleText) toggleText.textContent = "Don't have an account?";
          if (toggleBtn) toggleBtn.textContent = "Create One";
        }
      } else {
        if (authModal) authModal.classList.remove('active');
        if (authModalBackdrop) authModalBackdrop.classList.remove('active');
      }
    } catch (err) {
      console.error("[Saisa UI Error] Auth modal toggle failed:", err);
    }
  }

  function triggerAccountDropdown(show) {
    try {
      const panel = document.getElementById('account-dropdown-panel');
      if (panel) {
        if (show) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      }
    } catch (err) {
      console.error("[Saisa UI Error] Account dropdown toggle failed:", err);
    }
  }

  /* ==========================================================================
     3. DYNAMIC CATALOG RENDERING & SORTING
     ========================================================================== */
  function renderProductList(container, list) {
    if (!container) return;
    container.innerHTML = '';
    
    if (list.length === 0) {
      container.innerHTML = `
        <div class="grid-empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <p>No products found matching your criteria.</p>
        </div>
      `;
      container.style.gridTemplateColumns = '1fr';
      return;
    } else {
      container.style.gridTemplateColumns = '';
    }

    list.forEach(product => {
      try {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);

        const isWishlisted = wishlist.includes(product.id);

        const colorsHtml = product.colors.map(c => 
          `<span class="color-dot" style="background-color: ${c.hex};" title="${c.name}"></span>`
        ).join('');

        const sizeChipsHtml = product.sizes.map(size => 
          `<button class="quick-chip" data-size="${size}" data-product-id="${product.id}">${size}</button>`
        ).join('');

        const fullStars = Math.floor(product.rating || 5);
        const halfStar = (product.rating || 5) % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        const starsHtml = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);

        const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

        card.innerHTML = `
          <div class="product-card-image-wrap">
            <img src="${product.image}" alt="${product.title}" class="product-card-img" 
              onerror="this.onerror=null; this.src='${fallbackSvg}';" loading="lazy">
            
            ${product.badge ? `<span class="product-card-badge">${product.badge}</span>` : ''}

            <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" aria-label="Toggle Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" class="heart-icon-svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <div class="product-card-quick-add">
              <span class="quick-add-sizes-title">Quick Add</span>
              <div class="quick-add-chips">
                ${sizeChipsHtml}
              </div>
            </div>
          </div>
          <div class="product-card-details">
            <h3 class="product-card-title">${product.title}</h3>
            
            <div class="product-card-rating-row">
              <span class="rating-stars-gold">${starsHtml}</span>
              <span class="rating-count-text">(${product.reviewsCount || 0})</span>
            </div>

            <div class="product-card-price-row">
              <span class="card-sale-price">₹${product.price.toLocaleString('en-IN')}</span>
              <span class="card-original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>
              <span class="card-discount-tag">${discountPercentage}% OFF</span>
            </div>
            <div class="card-colors-row">
              ${colorsHtml}
            </div>
          </div>
        `;

        const clickableArea = card.querySelector('.product-card-image-wrap img');
        const clickableDetails = card.querySelector('.product-card-details');
        
        [clickableArea, clickableDetails].forEach(el => {
          if (el) {
            el.addEventListener('click', () => {
              try {
                openProductModal(product.id);
              } catch (e) {
                console.error("[Saisa Modal Open Error] Click failed:", e);
              }
            });
          }
        });

        card.querySelectorAll('.quick-chip').forEach(btn => {
          btn.addEventListener('click', (e) => {
            try {
              e.stopPropagation();
              const prodId = btn.getAttribute('data-product-id');
              const size = btn.getAttribute('data-size');
              const prod = window.PRODUCTS.find(p => p.id === prodId);
              if (prod) {
                addToCart(prodId, size, prod.colors[0].name, 1);
                showToast(`"${prod.title}" (${size}) added to bag!`);
              }
            } catch (err) {
              console.error("[Saisa Quick Add Click Error] Action failed:", err);
            }
          });
        });

        card.querySelector('.wishlist-heart-btn').addEventListener('click', (e) => {
          try {
            e.stopPropagation();
            toggleWishlist(product.id);
            const isWish = wishlist.includes(product.id);
            const heartBtn = card.querySelector('.wishlist-heart-btn');
            if (heartBtn) {
              heartBtn.classList.toggle('active', isWish);
              const heartSvg = heartBtn.querySelector('svg');
              if (heartSvg) heartSvg.setAttribute('fill', isWish ? 'currentColor' : 'none');
            }
          } catch (err) {
            console.error("[Saisa Card Heart Click Error] Toggle failed:", err);
          }
        });

        container.appendChild(card);
      } catch (cardErr) {
        console.error(`[Saisa Card Creation Error] Failed to generate card for product ${product?.id}:`, cardErr);
      }
    });
  }

  let activeRenderTimeout = null;

  function renderProducts() {
    try {
      if (!productGrid) return;
      
      if (activeRenderTimeout) clearTimeout(activeRenderTimeout);
      
      // Render Premium Skeleton Screen Grid
      productGrid.innerHTML = `
        <div class="skeleton-grid" style="grid-column: 1/-1;">
          ${Array(4).fill(0).map(() => `
            <div class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line medium"></div>
              <div class="skeleton-line short"></div>
            </div>
          `).join('')}
        </div>
      `;
      productGrid.style.gridTemplateColumns = '1fr';

      activeRenderTimeout = setTimeout(() => {
        try {
          productGrid.style.gridTemplateColumns = '';
          
          let filtered = window.PRODUCTS.filter(product => {
            try {
              let matchesCategory = false;
              if (activeFilter === 'all') {
                matchesCategory = true;
              } else if (activeFilter === 'new-arrivals') {
                matchesCategory = (product.badge === 'NEW ARRIVAL');
              } else if (activeFilter === 'best-sellers') {
                matchesCategory = (product.badge === 'BEST SELLER');
              } else if (activeFilter === 'Linen') {
                matchesCategory = product.title.toLowerCase().includes('linen') ||
                                  product.description.toLowerCase().includes('linen') ||
                                  product.details.some(d => d.toLowerCase().includes('linen'));
              } else if (activeFilter === 'Cotton') {
                matchesCategory = product.title.toLowerCase().includes('cotton') ||
                                  product.description.toLowerCase().includes('cotton') ||
                                  product.details.some(d => d.toLowerCase().includes('cotton'));
              } else {
                matchesCategory = (product.category === activeFilter);
              }

              const matchesSearch = (
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
              );
              return matchesCategory && matchesSearch;
            } catch (e) {
              console.error(`[Saisa Render Filter Error] Problem filtering product ${product?.id}:`, e);
              return false;
            }
          });

          // Apply Sorting
          try {
            if (sortBy === 'price-low-high') {
              filtered.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price-high-low') {
              filtered.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'rating') {
              filtered.sort((a, b) => b.rating - a.rating);
            }
          } catch (sortErr) {
            console.error("[Saisa Sort Error] Failed to execute catalog sorting:", sortErr);
          }

          renderProductList(productGrid, filtered);
          
          // Micro-interaction: Apple Stagger Fade-in Entrance on Cards
          const cards = productGrid.querySelectorAll('.product-card');
          cards.forEach((card, idx) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, idx * 60);
          });
        } catch (e) {
          console.error("Async render error:", e);
        }
      }, 350);
    } catch (gridErr) {
      console.error("[Saisa Catalog Render Error] Master render operation failed:", gridErr);
    }
  }

  function renderBestSellers() {
    try {
      const container = document.getElementById('best-sellers-grid-display');
      if (!container) return;
      const list = window.PRODUCTS.filter(p => p.badge === 'BEST SELLER').slice(0, 4);
      renderProductList(container, list);
    } catch (e) {
      console.error("Failed to render Best Sellers:", e);
    }
  }

  function renderNewArrivals() {
    try {
      const container = document.getElementById('new-arrivals-grid-display');
      if (!container) return;
      const list = window.PRODUCTS.filter(p => p.badge === 'NEW ARRIVAL').slice(0, 4);
      renderProductList(container, list);
    } catch (e) {
      console.error("Failed to render New Arrivals:", e);
    }
  }

  /* ==========================================================================
     4. E-COMMERCE CART ENGINE & WISH-LIST
     ========================================================================== */
  function addToCart(productId, size, color, quantity = 1) {
    try {
      const product = window.PRODUCTS.find(p => p.id === productId);
      if (!product) return;

      const existingIndex = cart.findIndex(item => 
        item.productId === productId && 
        item.selectedSize === size && 
        item.selectedColor === color
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          productId,
          quantity,
          selectedSize: size,
          selectedColor: color
        });
      }

      saveCartToLocalStorage();
      updateCartUI();
      animateBadgeBump(cartBadge);
    } catch (e) {
      console.error("[Saisa Cart Engine Error] addToCart failed:", e);
    }
  }

  function updateCartUI() {
    try {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (cartBadge) cartBadge.textContent = totalItems;
      const countHeader = document.getElementById('cart-count-header');
      if (countHeader) countHeader.textContent = totalItems;

      const itemsContainer = document.getElementById('cart-items-container');
      const emptyView = document.getElementById('cart-empty-view');
      const cartFooter = document.getElementById('cart-footer');

      if (!itemsContainer || !emptyView || !cartFooter) return;

      if (cart.length === 0) {
        emptyView.style.display = 'flex';
        itemsContainer.style.display = 'none';
        cartFooter.style.display = 'none';
        return;
      }

      emptyView.style.display = 'none';
      itemsContainer.style.display = 'flex';
      cartFooter.style.display = 'flex';
      
      itemsContainer.innerHTML = '';
      let subtotal = 0;

      cart.forEach((item, index) => {
        try {
          const product = window.PRODUCTS.find(p => p.id === item.productId);
          if (!product) return;

          const itemTotal = product.price * item.quantity;
          subtotal += itemTotal;

          const itemElement = document.createElement('div');
          itemElement.className = 'cart-item';
          itemElement.innerHTML = `
            <div class="cart-item-image-wrap">
              <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
            </div>
            <div class="cart-item-info">
              <span class="cart-item-title">${product.title}</span>
              <span class="cart-item-meta">Size: ${item.selectedSize} | Color: ${item.selectedColor}</span>
              <span class="cart-item-price">₹${product.price.toLocaleString('en-IN')}</span>
              <div class="cart-item-actions">
                <div class="quantity-stepper">
                  <button class="stepper-btn qty-minus" data-index="${index}">−</button>
                  <input type="number" value="${item.quantity}" readonly>
                  <button class="stepper-btn qty-plus" data-index="${index}">+</button>
                </div>
                <button class="remove-item-btn" data-index="${index}">Remove</button>
              </div>
            </div>
          `;

          itemElement.querySelector('.qty-minus').addEventListener('click', () => {
            try {
              if (item.quantity > 1) {
                item.quantity--;
                saveCartToLocalStorage();
                updateCartUI();
              }
            } catch (qtyErr) { console.error(qtyErr); }
          });

          itemElement.querySelector('.qty-plus').addEventListener('click', () => {
            try {
              item.quantity++;
              saveCartToLocalStorage();
              updateCartUI();
            } catch (qtyErr) { console.error(qtyErr); }
          });

          itemElement.querySelector('.remove-item-btn').addEventListener('click', () => {
            try {
              cart.splice(index, 1);
              saveCartToLocalStorage();
              updateCartUI();
            } catch (remErr) { console.error(remErr); }
          });

          itemsContainer.appendChild(itemElement);
        } catch (itemErr) {
          console.error("[Saisa Cart UI Error] Failed rendering cart item:", itemErr);
        }
      });

      const totalSpan = document.getElementById('cart-total-price');
      if (totalSpan) totalSpan.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      
      const shippingCostSpan = document.getElementById('checkout-shipping-cost');
      if (shippingCostSpan) {
        if (subtotal >= 1500) {
          shippingCostSpan.textContent = "FREE";
          shippingCostSpan.style.color = "var(--accent-hover)";
        } else {
          shippingCostSpan.textContent = "₹100";
          shippingCostSpan.style.color = "var(--text-primary)";
        }
      }
    } catch (uiErr) {
      console.error("[Saisa Cart UI Error] Master updates failed:", uiErr);
    }
  }

  // Wishlist Handling
  function toggleWishlist(productId) {
    try {
      const product = window.PRODUCTS.find(p => p.id === productId);
      if (!product) return;

      const index = wishlist.indexOf(productId);
      if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`Removed "${product.title}" from wishlist.`);
      } else {
        wishlist.push(productId);
        showToast(`Added "${product.title}" to wishlist!`);
        animateBadgeBump(wishlistBadge);
      }

      saveWishlistToLocalStorage();
      updateWishlistUI();
      renderProducts();
    } catch (e) {
      console.error("[Saisa Wishlist Engine Error] toggleWishlist failed:", e);
    }
  }

  function updateWishlistUI() {
    try {
      const totalWish = wishlist.length;
      if (wishlistBadge) wishlistBadge.textContent = totalWish;
      const countHeader = document.getElementById('wishlist-count-header');
      if (countHeader) countHeader.textContent = totalWish;

      const itemsContainer = document.getElementById('wishlist-items-container');
      const emptyView = document.getElementById('wishlist-empty-view');

      if (!itemsContainer || !emptyView) return;

      if (totalWish === 0) {
        emptyView.style.display = 'flex';
        itemsContainer.style.display = 'none';
        return;
      }

      emptyView.style.display = 'none';
      itemsContainer.style.display = 'flex';
      itemsContainer.innerHTML = '';

      wishlist.forEach((prodId) => {
        try {
          const product = window.PRODUCTS.find(p => p.id === prodId);
          if (!product) return;

          const itemEl = document.createElement('div');
          itemEl.className = 'cart-item';
          itemEl.innerHTML = `
            <div class="cart-item-image-wrap">
              <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
            </div>
            <div class="cart-item-info">
              <span class="cart-item-title">${product.title}</span>
              <span class="cart-item-price">₹${product.price.toLocaleString('en-IN')}</span>
              <div class="cart-item-actions" style="margin-top: 10px; gap: 8px;">
                <button class="button-primary quick-wish-add-btn" style="padding: 6px 12px; font-size: 0.7rem;" data-id="${product.id}">Add to Bag</button>
                <button class="remove-item-btn wish-remove" data-id="${product.id}" style="text-decoration: underline; font-size: 0.75rem;">Remove</button>
              </div>
            </div>
          `;

          // Add to bag click
          itemEl.querySelector('.quick-wish-add-btn').addEventListener('click', () => {
            try {
              addToCart(product.id, product.sizes[0], product.colors[0].name, 1);
              showToast(`"${product.title}" added to bag!`);
              triggerWishlistDrawer(false);
              triggerCartDrawer(true);
            } catch (err) { console.error(err); }
          });

          // Remove click
          itemEl.querySelector('.wish-remove').addEventListener('click', () => {
            try {
              toggleWishlist(product.id);
            } catch (err) { console.error(err); }
          });

          itemsContainer.appendChild(itemEl);
        } catch (itemErr) {
          console.error("[Saisa Wishlist UI Error] Failed rendering wishlist item:", itemErr);
        }
      });
    } catch (uiErr) {
      console.error("[Saisa Wishlist UI Error] Master updates failed:", uiErr);
    }
  }

  function animateBadgeBump(badgeElement) {
    if (!badgeElement) return;
    try {
      badgeElement.classList.add('bump');
      setTimeout(() => {
        badgeElement.classList.remove('bump');
      }, 300);
    } catch (e) {
      console.warn("Badge animation failed:", e);
    }
  }

  // Toast Notification Banners
  function showToast(message) {
    try {
      const toast = document.getElementById('toast-notify-bar');
      const toastText = document.getElementById('toast-message-text');
      if (!toast || !toastText) return;

      toastText.textContent = message;
      toast.classList.add('show');

      if (window.toastTimeout) clearTimeout(window.toastTimeout);

      window.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    } catch (e) {
      console.error("Toast error:", e);
    }
  }

  // Hero Autoplay Carousel
  function initHeroCarousel() {
    try {
      const track = document.querySelector('.hero-carousel-track');
      const dots = document.querySelectorAll('.hero-carousel-dots .dot');
      if (!track || dots.length === 0) return;

      let currentSlide = 0;
      const totalSlides = dots.length;
      let autoplayInterval;

      function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 25}%)`;
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === index);
        });
      }

      function startAutoplay() {
        autoplayInterval = setInterval(() => {
          let nextSlide = (currentSlide + 1) % totalSlides;
          goToSlide(nextSlide);
        }, 5000);
      }

      function stopAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
      }

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          stopAutoplay();
          goToSlide(index);
          startAutoplay();
        });
      });

      startAutoplay();
    } catch (e) {
      console.error("Failed to initialize hero carousel:", e);
    }
  }

  /* ==========================================================================
     4.5 RECENTLY VIEWED & CHECKOUT GATEWAYS HELPERS
     ========================================================================== */
  function setupHeaderScrollEffects() {
    try {
      const header = document.getElementById('saisa-header');
      if (!header) return;
      
      let lastScrollY = window.scrollY;
      
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 20) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
        
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
          header.classList.add('header--hidden');
        } else {
          header.classList.remove('header--hidden');
        }
        
        lastScrollY = currentScrollY;
      }, { passive: true });
    } catch (err) {
      console.error("Failed to setup header scroll effects:", err);
    }
  }

  function setupScrollRevealObserver() {
    try {
      const elements = document.querySelectorAll('.reveal-on-scroll');
      if (elements.length === 0) return;
      
      const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.12
      };
      
      const observer = new IntersectionObserver((entries, self) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            self.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      elements.forEach(el => observer.observe(el));
    } catch (err) {
      console.error("Scroll Reveal Intersection Observer registration failed:", err);
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('revealed');
      });
    }
  }

  function loadRecentlyViewed() {
    try {
      const saved = localStorage.getItem('saisa_recent_views');
      if (saved) {
        recentlyViewed = JSON.parse(saved);
        renderRecentlyViewed();
      }
    } catch (e) {
      console.warn("[Saisa Storage Error] Could not load recently viewed:", e);
      recentlyViewed = [];
    }
  }

  function saveRecentlyViewed() {
    try {
      localStorage.setItem('saisa_recent_views', JSON.stringify(recentlyViewed));
    } catch (e) {
      console.warn("[Saisa Storage Error] Could not save recently viewed:", e);
    }
  }

  function addToRecentlyViewed(productId) {
    try {
      recentlyViewed = recentlyViewed.filter(id => id !== productId);
      recentlyViewed.unshift(productId);
      if (recentlyViewed.length > 5) {
        recentlyViewed.pop();
      }
      saveRecentlyViewed();
      renderRecentlyViewed();
    } catch (e) {
      console.error("Failed to add to recently viewed:", e);
    }
  }

  function renderRecentlyViewed() {
    try {
      const display = document.getElementById('modal-recently-viewed-display');
      if (!display) return;
      display.innerHTML = '';
      
      if (recentlyViewed.length === 0) {
        display.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); padding: 10px 0;">No recently viewed products.</p>';
        return;
      }
      
      recentlyViewed.forEach(id => {
        const product = window.PRODUCTS.find(p => p.id === id);
        if (!product) return;
        
        const card = document.createElement('div');
        card.className = 'recent-strip-card';
        card.setAttribute('data-id', product.id);
        card.innerHTML = `
          <div class="recent-strip-img-wrap">
            <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
          </div>
          <div class="recent-strip-title">${product.title}</div>
          <div class="recent-strip-price">₹${product.price.toLocaleString('en-IN')}</div>
        `;
        
        card.addEventListener('click', () => {
          openProductModal(product.id);
        });
        
        display.appendChild(card);
      });
    } catch (e) {
      console.error("Failed to render recently viewed:", e);
    }
  }

  function openRazorpayModal(amount, type, singleProduct = null) {
    try {
      razorpayCheckoutType = type;
      singleProductToBuy = singleProduct;
      currentRazorpayAmount = amount;

      const amountDisplay = document.getElementById('razorpay-amount-display');
      if (amountDisplay) {
        amountDisplay.textContent = `₹${amount.toLocaleString('en-IN')}`;
      }

      // Reset overlays inside Razorpay modal
      const processing = document.getElementById('razorpay-processing');
      const success = document.getElementById('razorpay-success');
      if (processing) processing.style.display = 'none';
      if (success) success.style.display = 'none';

      // Set default tab to UPI
      switchRazorpayTab('upi');

      // Show Razorpay Modal
      const rpModal = document.getElementById('razorpay-modal');
      const rpBackdrop = document.getElementById('razorpay-modal-backdrop');
      if (rpModal) {
        rpModal.style.display = 'block';
        setTimeout(() => {
          rpModal.classList.add('active');
        }, 10);
      }
      if (rpBackdrop) rpBackdrop.classList.add('active');
    } catch (e) {
      console.error("Failed to open Razorpay modal:", e);
    }
  }

  function closeRazorpayModal() {
    try {
      const rpModal = document.getElementById('razorpay-modal');
      const rpBackdrop = document.getElementById('razorpay-modal-backdrop');
      if (rpModal) {
        rpModal.classList.remove('active');
        setTimeout(() => {
          rpModal.style.display = 'none';
        }, 300);
      }
      if (rpBackdrop) rpBackdrop.classList.remove('active');
    } catch (e) {
      console.error("Failed to close Razorpay modal:", e);
    }
  }

  function switchRazorpayTab(tabName) {
    try {
      const tabs = ['upi', 'card', 'netbanking'];
      tabs.forEach(t => {
        const btn = document.getElementById(`rp-tab-${t === 'netbanking' ? 'nb' : t}-btn`);
        const content = document.getElementById(`razorpay-tab-${t}-content`);
        if (btn) {
          if (t === tabName) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        }
        if (content) {
          content.style.display = (t === tabName) ? 'block' : 'none';
        }
      });
    } catch (e) {
      console.error("Failed to switch Razorpay tab:", e);
    }
  }

  function handleRazorpayPayment() {
    try {
      const processing = document.getElementById('razorpay-processing');
      const success = document.getElementById('razorpay-success');
      
      if (processing) processing.style.display = 'flex';
      
      setTimeout(async () => {
        // Record order in Supabase / LocalStorage
        let orderSaved = false;
        if (razorpayCheckoutType === 'cart') {
          orderSaved = await recordCheckoutOrder(currentRazorpayAmount, 'Prepaid (Razorpay)');
        } else if (razorpayCheckoutType === 'single' && selectedModalProduct) {
          const qtyInput = document.getElementById('modal-qty-input');
          const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
          const oldCart = [...cart];
          cart = [{
            productId: selectedModalProduct.id,
            quantity: qty,
            selectedSize: selectedModalSize || selectedModalProduct.sizes[0],
            selectedColor: selectedModalColor ? selectedModalColor.name : selectedModalProduct.colors[0].name
          }];
          orderSaved = await recordCheckoutOrder(currentRazorpayAmount, 'Prepaid (Razorpay)');
          cart = oldCart;
        }

        if (processing) processing.style.display = 'none';
        if (success) success.style.display = 'flex';
        
        const refEl = document.getElementById('razorpay-success-ref');
        if (refEl) {
          const randRef = Math.random().toString(36).substring(2, 10).toUpperCase();
          refEl.textContent = `Ref: pay_saisa_${randRef}`;
        }
        
        showToast("Success! Payment authorized via Razorpay.");
        
        setTimeout(() => {
          if (razorpayCheckoutType === 'cart') {
            cart = [];
            saveCartToLocalStorage();
            updateCartUI();
            closeCheckoutModal();
          } else if (razorpayCheckoutType === 'single') {
            closeProductModal();
          }
          
          closeRazorpayModal();
          fetchAndShowOrderCount(); // Refresh order count in header
        }, 2000);
      }, 1500);
    } catch (e) {
      console.error("Failed to process Razorpay payment:", e);
    }
  }

  /* ==========================================================================
     5. DETAIL VIEW CONFIGURATOR & RELATED PRODUCTS
     ========================================================================== */
  function openProductModal(productId) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isProductPage = window.location.pathname.includes('product.html');
      
      // If we are not on the product page, or the URL's id does not match the target productId, navigate to it
      if (!isProductPage || urlParams.get('id') !== productId) {
        window.location.href = `product.html?id=${productId}`;
        return;
      }

      const product = window.PRODUCTS.find(p => p.id === productId);
      if (!product) return;

      selectedModalProduct = product;
      selectedModalSize = product.sizes[0];
      selectedModalColor = product.colors[0];

      addToRecentlyViewed(productId);

      // Populate details with DOM safety checks
      const modalImg = document.getElementById('modal-product-img');
      if (modalImg) {
        modalImg.src = product.image;
        modalImg.alt = product.title;
        modalImg.onerror = () => { modalImg.src = fallbackSvg; };
      }

      // Render Gallery Thumbnails
      const thumbsContainer = document.getElementById('modal-gallery-thumbnails');
      if (thumbsContainer) {
        thumbsContainer.innerHTML = '';
        const galleryImages = (product.gallery && product.gallery.length > 0) ? product.gallery : [product.image];
        
        galleryImages.forEach((imgUrl, index) => {
          const thumbImg = document.createElement('img');
          thumbImg.src = imgUrl;
          thumbImg.alt = `${product.title} view ${index + 1}`;
          thumbImg.className = `modal-thumbnail-img ${index === 0 ? 'active' : ''}`;
          thumbImg.onerror = () => { thumbImg.src = fallbackSvg; };
          
          const updateMainImg = () => {
            const mainImg = document.getElementById('modal-product-img');
            if (mainImg) {
              mainImg.src = imgUrl;
            }
            thumbsContainer.querySelectorAll('.modal-thumbnail-img').forEach(img => img.classList.remove('active'));
            thumbImg.classList.add('active');
          };
          
          thumbImg.addEventListener('mouseenter', updateMainImg);
          thumbImg.addEventListener('click', updateMainImg);
          
          thumbsContainer.appendChild(thumbImg);
        });
      }
      
      const setElText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
      };

      setElText('modal-product-cat', product.category);
      setElText('modal-product-name', product.title);
      setElText('modal-product-description', product.description);
      setElText('modal-product-sale-price', `₹${product.price.toLocaleString('en-IN')}`);
      setElText('modal-product-orig-price', `₹${product.originalPrice.toLocaleString('en-IN')}`);
      setElText('selected-color-name', selectedModalColor.name);

      // Reset quantity stepper
      const qtyInput = document.getElementById('modal-qty-input');
      if (qtyInput) qtyInput.value = 1;

      // Render Colors
      const colorWrap = document.getElementById('modal-color-swatches');
      if (colorWrap) {
        colorWrap.innerHTML = '';
        product.colors.forEach((c, idx) => {
          const btn = document.createElement('button');
          btn.className = `swatch-btn ${idx === 0 ? 'active' : ''}`;
          btn.style.backgroundColor = c.hex;
          btn.title = c.name;
          btn.setAttribute('data-color', c.name);
          
          btn.addEventListener('click', () => {
            try {
              colorWrap.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              selectedModalColor = c;
              setElText('selected-color-name', c.name);
            } catch (err) { console.error(err); }
          });
          
          colorWrap.appendChild(btn);
        });
      }

      // Render Sizes
      const sizeWrap = document.getElementById('modal-size-chips');
      if (sizeWrap) {
        sizeWrap.innerHTML = '';
        product.sizes.forEach((s, idx) => {
          const btn = document.createElement('button');
          btn.className = `size-chip-btn ${idx === 0 ? 'active' : ''}`;
          btn.textContent = s;
          btn.setAttribute('data-size', s);
          
          btn.addEventListener('click', () => {
            try {
              sizeWrap.querySelectorAll('.size-chip-btn').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              selectedModalSize = s;
            } catch (err) { console.error(err); }
          });
          
          sizeWrap.appendChild(btn);
        });
      }

      // Populate details lists
      const detailsContainer = document.getElementById('modal-product-details-list');
      if (detailsContainer) {
        detailsContainer.innerHTML = '<ul>' + product.details.map(d => `<li>${d}</li>`).join('') + '</ul>';
      }

      // Render Reviews
      const avgStarsEl = document.getElementById('modal-average-stars');
      const reviewsStatEl = document.getElementById('modal-reviews-stat-text');
      const reviewsListEl = document.getElementById('modal-product-reviews-list');
      
      if (avgStarsEl) {
        const fullStars = Math.floor(product.rating || 5);
        const halfStar = (product.rating || 5) % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        const starsHtml = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
        avgStarsEl.textContent = starsHtml;
        avgStarsEl.style.color = '#D4AF37';
      }
      
      if (reviewsStatEl) {
        reviewsStatEl.textContent = `${product.rating || 5} out of 5 (${product.reviewsCount || 0} reviews)`;
      }
      
      if (reviewsListEl) {
        reviewsListEl.innerHTML = '';
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach(rev => {
            const revCard = document.createElement('div');
            revCard.className = 'review-card-item';
            const starsHtml = '★'.repeat(Math.floor(rev.rating)) + '☆'.repeat(5 - Math.floor(rev.rating));
            revCard.innerHTML = `
              <div class="review-card-header">
                <span class="review-card-author">${rev.name} ${rev.verified ? '<span class="verified-badge" style="color: var(--accent-hover); font-size: 0.75rem; font-weight: normal; margin-left: 4px;">✓ Verified</span>' : ''}</span>
                <span class="review-card-date">${rev.date}</span>
              </div>
              <div class="review-card-stars" style="color: #D4AF37;">${starsHtml}</div>
              <p class="review-card-text">${rev.text}</p>
            `;
            reviewsListEl.appendChild(revCard);
          });
        } else {
          reviewsListEl.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-muted); padding: 10px 0;">No reviews yet for this product.</p>';
        }
      }

      // Complete The Look Products
      renderRelatedProducts(product.id, product.category);

      if (productModal) productModal.classList.add('active');
      if (productModalBackdrop) productModalBackdrop.classList.add('active');
      if (!isProductPage) {
        document.body.style.overflow = 'hidden';
      }
    } catch (e) {
      console.error("[Saisa Modal Open Error] Failed to prepare product modal details:", e);
    }
  }

  function closeProductModal() {
    try {
      const isProductPage = window.location.pathname.includes('product.html');
      if (isProductPage) {
        window.location.href = 'index.html';
        return;
      }
      if (productModal) productModal.classList.remove('active');
      if (productModalBackdrop) productModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    } catch (e) {
      console.error("Failed to close product modal:", e);
    }
  }

  function renderRelatedProducts(currentId, category) {
    try {
      const container = document.getElementById('modal-related-products-display');
      if (!container) return;

      let relatedList = window.PRODUCTS.filter(p => p.id !== currentId && p.category === category).slice(0, 2);
      if (relatedList.length < 2) {
        const fallbackList = window.PRODUCTS.filter(p => p.id !== currentId && p.category !== category).slice(0, 2 - relatedList.length);
        relatedList = [...relatedList, ...fallbackList];
      }

      container.innerHTML = '';
      relatedList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'mini-related-card';
        card.setAttribute('data-id', item.id);
        card.innerHTML = `
          <div class="mini-related-img-wrap">
            <img src="${item.image}" alt="${item.title}" onerror="this.onerror=null; this.src='${fallbackSvg}';">
          </div>
          <div class="mini-related-info">
            <div class="mini-related-title">${item.title}</div>
            <div class="mini-related-price">₹${item.price.toLocaleString('en-IN')}</div>
          </div>
        `;

        card.addEventListener('click', () => {
          openProductModal(item.id);
        });

        container.appendChild(card);
      });
    } catch (relatedErr) {
      console.error("[Saisa Recommendations Error] Related products generation failed:", relatedErr);
    }
  }

  /* ==========================================================================
     6. DRAWER AND SEARCH CONTROL ENGINE
     ========================================================================== */
  function triggerMenuDrawer(open) {
    try {
      if (open) {
        menuDrawer.classList.add('active');
        menuDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        menuDrawer.classList.remove('active');
        menuDrawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    } catch (e) { console.error("Menu drawer toggle failed:", e); }
  }

  function triggerCartDrawer(open) {
    try {
      if (open) {
        cartDrawer.classList.add('active');
        cartDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        cartDrawer.classList.remove('active');
        cartDrawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    } catch (e) { console.error("Cart drawer toggle failed:", e); }
  }

  function triggerWishlistDrawer(open) {
    try {
      if (open) {
        wishlistDrawer.classList.add('active');
        wishlistDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else {
        wishlistDrawer.classList.remove('active');
        wishlistDrawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    } catch (e) { console.error("Wishlist drawer toggle failed:", e); }
  }

  function triggerSearchOverlay(open) {
    try {
      if (open) {
        searchOverlay.classList.add('active');
        searchInput.focus();
      } else {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchQuery = '';
        renderProducts();
      }
    } catch (e) { console.error("Search overlay toggle failed:", e); }
  }

  function triggerSizeGuideModal(open) {
    try {
      if (open) {
        sizeGuideModal.classList.add('active');
        sizeGuideBackdrop.classList.add('active');
      } else {
        sizeGuideModal.classList.remove('active');
        sizeGuideBackdrop.classList.remove('active');
      }
    } catch (e) { console.error("Size guide modal toggle failed:", e); }
  }

  /* ==========================================================================
     7. CHECKOUT TRANSACTION MANAGER
     ========================================================================== */
  async function openCheckoutModal() {
    try {
      triggerCartDrawer(false);

      if (!currentUser && supabase) {
        await ensureGuestSession();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await applyAuthSession(session);
      }
      
      const checkoutSuccess = document.getElementById('checkout-success-msg');
      const checkoutForm = document.getElementById('checkout-form');
      
      if (checkoutSuccess) checkoutSuccess.style.display = 'none';
      if (checkoutForm) checkoutForm.style.display = 'block';

      updateCheckoutSummary();

      // Prefill user details if logged in
      if (currentUser) {
        const nameInput = document.getElementById('shipping-name');
        const phoneInput = document.getElementById('shipping-phone');
        const addressInput = document.getElementById('shipping-address');
        if (nameInput && !nameInput.value) nameInput.value = currentUser.name;
        if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || "+91 98765 43210";
        if (addressInput && !addressInput.value) addressInput.value = currentUser.address || "Flat 402, Alabaster Heights, New Delhi, 110001";
      }

      checkoutModal.classList.add('active');
      checkoutModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } catch (e) { console.error("Checkout modal open failed:", e); }
  }

  function closeCheckoutModal() {
    try {
      checkoutModal.classList.remove('active');
      checkoutModalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    } catch (e) { console.error("Checkout modal close failed:", e); }
  }

  function updateCheckoutSummary() {
    try {
      let subtotal = 0;
      cart.forEach(item => {
        const product = window.PRODUCTS.find(p => p.id === item.productId);
        if (product) subtotal += product.price * item.quantity;
      });

      const selectedMethodEl = document.querySelector('input[name="payment-method"]:checked');
      const isPrepaid = selectedMethodEl ? selectedMethodEl.value === 'prepaid' : true;
      const discount = isPrepaid ? Math.round(subtotal * 0.05) : 0;
      const shipping = subtotal >= 1500 ? 0 : 100;
      const total = subtotal - discount + shipping;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setVal('checkout-subtotal', `₹${subtotal.toLocaleString('en-IN')}`);
      
      const prepaidLine = document.getElementById('prepaid-discount-line');
      if (prepaidLine) {
        if (isPrepaid) {
          prepaidLine.style.display = 'flex';
          setVal('checkout-discount', `-₹${discount.toLocaleString('en-IN')}`);
        } else {
          prepaidLine.style.display = 'none';
        }
      }

      setVal('checkout-shipping', shipping === 0 ? 'Free' : `₹${shipping}`);
      setVal('checkout-total', `₹${total.toLocaleString('en-IN')}`);
    } catch (summaryErr) {
      console.error("[Saisa Checkout Summary Error] Calculation updates failed:", summaryErr);
    }
  }

  /* ==========================================================================
     8. SYSTEM EVENT BINDINGS
     ========================================================================== */
  function bindEvents() {
    // Left Menu Drawer open/close
    safeBind('menu-drawer-open-btn', 'click', () => triggerMenuDrawer(true));
    safeBind('menu-drawer-close-btn', 'click', () => triggerMenuDrawer(false));
    safeBind('menu-drawer-overlay', 'click', () => triggerMenuDrawer(false));

    // Right Cart Drawer open/close
    safeBind('cart-drawer-open-btn', 'click', () => triggerCartDrawer(true));
    safeBind('cart-drawer-close-btn', 'click', () => triggerCartDrawer(false));
    safeBind('cart-drawer-overlay', 'click', () => triggerCartDrawer(false));
    safeBind('cart-continue-shopping-btn', 'click', () => triggerCartDrawer(false));

    // Right Wishlist Drawer open/close
    safeBind('wishlist-drawer-open-btn', 'click', () => triggerWishlistDrawer(true));
    safeBind('wishlist-drawer-close-btn', 'click', () => triggerWishlistDrawer(false));
    safeBind('wishlist-drawer-overlay', 'click', () => triggerWishlistDrawer(false));
    safeBind('wishlist-continue-shopping-btn', 'click', () => triggerWishlistDrawer(false));

    // Search trigger toggles
    safeBind('search-toggle-btn', 'click', () => {
      const isActive = searchOverlay.classList.contains('active');
      triggerSearchOverlay(!isActive);
    });
    safeBind('search-close-btn', 'click', () => triggerSearchOverlay(false));

    // Search bar character inputs
    safeBind('search-input-field', 'input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });

    // Sort selectors dropdown changes
    safeBind('catalog-sort-by', 'change', (e) => {
      sortBy = e.target.value;
      renderProducts();
    });

    // Size Guide modal toggles
    safeBind('open-size-guide-btn', 'click', () => triggerSizeGuideModal(true));
    safeBind('size-guide-close-btn', 'click', () => triggerSizeGuideModal(false));
    safeBind('size-guide-backdrop', 'click', () => triggerSizeGuideModal(false));

    // Catalog Tabs click binds
    safeBindAll('.filter-tab-btn', 'click', (e, btn) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      renderProducts();
    });

    // Mobile Menu & Footer navigation links clicks
    safeBindAll('.nav-item', 'click', (e, link) => {
      e.preventDefault();
      const category = link.getAttribute('data-filter');
      
      if (category) {
        if (category === 'new-arrivals') {
          activeFilter = 'new-arrivals';
          filterButtons.forEach(b => b.classList.remove('active'));
        } else if (category === 'best-sellers') {
          activeFilter = 'best-sellers';
          filterButtons.forEach(b => b.classList.remove('active'));
        } else {
          activeFilter = category;
          filterButtons.forEach(b => {
            if (b.getAttribute('data-filter') === category) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
        }
        
        document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');
        
        renderProducts();
        triggerMenuDrawer(false);
        
        const catalogEl = document.getElementById('featured-products-section');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        const id = link.getAttribute('id');
        triggerMenuDrawer(false);
        if (id === 'mob-nav-about' || link.textContent.trim().toLowerCase().includes('about')) {
          const aboutEl = document.getElementById('saisa-story');
          if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'mob-nav-contact' || link.textContent.trim().toLowerCase().includes('contact')) {
          const footerEl = document.getElementById('saisa-footer');
          if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Details popup closes
    safeBind('modal-close-btn', 'click', closeProductModal);
    safeBind('product-modal-backdrop', 'click', closeProductModal);

    // Quantity selectors in Modal
    safeBind('modal-qty-minus', 'click', () => {
      const qtyInput = document.getElementById('modal-qty-input');
      if (qtyInput) {
        let currentVal = parseInt(qtyInput.value) || 1;
        if (currentVal > 1) qtyInput.value = currentVal - 1;
      }
    });

    safeBind('modal-qty-plus', 'click', () => {
      const qtyInput = document.getElementById('modal-qty-input');
      if (qtyInput) {
        let currentVal = parseInt(qtyInput.value) || 1;
        qtyInput.value = currentVal + 1;
      }
    });

    // Add to Cart inside Modal
    safeBind('modal-add-to-cart-btn', 'click', () => {
      if (selectedModalProduct && selectedModalSize && selectedModalColor) {
        const qtyInput = document.getElementById('modal-qty-input');
        const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
        addToCart(selectedModalProduct.id, selectedModalSize, selectedModalColor.name, qty);
        
        const isProductPage = window.location.pathname.includes('product.html');
        if (!isProductPage) {
          closeProductModal();
        }
        
        triggerCartDrawer(true);
        showToast(`"${selectedModalProduct.title}" added to bag!`);
      }
    });

    // Composition & Care accordion
    safeBind('accordion-details-btn', 'click', () => {
      const accordionHeader = document.getElementById('accordion-details-btn');
      if (accordionHeader) {
        const item = accordionHeader.closest('.accordion-item');
        if (item) item.classList.toggle('active');
      }
    });

    // Checkout Modal interactions
    safeBind('checkout-btn', 'click', openCheckoutModal);
    safeBind('checkout-modal-close', 'click', closeCheckoutModal);
    safeBind('checkout-modal-backdrop', 'click', closeCheckoutModal);

    // Profile Settings modal interactions
    safeBind('account-settings-btn', 'click', (e) => {
      e.preventDefault();
      triggerAccountDropdown(false);
      triggerProfileModal(true);
    });
    safeBind('guest-settings-btn', 'click', (e) => {
      e.preventDefault();
      triggerAccountDropdown(false);
      triggerProfileModal(true);
    });
    safeBind('mob-guest-settings-btn', 'click', (e) => {
      e.preventDefault();
      triggerMenuDrawer(false);
      triggerProfileModal(true);
    });
    safeBind('profile-modal-close', 'click', () => triggerProfileModal(false));
    safeBind('profile-modal-backdrop', 'click', () => triggerProfileModal(false));
    safeBind('profile-form', 'submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('profile-name');
      const phoneInput = document.getElementById('profile-phone');
      const addressInput = document.getElementById('profile-address');
      const name = nameInput ? nameInput.value : "";
      const phone = phoneInput ? phoneInput.value : "";
      const address = addressInput ? addressInput.value : "";
      saveCustomerAddress(name, phone, address);
      triggerProfileModal(false);
    });

    // Orders Drawer interactions
    safeBind('account-orders-btn', 'click', (e) => {
      e.preventDefault();
      triggerAccountDropdown(false);
      triggerOrdersDrawer(true);
    });
    safeBind('orders-drawer-close-btn', 'click', () => triggerOrdersDrawer(false));
    safeBind('orders-drawer-overlay', 'click', () => triggerOrdersDrawer(false));

    // Dynamic prepaid method price updates
    safeBindAll('input[name="payment-method"]', 'change', () => {
      updateCheckoutSummary();
    });

    // Checkout Form submission simulation
    safeBind('checkout-form', 'submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('place-order-btn');
      const checkoutForm = document.getElementById('checkout-form');
      const checkoutSuccess = document.getElementById('checkout-success-msg');
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

      let subtotal = 0;
      cart.forEach(item => {
        const product = window.PRODUCTS.find(p => p.id === item.productId);
        if (product) subtotal += product.price * item.quantity;
      });

      if (paymentMethod === 'prepaid') {
        const discount = Math.round(subtotal * 0.05);
        const shipping = subtotal >= 1500 ? 0 : 100;
        const total = subtotal - discount + shipping;
        
        openRazorpayModal(total, 'cart');
      } else {
        const shipping = subtotal >= 1500 ? 0 : 100;
        const total = subtotal + shipping;

        if (submitBtn) {
          submitBtn.textContent = "Processing Order...";
          submitBtn.disabled = true;
        }

        const success = await recordCheckoutOrder(total, 'Cash on Delivery (COD)');
        
        setTimeout(() => {
          if (success) {
            cart = [];
            saveCartToLocalStorage();
            updateCartUI();

            if (checkoutForm) checkoutForm.reset();
            if (checkoutForm) checkoutForm.style.display = 'none';
            if (checkoutSuccess) checkoutSuccess.style.display = 'block';
            showToast("Success! Order placed successfully (COD).");
            fetchAndShowOrderCount(); // Refresh order count in header
          } else {
            showToast("Could not place order. Please try again.");
          }
          if (submitBtn) {
            submitBtn.textContent = "Confirm Order";
            submitBtn.disabled = false;
          }
        }, 1500);
      }
    });

    /* ==========================================================================
       USER PROFILE, DESKTOP NAVIGATION, AND AUTHENTICATION EVENTS
       ========================================================================== */

    // Account dropdown click toggle
    safeBind('account-dropdown-btn', 'click', (e) => {
      e.stopPropagation();
      const panel = document.getElementById('account-dropdown-panel');
      if (panel) {
        panel.classList.toggle('active');
      }
    });

    // Close account dropdown on clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('account-dropdown-panel');
      const btn = document.getElementById('account-dropdown-btn');
      if (panel && panel.classList.contains('active')) {
        if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          panel.classList.remove('active');
        }
      }
    });

    // Auth Modal open states
    safeBind('header-signin-btn', 'click', () => {
      triggerAccountDropdown(false);
      triggerAuthModal(true, false);
    });
    
    safeBind('header-signup-btn', 'click', () => {
      triggerAccountDropdown(false);
      triggerAuthModal(true, true);
    });

    safeBind('mob-signin-btn', 'click', () => {
      triggerMenuDrawer(false);
      triggerAuthModal(true, false);
    });

    safeBind('mob-signup-btn', 'click', () => {
      triggerMenuDrawer(false);
      triggerAuthModal(true, true);
    });

    safeBind('auth-modal-close', 'click', () => triggerAuthModal(false));
    safeBind('auth-modal-backdrop', 'click', () => triggerAuthModal(false));

    // Toggle between Sign In / Sign Up modes
    safeBind('auth-toggle-btn', 'click', (e) => {
      e.preventDefault();
      const title = document.getElementById('auth-modal-title');
      const isSignUp = title && title.textContent === "Sign In";
      triggerAuthModal(true, isSignUp);
    });

    // Sign Out trigger
    safeBind('header-signout-btn', 'click', async () => {
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error("Supabase signOut error:", err);
        }
      }
      currentUser = null;
      try {
        localStorage.removeItem('saisa_user');
      } catch (err) {}
      // Keep saisa_guest_profile so guest checkout details survive sign-out
      updateUserUI();
      triggerAccountDropdown(false);
      showToast("Signed out successfully.");
    });

    safeBind('mob-signout-btn', 'click', async () => {
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error("Supabase signOut error:", err);
        }
      }
      currentUser = null;
      try {
        localStorage.removeItem('saisa_user');
      } catch (err) {}
      updateUserUI();
      triggerMenuDrawer(false);
      showToast("Signed out successfully.");
    });

    // Auth Form login/register logic
    safeBind('auth-form', 'submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('auth-modal-title');
      const isSignUp = title && title.textContent === "Create Account";
      const emailInput = document.getElementById('auth-email');
      const passwordInput = document.getElementById('auth-password');
      const nameInput = document.getElementById('auth-name');
      const submitBtn = document.getElementById('auth-submit-btn');

      const email = emailInput ? emailInput.value : "";
      const password = passwordInput ? passwordInput.value : "";
      const name = (isSignUp && nameInput && nameInput.value) ? nameInput.value : "Guest User";

      if (submitBtn) {
        submitBtn.textContent = "Processing...";
        submitBtn.disabled = true;
      }

      try {
        if (supabase) {
          if (isSignUp) {
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession?.user?.is_anonymous) {
              const { error } = await supabase.auth.updateUser({
                email,
                password,
                data: { full_name: name }
              });
              if (error) throw error;
              showToast("Account created! Your guest cart and orders are linked.");
            } else {
              const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: { full_name: name }
                }
              });
              if (error) throw error;
              showToast("Account created successfully!");
            }
          } else {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            if (error) throw error;
            showToast("Signed in successfully!");
          }
        } else {
          // Check if there is guest profile data in localStorage to merge/sync
          let guestProfile = null;
          try {
            const savedGuest = localStorage.getItem('saisa_guest_profile');
            if (savedGuest) {
              guestProfile = JSON.parse(savedGuest);
            }
          } catch (e) {}

          currentUser = {
            name: (guestProfile && guestProfile.name) ? guestProfile.name : name,
            email: email,
            phone: (guestProfile && guestProfile.phone) ? guestProfile.phone : "+91 98765 43210",
            address: (guestProfile && guestProfile.address) ? guestProfile.address : "Flat 402, Alabaster Heights, New Delhi, 110001"
          };
          localStorage.setItem('saisa_user', JSON.stringify(currentUser));
          
          if (guestProfile) {
            try {
              localStorage.removeItem('saisa_guest_profile');
            } catch (e) {}
            showToast("Guest profile synchronized with your account!");
          } else {
            showToast(`Welcome, ${name}!`);
          }
          updateUserUI();
        }
        triggerAuthModal(false);
      } catch (err) {
        console.error("Auth action failed:", err);
        showToast(err.message || "Authentication failed.");
      } finally {
        if (submitBtn) {
          submitBtn.textContent = isSignUp ? "Register" : "Sign In";
          submitBtn.disabled = false;
        }
      }
    });

    // Desktop Main Navigation Shop Link
    safeBind('nav-shop', 'click', (e) => {
      e.preventDefault();
      activeFilter = 'all';
      filterButtons.forEach(b => {
        if (b.getAttribute('data-filter') === 'all') {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      renderProducts();
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Desktop Main Navigation New Arrivals
    safeBind('nav-new-arrivals', 'click', (e) => {
      e.preventDefault();
      activeFilter = 'new-arrivals';
      filterButtons.forEach(b => b.classList.remove('active'));
      renderProducts();
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Desktop Main Navigation Best Sellers
    safeBind('nav-best-sellers', 'click', (e) => {
      e.preventDefault();
      activeFilter = 'best-sellers';
      filterButtons.forEach(b => b.classList.remove('active'));
      renderProducts();
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Desktop Main Navigation About
    safeBind('nav-about', 'click', (e) => {
      e.preventDefault();
      const aboutEl = document.getElementById('saisa-story');
      if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Desktop Main Navigation Contact
    safeBind('nav-contact', 'click', (e) => {
      e.preventDefault();
      const footerEl = document.getElementById('saisa-footer');
      if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Desktop Dropdown Collections list item links clicks
    safeBindAll('.desktop-dropdown-menu .dropdown-item', 'click', (e, item) => {
      e.preventDefault();
      const category = item.getAttribute('data-filter') || 'all';
      activeFilter = category;
      filterButtons.forEach(b => {
        if (b.getAttribute('data-filter') === category) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      renderProducts();
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Mobile Collections Drawer accordion toggle button
    safeBind('mob-collections-toggle-btn', 'click', () => {
      const list = document.getElementById('mob-collections-list');
      const caret = document.getElementById('mob-collections-caret');
      if (list) {
        const isHidden = list.style.display === 'none';
        list.style.display = isHidden ? 'block' : 'none';
        if (caret) caret.textContent = isHidden ? '↑' : '↓';
      }
    });

    // Category Cards click bind
    safeBindAll('.category-card', 'click', (e, card) => {
      const category = card.getAttribute('data-filter') || 'all';
      activeFilter = category;
      filterButtons.forEach(b => {
        if (b.getAttribute('data-filter') === category) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      renderProducts();
      const catalogEl = document.getElementById('featured-products-section');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });

    // Collection Cards click bind
    safeBindAll('.explore-collection-link', 'click', (e, link) => {
      e.preventDefault();
      const colFilter = link.getAttribute('data-collection-filter');
      if (colFilter) {
        activeFilter = colFilter;
        filterButtons.forEach(b => b.classList.remove('active'));
        renderProducts();
        const catalogEl = document.getElementById('featured-products-section');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Reels click bind
    safeBindAll('.reel-card', 'click', (e, card) => {
      const prodId = card.getAttribute('data-product-id');
      if (prodId) {
        openProductModal(prodId);
      }
    });

    // Product Detail Zoom Effect
    const zoomContainer = document.getElementById('modal-zoom-container');
    const zoomImage = document.getElementById('modal-product-img');
    if (zoomContainer && zoomImage) {
      zoomContainer.addEventListener('mousemove', (e) => {
        try {
          const rect = zoomContainer.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          zoomImage.style.transformOrigin = `${x}% ${y}%`;
          zoomImage.style.transform = 'scale(1.8)';
        } catch (err) {
          console.error("Zoom move error:", err);
        }
      });
      
      zoomContainer.addEventListener('mouseleave', () => {
        try {
          zoomImage.style.transformOrigin = 'center center';
          zoomImage.style.transform = 'scale(1)';
        } catch (err) {
          console.error("Zoom leave error:", err);
        }
      });
    }

    // Razorpay Tab Binds
    safeBind('rp-tab-upi-btn', 'click', () => switchRazorpayTab('upi'));
    safeBind('rp-tab-card-btn', 'click', () => switchRazorpayTab('card'));
    safeBind('rp-tab-nb-btn', 'click', () => switchRazorpayTab('netbanking'));

    // Razorpay Pay & Cancel Binds
    safeBind('razorpay-pay-btn', 'click', handleRazorpayPayment);
    safeBind('razorpay-cancel-btn', 'click', () => {
      closeRazorpayModal();
      showToast("Payment cancelled by user.");
    });
    safeBind('razorpay-modal-backdrop', 'click', () => {
      closeRazorpayModal();
      showToast("Payment cancelled by user.");
    });

    // Buy Now button inside details modal
    safeBind('modal-buy-now-btn', 'click', () => {
      if (selectedModalProduct) {
        openRazorpayModal(selectedModalProduct.price, 'single', selectedModalProduct);
      }
    });
  }

  /* ==========================================================================
     9. ROTATING ANNOUNCEMENTS BANNER
     ========================================================================== */
  function startAnnouncementRotation() {
    try {
      const announcements = [
        "FREE SHIPPING ON ORDERS ABOVE ₹1,500 • PREPAID DISCOUNT: 5% OFF",
        "SLOW FASHION • ETHICALLY SOURCED AND MANUFACTURED IN INDIA",
        "7-DAY HASSLE-FREE EXCHANGES ON ALL ELEVATED BASICS"
      ];
      
      let currentIndex = 0;
      const bannerEl = document.getElementById('announcement-text');
      if (!bannerEl) return;

      setInterval(() => {
        try {
          bannerEl.style.opacity = '0';
          setTimeout(() => {
            currentIndex = (currentIndex + 1) % announcements.length;
            bannerEl.textContent = announcements[currentIndex];
            bannerEl.style.opacity = '1';
          }, 500);
        } catch (e) {
          console.error("Announcement banner inner rotation error:", e);
        }
      }, 5000);
    } catch (e) {
      console.error("Announcement banner registration failed:", e);
    }
  }

  // Execute Core Init with global catch
  try {
    init();
  } catch (globalErr) {
    console.error("[Saisa Application Crash] Saisa failed to boot:", globalErr);
  }
});
