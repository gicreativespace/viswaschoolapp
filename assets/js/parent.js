import { db } from './firebase-config.js';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. LINK CHILD (Firestore)
// ==========================================
window.handleLinkChild = async function(event) {
    event.preventDefault();
    
    const relation = document.getElementById('child-relation').value;
    const parentName = document.getElementById('parent-name').value.trim();
    const childClass = document.getElementById('child-class').value;
    const rollNumber = document.getElementById('child-roll').value;
    const dob = document.getElementById('child-dob').value;

    if (!parentName || !rollNumber || !dob) {
        alert("Please fill all fields.");
        return;
    }

    const parentId = parentName.replace(/\s+/g, '_').toLowerCase() + "_" + rollNumber;
    const childData = { 
        name: "Student_" + rollNumber, 
        className: childClass, 
        rollNo: parseInt(rollNumber), 
        dob: dob 
    };

    try {
        const parentRef = doc(db, "parents", parentId);
        const parentDoc = await getDoc(parentRef);
        
        if (parentDoc.exists()) {
            const existingData = parentDoc.data();
            const updatedStudents = [...existingData.linkedStudents, childData];
            await updateDoc(parentRef, { linkedStudents: updatedStudents });
        } else {
            await setDoc(parentRef, { 
                relation: relation, 
                parentName: parentName, 
                linkedStudents: [childData], 
                createdAt: new Date().toISOString() 
            });
        }

        localStorage.setItem('sv_linked_child', JSON.stringify(childData));
        alert("Child Linked Successfully!");
        window.showSection('parent-dashboard');

    } catch (error) { 
        console.error("Link Error:", error); 
        alert("Something went wrong. Check console."); 
    }
};

// ==========================================
// 2. PARENT DASHBOARD - LOAD DATA
// ==========================================
window.loadParentDashboard = async function() {
    const activeChildEl = document.getElementById('active-child-name');
    const attendanceEl = document.getElementById('parent-attendance-status');
    const diaryList = document.getElementById('parent-diary-list');
    const noticeList = document.getElementById('parent-notice-list');

    if (!activeChildEl) return;

    try {
        const linkedChild = JSON.parse(localStorage.getItem('sv_linked_child') || 'null');
        if (!linkedChild) {
            activeChildEl.textContent = "No child linked";
            diaryList.innerHTML = `<p class="loading-text">Please link a child first.</p>`;
            noticeList.innerHTML = `<p class="loading-text">Please link a child first.</p>`;
            return;
        }

        activeChildEl.textContent = `${linkedChild.name} (${linkedChild.className})`;
        
        // Attendance (Dummy - తర్వాత Firestore నుండి తెస్తాము)
        attendanceEl.textContent = "Present";
        attendanceEl.style.color = "#3F8F29";

        // E-Diary (Approved only)
        const diarySnapshot = await getDocs(collection(db, "ediary"));
        let diaryHtml = '', diaryCount = 0;
        diarySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status === 'approved' && data.className === linkedChild.className) {
                diaryCount++;
                diaryHtml += `
                    <div class="diary-card">
                        <div class="diary-header">
                            <span class="badge class-badge">${data.subject}</span>
                            <span class="time">Approved</span>
                        </div>
                        <p>${data.notes}</p>
                    </div>
                `;
            }
        });
        if (diaryCount === 0) diaryHtml = `<p class="loading-text">No approved diary entries.</p>`;
        diaryList.innerHTML = diaryHtml;

        // Notice Board (Approved only)
        const noticeSnapshot = await getDocs(collection(db, "announcements"));
        let noticeHtml = '', noticeCount = 0;
        noticeSnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status === 'approved' && (data.scope === 'school' || data.className === linkedChild.className)) {
                noticeCount++;
                noticeHtml += `<div class="notice-card"><p>${data.message}</p></div>`;
            }
        });
        if (noticeCount === 0) noticeHtml = `<p class="loading-text">No notices.</p>`;
        noticeList.innerHTML = noticeHtml;

    } catch (error) { 
        console.error("Parent Dashboard Error:", error); 
        diaryList.innerHTML = `<p class="loading-text" style="color:red;">Error loading data.</p>`;
    }
};
