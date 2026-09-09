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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  const otpForm = document.getElementById('otp-form');
  const backBtn = document.getElementById('back-to-reg-btn');
  const phoneForm = document.getElementById('phone-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Initialize invisible reCAPTCHA safely after DOM loads
  if (document.getElementById('recaptcha-container')) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible'
    });
  }

  // 1. Send OTP Handler
  if (phoneForm) {
    phoneForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const phoneNumberInput = document.getElementById('phone-input').value.trim();
      const formattedPhone = phoneNumberInput.startsWith('+') 
        ? phoneNumberInput 
        : `+91${phoneNumberInput}`;

      const appVerifier = window.recaptchaVerifier;

      firebase.auth().signInWithPhoneNumber(formattedPhone, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          
          const phoneSec = document.getElementById('phone-section');
          const otpSec = document.getElementById('otp-section');
          if (phoneSec) phoneSec.style.display = 'none';
          if (otpSec) otpSec.style.display = 'block';
        })
        .catch((error) => {
          console.error("Error sending OTP:", error);
          alert("Failed to send OTP: " + error.message);
          
          if (window.grecaptcha && window.recaptchaVerifier) {
            window.recaptchaVerifier.render().then((widgetId) => {
              grecaptcha.reset(widgetId);
            });
          }
        });
    });
  }

  // 2. Verify Received OTP Code
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

  // 3. Edit Details / Back Button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const phoneSec = document.getElementById('phone-section');
      const otpSec = document.getElementById('otp-section');
      if (otpSec) otpSec.style.display = 'none';
      if (phoneSec) phoneSec.style.display = 'block';
    });
  }

  // 4. Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();

      localStorage.removeItem('user_authenticated');
      localStorage.removeItem('user_profile');

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