// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuwy8J25Bi2vJUiD51BiupMwfgZApHu4w",
  authDomain: "fitnessmatters.firebaseapp.com",
  projectId: "fitnessmatters",
  storageBucket: "fitnessmatters.firebasestorage.app",
  messagingSenderId: "745422833379",
  appId: "1:745422833379:web:e1fb3694b16501835d67d6",
  measurementId: "G-D8SC668CVN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  const otpForm = document.getElementById('otp-form');
  const backBtn = document.getElementById('back-to-reg-btn');

  // Setup reCAPTCHA verifier (Invisible)
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible'
  });

  // STEP 1: Send Real OTP SMS (India +91)
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('reg-name').value.trim();
      let rawPhone = document.getElementById('reg-phone').value.trim();
      
      // Clean non-digits
      rawPhone = rawPhone.replace(/\D/g, '');

      // Format automatically to +91
      let formattedPhone;
      if (rawPhone.length === 10) {
        formattedPhone = `+91${rawPhone}`;
      } else if (rawPhone.startsWith('91') && rawPhone.length === 12) {
        formattedPhone = `+${rawPhone}`;
      } else {
        formattedPhone = `+${rawPhone}`;
      }

      // Save user info temporarily
      localStorage.setItem('temp_user', JSON.stringify({ name: nameInput, phone: formattedPhone }));

      // Request Firebase SMS
      const appVerifier = window.recaptchaVerifier;
      auth.signInWithPhoneNumber(formattedPhone, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          regForm.style.display = 'none';
          otpForm.style.display = 'block';
        })
        .catch((error) => {
          alert('Error sending SMS: ' + error.message);
          console.error(error);
        });
    });
  }

  // STEP 2: Verify Real Received OTP Code
  if (otpForm) {
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredOtp = document.getElementById('otp-code').value.trim();

      if (!window.confirmationResult) {
        alert('Session expired. Please try requesting a new OTP.');
        return;
      }

      window.confirmationResult.confirm(enteredOtp)
        .then((result) => {
          localStorage.setItem('user_authenticated', 'true');

          const tempUser = localStorage.getItem('temp_user');
          if (tempUser) {
            localStorage.setItem('user_profile', tempUser);
            localStorage.removeItem('temp_user');
          }

          window.location.href = 'home.html';
        })
        .catch((error) => {
          alert('Invalid OTP code. Please enter the code sent to your mobile phone.');
          console.error(error);
        });
    });
  }

  // STEP 3: Edit Details Button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      otpForm.style.display = 'none';
      regForm.style.display = 'block';
    });
  }
});
// Logout Click Handler
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Clear local session storage
      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_profile');

      // Sign out from Firebase if auth exists
      if (typeof auth !== 'undefined') {
        auth.signOut().finally(() => {
          window.location.href = 'register.html';
        });
      } else {
        window.location.href = 'register.html';
      }
    });
  }
});