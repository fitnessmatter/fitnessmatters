// Auth Guard: Redirects unauthenticated users immediately to registration
(function checkAuth() {
  const isLoggedIn = localStorage.getItem('user_authenticated');
  
  if (!isLoggedIn) {
    window.location.href = 'register.html';
  }
})();