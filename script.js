/**
 * script.js  –  TastyBite Order Confirmation Page
 * ──────────────────────────────────────────────────
 * Handles:
 *   1. Mobile hamburger navigation toggle
 *   2. Payment method card visual selection
 *   3. Order form validation (name, phone, address, payment)
 *   4. Success card reveal with dynamic order details
 *   5. "Place Order" button loading state
 *   6. Promo code feedback
 *   7. Page reset via "Continue Shopping"
 * ──────────────────────────────────────────────────
 */

'use strict';

/* ============================================================
   DOM ELEMENT REFERENCES
============================================================ */
const hamburger      = document.getElementById('hamburger');
const mobileNav      = document.getElementById('mobileNav');

const orderForm      = document.getElementById('orderForm');
const orderGrid      = document.getElementById('orderGrid');
const successCard    = document.getElementById('successCard');
const successMsg     = document.getElementById('successMsg');
const successDetails = document.getElementById('successDetails');
const placeOrderBtn  = document.getElementById('placeOrderBtn');

// Inputs
const customerNameEl  = document.getElementById('customerName');
const phoneNumberEl   = document.getElementById('phoneNumber');
const deliveryAddrEl  = document.getElementById('deliveryAddress');

// Error spans
const nameError    = document.getElementById('nameError');
const phoneError   = document.getElementById('phoneError');
const addressError = document.getElementById('addressError');
const paymentError = document.getElementById('paymentError');

// Payment cards (labels)
const paymentCards = document.querySelectorAll('.payment-card');

// Promo
const promoBtn   = document.getElementById('promoBtn');
const promoInput = document.getElementById('promoCode');


/* ============================================================
   1. MOBILE NAVIGATION TOGGLE
============================================================ */
hamburger.addEventListener('click', function () {
  const isOpen = mobileNav.classList.toggle('is-open');
  hamburger.classList.toggle('is-open', isOpen);

  // Accessibility: update aria attributes
  hamburger.setAttribute('aria-expanded', String(isOpen));
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
});

// Close mobile nav when any link inside it is clicked
mobileNav.addEventListener('click', function (e) {
  if (e.target.classList.contains('mobile-nav-link')) {
    mobileNav.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  }
});


/* ============================================================
   2. PAYMENT METHOD CARD VISUAL SELECTION
   (The radio inputs are hidden; we style the <label> instead)
============================================================ */
paymentCards.forEach(function (card) {
  card.addEventListener('click', function () {
    // Remove active class from all cards
    paymentCards.forEach(function (c) {
      c.classList.remove('payment-card--selected');
    });
    // Add to the clicked one
    card.classList.add('payment-card--selected');

    // Clear any payment error on selection
    clearError(paymentError, 'paymentGroup');
  });
});


/* ============================================================
   3. REAL-TIME INPUT VALIDATION (on blur)
   Gives immediate feedback as the user leaves each field
============================================================ */
customerNameEl.addEventListener('blur', function () {
  validateName(false);
});

phoneNumberEl.addEventListener('blur', function () {
  validatePhone(false);
});

deliveryAddrEl.addEventListener('blur', function () {
  validateAddress(false);
});

// Also clear errors on input change
customerNameEl.addEventListener('input', function () {
  if (this.value.trim().length > 0) clearError(nameError, 'nameGroup', this);
});

phoneNumberEl.addEventListener('input', function () {
  // Allow only digits
  this.value = this.value.replace(/\D/g, '');
  if (this.value.length === 10) clearError(phoneError, 'phoneGroup', this);
});

deliveryAddrEl.addEventListener('input', function () {
  if (this.value.trim().length > 0) clearError(addressError, 'addressGroup', this);
});


/* ============================================================
   4. FORM SUBMISSION – VALIDATION & ORDER PLACEMENT
============================================================ */
orderForm.addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent actual form submission

  // Run all validations
  const isNameValid    = validateName(true);
  const isPhoneValid   = validatePhone(true);
  const isAddressValid = validateAddress(true);
  const isPaymentValid = validatePayment(true);

  // If any field is invalid, stop here
  if (!isNameValid || !isPhoneValid || !isAddressValid || !isPaymentValid) {
    // Scroll to first error
    const firstError = orderForm.querySelector('.input-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
    return;
  }

  // ── All valid – simulate placing the order ──
  placeOrder();
});


/* ============================================================
   5. VALIDATION HELPERS
============================================================ */

/**
 * Validate the Full Name field.
 * @param {boolean} showError – whether to show/hide errors
 * @returns {boolean}
 */
function validateName(showError) {
  const val = customerNameEl.value.trim();

  if (val === '') {
    if (showError) showFieldError(nameError, 'nameGroup', customerNameEl, 'Please enter your name.');
    return false;
  }

  if (val.length < 2) {
    if (showError) showFieldError(nameError, 'nameGroup', customerNameEl, 'Name must be at least 2 characters.');
    return false;
  }

  // Name should only contain letters and spaces
  if (!/^[A-Za-z\s'.]+$/.test(val)) {
    if (showError) showFieldError(nameError, 'nameGroup', customerNameEl, 'Name can only contain letters and spaces.');
    return false;
  }

  clearError(nameError, 'nameGroup', customerNameEl);
  return true;
}

/**
 * Validate the Phone Number field.
 * @param {boolean} showError
 * @returns {boolean}
 */
function validatePhone(showError) {
  const val = phoneNumberEl.value.trim();

  if (val === '') {
    if (showError) showFieldError(phoneError, 'phoneGroup', phoneNumberEl, 'Please enter your phone number.');
    return false;
  }

  if (!/^\d{10}$/.test(val)) {
    if (showError) showFieldError(phoneError, 'phoneGroup', phoneNumberEl, 'Please enter a valid 10-digit phone number.');
    return false;
  }

  clearError(phoneError, 'phoneGroup', phoneNumberEl);
  return true;
}

/**
 * Validate the Delivery Address field.
 * @param {boolean} showError
 * @returns {boolean}
 */
function validateAddress(showError) {
  const val = deliveryAddrEl.value.trim();

  if (val === '') {
    if (showError) showFieldError(addressError, 'addressGroup', deliveryAddrEl, 'Please enter your delivery address.');
    return false;
  }

  if (val.length < 10) {
    if (showError) showFieldError(addressError, 'addressGroup', deliveryAddrEl, 'Please enter a more complete address (at least 10 characters).');
    return false;
  }

  clearError(addressError, 'addressGroup', deliveryAddrEl);
  return true;
}

/**
 * Validate the Payment Method selection.
 * @param {boolean} showError
 * @returns {boolean}
 */
function validatePayment(showError) {
  const selected = document.querySelector('input[name="paymentMethod"]:checked');

  if (!selected) {
    if (showError) showFieldError(paymentError, 'paymentGroup', null, 'Please select a payment method.');
    return false;
  }

  clearError(paymentError, 'paymentGroup', null);
  return true;
}


/* ============================================================
   6. ERROR / CLEAR HELPERS
============================================================ */

/**
 * Show an error message below a field.
 * @param {HTMLElement} errorEl  – the <span> for the error
 * @param {string}      groupId  – the form-group wrapper id
 * @param {HTMLElement|null} inputEl – the input/textarea element
 * @param {string}      message  – the error text to display
 */
function showFieldError(errorEl, groupId, inputEl, message) {
  errorEl.textContent = message;
  errorEl.classList.add('visible');

  if (inputEl) {
    inputEl.classList.add('input-error');
    inputEl.setAttribute('aria-invalid', 'true');
  }

  // Also add a light red tint to the group container
  const group = document.getElementById(groupId);
  if (group) group.classList.add('group-error');
}

/**
 * Clear the error message for a field.
 * @param {HTMLElement} errorEl
 * @param {string}      groupId
 * @param {HTMLElement|null} inputEl
 */
function clearError(errorEl, groupId, inputEl) {
  errorEl.textContent = '';
  errorEl.classList.remove('visible');

  if (inputEl) {
    inputEl.classList.remove('input-error');
    inputEl.removeAttribute('aria-invalid');
  }

  const group = document.getElementById(groupId);
  if (group) group.classList.remove('group-error');
}


/* ============================================================
   7. PLACE ORDER – SUCCESS FLOW
============================================================ */

/**
 * Simulate placing the order:
 *   - Shows loading state on button
 *   - After a short delay, reveals success card
 */
function placeOrder() {
  // Get values
  const name    = customerNameEl.value.trim();
  const phone   = phoneNumberEl.value.trim();
  const address = deliveryAddrEl.value.trim();
  const payment = document.querySelector('input[name="paymentMethod"]:checked').value;

  // Loading state
  setButtonLoading(true);

  // Simulate network delay (1.2 seconds)
  setTimeout(function () {
    setButtonLoading(false);

    // Generate a random order ID: TB + 5 random digits
    const orderId = '#TB' + Math.floor(10000 + Math.random() * 90000);

    // Populate success card
    successMsg.innerHTML =
      'Thank you, <strong>' + escapeHtml(name) + '</strong>. ' +
      'Your order has been placed successfully and will be delivered to you shortly.';

    // Build detail chips
    successDetails.innerHTML = `
      <div class="success-detail-chip">
        <span class="chip-label">Order ID</span>
        <span class="chip-value order-id-val">${escapeHtml(orderId)}</span>
      </div>
      <div class="success-detail-chip">
        <span class="chip-label">Total Paid</span>
        <span class="chip-value">&#8377;886</span>
      </div>
      <div class="success-detail-chip">
        <span class="chip-label">Payment Via</span>
        <span class="chip-value">${escapeHtml(payment)}</span>
      </div>
      <div class="success-detail-chip">
        <span class="chip-label">Est. Delivery</span>
        <span class="chip-value">30–45 mins</span>
      </div>
    `;

    // Hide form grid, show success card
    orderGrid.style.display = 'none';
    successCard.hidden = false;

    // Smooth scroll to success card
    successCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Announce to screen readers
    successCard.setAttribute('tabindex', '-1');
    successCard.focus();

  }, 1200);
}


/* ============================================================
   8. BUTTON LOADING STATE
============================================================ */

/**
 * Toggle the loading/spinner state of the Place Order button.
 * @param {boolean} isLoading
 */
function setButtonLoading(isLoading) {
  if (isLoading) {
    placeOrderBtn.classList.add('loading');
    placeOrderBtn.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
      <span>Placing Order...</span>
    `;
    placeOrderBtn.setAttribute('disabled', 'true');
  } else {
    placeOrderBtn.classList.remove('loading');
    placeOrderBtn.innerHTML = `
      <i class="fa-solid fa-check-circle" aria-hidden="true"></i>
      <span>Place Order</span>
      <span class="btn-total">&#8377;886</span>
    `;
    placeOrderBtn.removeAttribute('disabled');
  }
}


/* ============================================================
   9. PAGE RESET ("Continue Shopping" button)
============================================================ */

/**
 * Reset the page back to the order form.
 * Called when the user clicks "Continue Shopping".
 */
function resetPage() {
  // Reset form
  orderForm.reset();

  // Clear all errors
  clearError(nameError,    'nameGroup',    customerNameEl);
  clearError(phoneError,   'phoneGroup',   phoneNumberEl);
  clearError(addressError, 'addressGroup', deliveryAddrEl);
  clearError(paymentError, 'paymentGroup', null);

  // Remove payment card selected styles
  paymentCards.forEach(function (c) {
    c.classList.remove('payment-card--selected');
  });

  // Restore button default state
  setButtonLoading(false);

  // Hide success, show form
  successCard.hidden = true;
  orderGrid.style.display = '';   // restore grid

  // Scroll to top of main content
  document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
}


/* ============================================================
   10. PROMO CODE (bonus UX)
============================================================ */
promoBtn.addEventListener('click', function () {
  const code = promoInput.value.trim().toUpperCase();
  const validCodes = { 'TASTY10': '10%', 'BITE20': '20%', 'WELCOME': '₹50' };

  if (code === '') {
    showToast('Please enter a promo code.', 'warning');
    return;
  }

  if (validCodes[code]) {
    showToast('Promo code applied! You saved ' + validCodes[code] + ' on your order.', 'success');
    promoInput.value = '';
    promoBtn.textContent = 'Applied ✓';
    promoBtn.style.background = 'var(--clr-success)';
  } else {
    showToast('Invalid promo code. Try TASTY10, BITE20, or WELCOME.', 'error');
    promoInput.classList.add('input-error');
    setTimeout(function () { promoInput.classList.remove('input-error'); }, 2000);
  }
});


/* ============================================================
   11. TOAST NOTIFICATION SYSTEM
============================================================ */

let toastTimeout = null;

/**
 * Show a small toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'} type
 */
function showToast(message, type) {
  // Remove existing toast
  const existing = document.getElementById('toastNotification');
  if (existing) existing.remove();
  if (toastTimeout) clearTimeout(toastTimeout);

  // Icon map
  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    warning: 'fa-triangle-exclamation'
  };

  // Color map
  const colors = {
    success: 'var(--clr-success)',
    error:   'var(--clr-danger)',
    warning: 'var(--clr-warning)'
  };

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'toastNotification';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position: fixed;
    bottom: 28px;
    right: 24px;
    background: #fff;
    border-left: 4px solid ${colors[type]};
    border-radius: 10px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.14);
    z-index: 9999;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: #1A1A2E;
    max-width: 360px;
    animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `;

  toast.innerHTML = `
    <i class="fa-solid ${icons[type]}" style="color:${colors[type]};font-size:1.15rem;flex-shrink:0;"></i>
    <span>${escapeHtml(message)}</span>
  `;

  // Add keyframes if not present
  if (!document.getElementById('toastStyles')) {
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to   { opacity: 0; transform: translateY(10px) scale(0.95); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-remove after 4 seconds
  toastTimeout = setTimeout(function () {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(function () { toast.remove(); }, 300);
  }, 4000);
}


/* ============================================================
   12. UTILITY: HTML ESCAPING (prevent XSS)
============================================================ */

/**
 * Escape special HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}


/* ============================================================
   13. INIT – Run on page load
============================================================ */
(function init() {
  // Make sure success card is hidden
  successCard.hidden = true;

  // Log readiness
  console.log('%c TastyBite Order Page Ready ', 'background:#FF5A00;color:#fff;font-weight:bold;border-radius:4px;padding:4px 8px;');
})();
