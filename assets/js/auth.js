import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. ROLE SELECTION
// ==========================================
window.selectPortal = function(role) {
    localStorage.setItem('sv_role', role);
    if (role === 'school') {
        window.showSection('school-login');
    } else {
        window.showSection('link-child');
    }
};

// ==========================================
// 2. SCHOOL LOGIN (Firestore)
// ==========================================
window.handleSchoolLogin = async function(event) {
    event.preventDefault();
    
    const phone = document.getElementById('login-phone').value;
    const pin = document.getElementById('login-pin').value;
    
    try {
        const userDocRef = doc(db, "users", phone);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.pin === pin) {
                alert(`Welcome ${userData.name}!`);
                localStorage.setItem('sv_user', JSON.stringify(userData));
                
                if (userData.role === 'principal' || userData.role === 'admin') {
                    window.showSection('principal-dashboard');
                } else if (userData.role === 'incharge') {
                    window.showSection('attendance');
                } else {
                    alert("Role not recognized.");
                }
            } else {
                alert("Incorrect PIN! Please try again.");
            }
        } else {
            alert("User not found! Please check your phone number.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Something went wrong. Check console.");
    }
};
