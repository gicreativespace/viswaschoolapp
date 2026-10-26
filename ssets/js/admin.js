import { db } from './firebase-config.js';
import { doc, getDoc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. LOAD APPROVALS FOR PRINCIPAL DASHBOARD
// ==========================================
window.loadApprovals = async function() {
    const container = document.getElementById('principal-data-container');
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, "ediary"));
        let html = `
            <div class="stats-grid">
                <div class="stat-card blue-bg"><h4>Total Staff</h4><p>12</p></div>
                <div class="stat-card green-bg"><h4>Pending Approvals</h4><p id="pending-count">0</p></div>
            </div>
            <h3 class="section-title">Pending Approvals</h3>
            <div id="approvals-list"></div>
        `;
        container.innerHTML = html;

        const approvalsList = document.getElementById('approvals-list');
        const pendingCount = document.getElementById('pending-count');
        let count = 0;
        let approvalsHtml = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.status === 'pending') {
                count++;
                approvalsHtml += `
                    <div class="approval-card" id="approval-${docSnap.id}">
                        <div class="approval-header">
                            <span class="badge class-badge">${data.className}</span>
                            <span class="time">${data.subject}</span>
                        </div>
                        <p class="approval-text"><strong>${data.subject}:</strong> ${data.notes}</p>
                        <div class="approval-actions">
                            <button class="btn-approve" onclick="approveDiary('${docSnap.id}')"><i class="fa-solid fa-check"></i> Approve</button>
                            <button class="btn-reject" onclick="rejectDiary('${docSnap.id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
                        </div>
                    </div>
                `;
            }
        });

        if (count === 0) approvalsHtml = `<p class="loading-text">No pending approvals.</p>`;
        approvalsList.innerHTML = approvalsHtml;
        pendingCount.textContent = count;

    } catch (error) {
        console.error("Error loading approvals:", error);
        container.innerHTML = `<p class="loading-text" style="color:red;">Error loading data.</p>`;
    }
};

// ==========================================
// 2. APPROVE DIARY
// ==========================================
window.approveDiary = async function(diaryId) {
    try {
        const diaryRef = doc(db, "ediary", diaryId);
        await updateDoc(diaryRef, { 
            status: "approved", 
            approvedBy: "Principal", 
            approvedAt: new Date().toISOString() 
        });
        alert("Diary Approved!");
        window.loadApprovals();
    } catch (error) { 
        console.error("Approval Error:", error);
        alert("Failed to approve."); 
    }
};

// ==========================================
// 3. REJECT DIARY
// ==========================================
window.rejectDiary = async function(diaryId) {
    try {
        const diaryRef = doc(db, "ediary", diaryId);
        await updateDoc(diaryRef, { 
            status: "rejected", 
            approvedBy: "Principal", 
            approvedAt: new Date().toISOString() 
        });
        alert("Diary Rejected.");
        window.loadApprovals();
    } catch (error) { 
        console.error("Rejection Error:", error);
        alert("Failed to reject."); 
    }
};
