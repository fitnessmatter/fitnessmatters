// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCJrxF9RpVDN35D-VDihSqc_kJ1x5lauU",
    authDomain: "fitness-matter-75d2e.firebaseapp.com",
    projectId: "fitness-matter-75d2e",
    storageBucket: "fitness-matter-75d2e.firebasestorage.app",
    messagingSenderId: "590498897773",
    appId: "1:590498897773:web:0c947b1632ccc4cb30c464",
    measurementId: "G-2EXP5S8MRG"
};

// 2. Initialize Firebase App
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

let confirmationResultObject = null;

document.addEventListener('DOMContentLoaded', () => {
    // 3. Setup invisible reCAPTCHA
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible'
    });

    const registerForm = document.getElementById('registerForm');
    const otpModal = document.getElementById('otpModal');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');

    // 4. Handle Request OTP click
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

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

    // 5. Handle Verify OTP click
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
                    if (otpModal) otpModal.style.display = 'none';
                })
                .catch((error) => {
                    console.error('Verification Error:', error);
                    alert('Incorrect OTP! Please check the code and try again.');
                });
        });
    }
});
window.location.href = 'home.html';
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('.logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Clear session token to lock dashboard access
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_profile');
      window.location.href = 'register.html';
    });
  }
});
// ==========================================
// SESSION MANAGEMENT & USER DYNAMICS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. DYNAMIC USER PROFILE LOADING
  const savedProfile = localStorage.getItem('user_profile');
  if (savedProfile) {
    const user = JSON.parse(savedProfile);
    
    // Update name in sidebar drawer
    const sidebarName = document.querySelector('.user-info h4');
    if (sidebarName && user.name) {
      sidebarName.textContent = user.name;
    }

    // Update initial in avatar circle
    const avatarCircle = document.querySelector('.avatar-circle');
    if (avatarCircle && user.name) {
      avatarCircle.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  // 2. LOGOUT & SESSION CLEARING
  const logoutBtn = document.querySelector('.logout-link');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Clear session locks and stored profile
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_profile');
      
      // Redirect to registration gate
      window.location.href = 'register.html';
    });
  }

});