// js/auth.js
import { showToast, showConfirmDialog } from './ui.js';

export function setupAuthListeners(auth) {
    const btnLogin = document.getElementById('btn-google-login');
    if(btnLogin) {
        btnLogin.addEventListener('click', () => {
            if(!window.firebaseLib) return;
            const { signInWithPopup, GoogleAuthProvider } = window.firebaseLib;
            const provider = new GoogleAuthProvider();
            
            document.getElementById('login-status').innerText = "Menghubungkan...";
            
            signInWithPopup(auth, provider)
                .then((result) => {
                    showToast("Login Berhasil!", "success");
                }).catch((error) => {
                    document.getElementById('login-status').innerText = "Gagal: " + error.message;
                });
        });
    }
}

export function logoutUser(auth) {
    showConfirmDialog("Keluar dari akun? Sinkronisasi akan berhenti.", function() {
        if(!window.firebaseLib) return;
        const { signOut } = window.firebaseLib;
        
        signOut(auth).then(() => {
            location.reload();
        });
    });
}
