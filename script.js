// ==========================================
// 1. FIREBASE INITIALIZATION & SAFETY GUARD
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCCJrxF9RpVDN35D-VDihSqc_kJ1x5lauU",
    authDomain: "fitness-matter-75d2e.firebaseapp.com",
    projectId: "fitness-matter-75d2e",
    storageBucket: "fitness-matter-75d2e.firebasestorage.app",
    messagingSenderId: "590498897773",
    appId: "1:590498897773:web:0c947b1632ccc4cb30c464",
    measurementId: "G-2EXP5S8MRG"
};

// Safe initialization check
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.warn("Firebase SDK is not loaded yet.");
}

let confirmationResultObject = null;

// ==========================================
// 2. GLOBAL UI HELPER FUNCTIONS
// ==========================================

// Toggle Sidebar Drawer
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (sidebar) sidebar.classList.toggle('open');
  if (sidebarOverlay) sidebarOverlay.classList.toggle('open');
}

// Toggle Light/Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('app_theme', isLight ? 'light' : 'dark');
  
  updateThemeButtonText(isLight);
}

// Helper to keep Theme text synced
function updateThemeButtonText(isLight) {
  const themeBtnText = document.getElementById('theme-text');
  if (themeBtnText) {
    themeBtnText.innerText = isLight ? 'Dark Mode' : 'Light Mode';
  }
}

// Global Logout Handler
function handleLogout() {
  localStorage.removeItem('user_authenticated');
  localStorage.removeItem('user_profile');
  
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut().catch(() => {});
  }
  window.location.href = 'register.html';
}

// Global Payment Handler
function payNow(planName, amount) {
  let fakePaymentId = "pay_test_" + Math.floor(Math.random() * 1000000);
  window.location.href = "success.html?plan=" + encodeURIComponent(planName) + "&payment_id=" + fakePaymentId;
}

// ==========================================
// 3. PAGE INITIALIZATION & EVENT HANDLERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // --- A. SIDEBAR & THEME EVENT LISTENERS ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDarkMode);
    }

    // --- B. FIREBASE PHONE AUTHENTICATION (REGISTER / LOGIN) ---
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (typeof firebase !== 'undefined' && firebase.auth && recaptchaContainer) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible'
        });
    }

    const registerForm = document.getElementById('registerForm');
    const otpModal = document.getElementById('otpModal');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (typeof firebase === 'undefined' || !firebase.auth) {
                alert('Firebase Authentication SDK is not loaded properly.');
                return;
            }

            const rawPhone = document.getElementById('mobileNo').value.trim();
            const phoneNumber = rawPhone.startsWith('+') ? rawPhone : '+91' + rawPhone;
            const appVerifier = window.recaptchaVerifier;

            firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
                .then((confirmationResult) => {
                    confirmationResultObject = confirmationResult;
                    alert('OTP sent to ' + phoneNumber);
                    if (otpModal) otpModal.style.display = 'flex';
                })
                .catch((error) => {
                    console.error('Error sending OTP:', error);
                    alert('Failed to send OTP: ' + error.message);
                });
        });
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
            const otpInputField = document.getElementById('otpInput') || document.getElementById('otpCode');
            const otpCode = otpInputField ? otpInputField.value.trim() : '';

            if (!confirmationResultObject) {
                alert('Please request an OTP first!');
                return;
            }

            confirmationResultObject.confirm(otpCode)
                .then((result) => {
                    alert('Phone verification successful! User logged in.');
                    localStorage.setItem('user_authenticated', 'true');
                    if (otpModal) otpModal.style.display = 'none';
                    window.location.href = 'home.html';
                })
                .catch((error) => {
                    console.error('Verification Error:', error);
                    alert('Incorrect OTP! Please check the code and try again.');
                });
        });
    }

    // --- C. THEME INITIALIZATION ---
    const savedTheme = localStorage.getItem('app_theme');
    const isLight = savedTheme === 'light';
    if (isLight) {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
    updateThemeButtonText(isLight);

    // --- D. DYNAMIC USER PROFILE LOADING ---
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
        try {
            const user = JSON.parse(savedProfile);
            const displayName = user.fullname || user.name;

            // Update sidebar name
            const sidebarName = document.getElementById('menu-display-name') || document.querySelector('.user-info h4');
            if (sidebarName && displayName) {
                sidebarName.textContent = displayName;
            }

            // Update avatar circle
            const avatarCircle = document.getElementById('avatar-initial') || document.querySelector('.avatar-circle');
            if (avatarCircle && displayName) {
                avatarCircle.textContent = displayName.charAt(0).toUpperCase();
            }
        } catch (e) {
            console.error("Error parsing user profile from localStorage", e);
        }
    }

    // --- E. LOGOUT BUTTON LISTENERS ---
    const logoutBtns = document.querySelectorAll('.logout-link');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    });
});

// ==========================================
// 4. MODAL & SUBSCRIPTION ACTION HELPERS
// ==========================================
function closeSubModal() {
    const subModal = document.getElementById('sub-modal');
    if (subModal) subModal.classList.remove('active');
}

function processSubscription() {
    const planName = window.currentSelectedPlan || 'Selected Plan';
    const fakePaymentId = "pay_" + Math.floor(Math.random() * 1000000);
    localStorage.setItem('user_subscribed_plan', planName);
    closeSubModal();
    
    window.location.href = "success.html?plan=" + encodeURIComponent(planName) + "&payment_id=" + fakePaymentId;
}

function processTrialSubscription() {
    const planName = window.currentSelectedPlan || 'Selected Plan';
    const fakePaymentId = "trial_" + Math.floor(Math.random() * 1000000);
    localStorage.setItem('user_subscribed_plan', planName + " (7-Day Free Trial)");
    closeSubModal();

    window.location.href = "success.html?plan=" + encodeURIComponent(planName) + "&payment_id=" + fakePaymentId + "&type=trial";
}
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('goalModal');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const goalForm = document.getElementById('goalForm');

  // 1. Open Modal
  if (openBtn && modal) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
  }

  // 2. Close Modal (X Button)
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.style.display = 'none';
    });
  }

  // 3. Close Modal (Clicking Outside)
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // 4. Form Submit
  if (goalForm) {
    goalForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevents page reload
      
      const title = document.getElementById('goalTitle')?.value || '';
      const category = document.getElementById('goalCategory')?.value || '';
      const current = document.getElementById('goalCurrent')?.value || '';
      const target = document.getElementById('goalTarget')?.value || '';
      const date = document.getElementById('goalDate')?.value || '';

      // Create Card
      const newCard = document.createElement('article');
      newCard.className = 'plan-card stat-card';
      newCard.innerHTML = `
        <span class="badge" style="background: rgba(212, 160, 23, 0.15); color: var(--accent-gold); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; width: fit-content; margin-bottom: 0.5rem; display: inline-block;">In Progress</span>
        <h3>${title}</h3>
        <p>${category}<br>Current: ${current}</p>
        <div style="background: var(--border-color); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 0.75rem;">
          <div style="width: 30%; background: var(--accent-gold); height: 100%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
          <span>Target: ${target}</span>
          <span>Target Date: ${date}</span>
        </div>
      `;

      // Safely find where to put the card
      const container = document.getElementById('milestonesContainer') 
        || document.querySelectorAll('.plans-grid')[1] 
        || document.querySelector('.dashboard-wrapper');

      if (container) {
        container.appendChild(newCard);
      }

      // Reset form and force-hide modal
      goalForm.reset();
      if (modal) {
        modal.style.display = 'none';
      }
    });
  }
});