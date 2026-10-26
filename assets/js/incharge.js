import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. CLASS-WISE SUBJECTS (మీరు ఇచ్చిన డేటా)
// ==========================================
const classSubjects = {
    "Class I": ["Telugu", "Hindi", "English", "Maths", "EVS", "Computers"],
    "Class II": ["Hindi", "English", "Maths", "EVS", "Computers", "Telugu"],
    "Class III": ["English", "Maths", "GS", "Telugu", "Hindi", "Social", "Computers", "Vedic Maths"],
    "Class IV": ["Maths", "Social", "Telugu", "Hindi", "Computers", "GS", "English", "Vedic Maths"],
    "Class V": ["GS", "Telugu", "Computers", "English", "Maths", "Hindi", "Social", "Vedic Maths"],
    "Class VI": ["G.S", "Telugu", "Maths", "English", "Social", "Hindi"],
    "Class VII": ["English", "Hindi", "Social", "Telugu", "GS", "Maths"],
    "Class VIII": ["Maths", "Social", "English", "Biology", "Hindi", "Telugu", "Physics"],
    "Class IX": ["Hindi", "Telugu", "Maths", "English", "Physics", "Biology", "Social"],
    "Class X": ["Hindi", "Telugu", "Maths", "English", "Physics", "Biology", "Social"]
};

// ==========================================
// 2. ATTENDANCE - LOAD STUDENTS
// ==========================================
window.loadStudents = function() {
    const container = document.getElementById('student-attendance-list');
    if (!container) return;

    // డమ్మీ డేటా (తర్వాత Firestore నుండి తెస్తాము)
    const mockStudents = [
        { roll: 1, name: "Ravi Kumar" }, { roll: 2, name: "Sita Sharma" },
        { roll: 3, name: "Arjun Reddy" }, { roll: 4, name: "Priya Singh" },
        { roll: 5, name: "Kiran Rao" }
    ];

    let html = '';
    mockStudents.forEach(student => {
        html += `
            <div class="attendance-card">
                <div class="student-info">
                    <span class="roll-badge">${String(student.roll).padStart(2, '0')}</span>
                    <span class="student-name">${student.name}</span>
                </div>
                <div class="attendance-actions">
                    <button class="att-btn active-p" onclick="markAttendance(this, 'P')">P</button>
                    <button class="att-btn" onclick="markAttendance(this, 'A')">A</button>
                    <button class="att-btn" onclick="markAttendance(this, 'L')">L</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    setTodayDate('today-date');
};

// ==========================================
// 3. ATTENDANCE - MARK P/A/L
// ==========================================
window.markAttendance = function(btn, status) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active-p', 'active-a', 'active-l'));
    if (status === 'P') btn.classList.add('active-p');
    if (status === 'A') btn.classList.add('active-a');
    if (status === 'L') btn.classList.add('active-l');
};

// ==========================================
// 4. ATTENDANCE - SUBMIT (Firestore)
// ==========================================
window.submitAttendance = async function() {
    const classSelect = document.getElementById('attendance-class-select');
    if (!classSelect) return;
    
    const selectedClass = classSelect.value;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const records = {};
    document.querySelectorAll('.attendance-card').forEach(card => {
        const rollBadge = card.querySelector('.roll-badge');
        const rollNo = rollBadge ? rollBadge.textContent.trim() : null;
        let status = 'P';
        if (card.querySelector('.att-btn.active-a')) status = 'A';
        if (card.querySelector('.att-btn.active-l')) status = 'L';
        if (rollNo) records[rollNo] = status;
    });

    try {
        const { db } = await import('./firebase-config.js');
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        const attendanceRef = doc(db, "attendance", `${selectedClass}_${today}`);
        await setDoc(attendanceRef, {
            className: selectedClass,
            date: today,
            records: records,
            submittedAt: new Date().toISOString()
        });

        alert("Attendance Submitted Successfully!");
    } catch (error) {
        console.error("Attendance Error:", error);
        alert("Failed to submit attendance.");
    }
};

// ==========================================
// 5. E-DIARY - LOAD SUBJECTS
// ==========================================
window.loadSubjects = function() {
    const classSelect = document.getElementById('diary-class-select');
    const container = document.getElementById('subjects-container');
    if (!classSelect || !container) return;

    const selectedClass = classSelect.value;
    const subjects = classSubjects[selectedClass] || [];

    let html = '';
    subjects.forEach(subject => {
        html += `
            <div class="subject-card">
                <div class="subject-header"><span class="subject-name">📘 ${subject}</span></div>
                <textarea class="subject-textarea" placeholder="Enter ${subject} notes here..." data-subject="${subject}"></textarea>
            </div>
        `;
    });
    container.innerHTML = html;
    setTodayDate('diary-date');
};

// ==========================================
// 6. E-DIARY - ADD MANUAL SUBJECT
// ==========================================
window.addManualSubject = function() {
    const subjectName = prompt("Enter subject name:");
    if (subjectName && subjectName.trim() !== '') {
        const container = document.getElementById('subjects-container');
        const newCard = document.createElement('div');
        newCard.className = 'subject-card';
        newCard.innerHTML = `
            <div class="subject-header"><span class="subject-name">📘 ${subjectName}</span></div>
            <textarea class="subject-textarea" placeholder="Enter ${subjectName} notes here..." data-subject="${subjectName}"></textarea>
        `;
        container.appendChild(newCard);
    }
};

// ==========================================
// 7. E-DIARY - SUBMIT (Firestore)
// ==========================================
window.submitEDiary = async function() {
    const classSelect = document.getElementById('diary-class-select');
    if (!classSelect) return;
    
    const selectedClass = classSelect.value;
    const textareas = document.querySelectorAll('.subject-textarea');
    let hasData = false;

    for (const textarea of textareas) {
        const subject = textarea.getAttribute('data-subject');
        const notes = textarea.value.trim();
        if (notes !== '') {
            hasData = true;
            try {
                const { db } = await import('./firebase-config.js');
                const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                
                await addDoc(collection(db, "ediary"), {
                    className: selectedClass, 
                    subject: subject, 
                    notes: notes,
                    status: "pending", 
                    createdAt: new Date().toISOString(), 
                    createdBy: "Incharge"
                });
            } catch (error) { 
                console.error("Error saving diary:", error); 
            }
        }
    }

    if (hasData) {
        alert("E-Diary sent for Principal Approval!");
        textareas.forEach(t => t.value = '');
    } else {
        alert("Please enter at least one subject notes.");
    }
};

// ==========================================
// 8. ANNOUNCEMENTS - TAB SWITCHER
// ==========================================
window.switchTab = function(btn, type) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const classGroup = document.getElementById('class-selector-group');
    if (classGroup) classGroup.style.display = (type === 'school') ? 'none' : 'flex';
};

// ==========================================
// 9. ANNOUNCEMENTS - SUBMIT (Firestore)
// ==========================================
window.submitAnnouncement = async function() {
    const message = document.getElementById('announcement-message').value.trim();
    const classSelect = document.getElementById('announcement-class-select');
    const isClassNotice = document.getElementById('class-selector-group').style.display !== 'none';
    
    if (!message) { alert("Please enter a message."); return; }

    try {
        const { db } = await import('./firebase-config.js');
        const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        
        await addDoc(collection(db, "announcements"), {
            scope: isClassNotice ? 'class' : 'school',
            className: isClassNotice ? classSelect.value : null,
            message: message, 
            status: "pending",
            createdAt: new Date().toISOString(), 
            createdBy: "Incharge"
        });
        alert("Announcement sent for approval!");
        document.getElementById('announcement-message').value = '';
    } catch (error) { 
        console.error("Announcement Error:", error); 
    }
};

// ==========================================
// 10. UTILITY - SET TODAY'S DATE
// ==========================================
function setTodayDate(elementId) {
    const dateEl = document.getElementById(elementId);
    if (dateEl) {
        const today = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        dateEl.textContent = today.toLocaleDateString('en-IN', options);
    }
}
