// Data Storage (Using localStorage)
let members = JSON.parse(localStorage.getItem('members')) || [];
let currentAdminTab = 'pending';
let isAdminLoggedIn = false;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadMembers();
    updateAnalytics();
    setupEventListeners();
});

function setupEventListeners() {
    // Registration Form
    document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
    
    // Admin Login Form
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
}

// Registration Functions
function openRegistrationModal() {
    document.getElementById('registrationModal').classList.add('active');
}

function closeRegistrationModal() {
    document.getElementById('registrationModal').classList.remove('active');
    document.getElementById('registrationForm').reset();
}

function handleRegistration(e) {
    e.preventDefault();
    
    const formData = {
        id: generateId(),
        name: document.getElementById('name').value,
        fatherName: document.getElementById('fatherName').value,
        motherName: document.getElementById('motherName').value,
        grandfatherName: document.getElementById('grandfatherName').value,
        houseNo: document.getElementById('houseNo').value,
        village: document.getElementById('village').value,
        postOffice: document.getElementById('postOffice').value,
        town: document.getElementById('town').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        district: document.getElementById('district').value,
        country: document.getElementById('country').value,
        pinCode: document.getElementById('pinCode').value,
        zipCode: document.getElementById('zipCode').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        email: document.getElementById('email').value,
        dob: document.getElementById('dob').value,
        children: document.getElementById('children').value,
        education: document.getElementById('education').value,
        gotra: document.getElementById('gotra').value,
        lokei: document.getElementById('lokei').value,
        surname: document.getElementById('surname').value,
        schoolName: document.getElementById('schoolName').value,
        graduationYear: document.getElementById('graduationYear').value,
        jobDescription: document.getElementById('jobDescription').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    members.push(formData);
    saveMembers();
    closeRegistrationModal();
    showToast('Profile submitted successfully! Awaiting admin approval.', 'success');
    updateAnalytics();
}

// Admin Functions
function showAdminLogin() {
    if (isAdminLoggedIn) {
        showAdminPanel();
    } else {
        document.getElementById('adminLoginModal').classList.add('active');
    }
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('active');
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'admin' && password === 'admin123') {
        isAdminLoggedIn = true;
        closeAdminLogin();
        showAdminPanel();
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid credentials', 'error');
    }
}

function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.querySelector('.hero-section').style.display = 'none';
    document.querySelector('.analytics-section').style.display = 'none';
    document.querySelector('.search-section').style.display = 'none';
    document.querySelector('.members-section').style.display = 'none';
    loadAdminMembers('pending');
    window.scrollTo(0, 0);
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('adminPanel').style.display = 'none';
    document.querySelector('.hero-section').style.display = 'block';
    document.querySelector('.analytics-section').style.display = 'block';
    document.querySelector('.search-section').style.display = 'block';
    document.querySelector('.members-section').style.display = 'block';
    loadMembers();
    showToast('Logged out successfully', 'success');
}

function showAdminTab(tab) {
    currentAdminTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tab-btn').classList.add('active');
    
    loadAdminMembers(tab);
}

function loadAdminMembers(status) {
    const filteredMembers = members.filter(m => m.status === status);
    const container = document.getElementById('adminMembersList');
    
    if (filteredMembers.length === 0) {
        container.innerHTML = '<div class="no-members"><p>No members in ' + status + ' status.</p></div>';
        return;
    }
    
    container.innerHTML = filteredMembers.map(member => `
        <div class="admin-member-card glass">
            <div class="admin-member-info">
                <h3>${member.name}</h3>
                <div class="admin-member-details">
                    <div><strong>Mobile:</strong> ${member.mobileNumber}</div>
                    <div><strong>Email:</strong> ${member.email}</div>
                    <div><strong>Village:</strong> ${member.village}</div>
                    <div><strong>City:</strong> ${member.city}, ${member.state}</div>
                </div>
            </div>
            <div class="admin-actions">
                ${status === 'pending' ? `
                    <button class="btn btn-success" onclick="updateMemberStatus('${member.id}', 'approved')">
                        <i class="fas fa-check-circle"></i> Approve
                    </button>
                    <button class="btn btn-danger" onclick="updateMemberStatus('${member.id}', 'trash')">
                        <i class="fas fa-trash"></i> Trash
                    </button>
                ` : ''}
                ${status === 'approved' ? `
                    <button class="btn btn-outline" onclick="updateMemberStatus('${member.id}', 'pending')">
                        <i class="fas fa-clock"></i> Set Pending
                    </button>
                    <button class="btn btn-danger" onclick="updateMemberStatus('${member.id}', 'trash')">
                        <i class="fas fa-trash"></i> Trash
                    </button>
                ` : ''}
                ${status === 'trash' ? `
                    <button class="btn btn-primary" onclick="updateMemberStatus('${member.id}', 'pending')">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateMemberStatus(memberId, newStatus) {
    const member = members.find(m => m.id === memberId);
    if (member) {
        member.status = newStatus;
        saveMembers();
        loadAdminMembers(currentAdminTab);
        loadMembers();
        updateAnalytics();
        showToast(`Member status updated to ${newStatus}`, 'success');
    }
}

// Member Display Functions
function loadMembers(filters = {}) {
    let filteredMembers = members.filter(m => m.status === 'approved');
    
    // Apply filters
    if (filters.search) {
        filteredMembers = filteredMembers.filter(m => 
            m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            m.mobileNumber.includes(filters.search)
        );
    }
    
    if (filters.village) {
        filteredMembers = filteredMembers.filter(m => 
            m.village.toLowerCase().includes(filters.village.toLowerCase())
        );
    }
    
    if (filters.city) {
        filteredMembers = filteredMembers.filter(m => 
            m.city.toLowerCase().includes(filters.city.toLowerCase())
        );
    }
    
    if (filters.grandfatherName) {
        filteredMembers = filteredMembers.filter(m => 
            m.grandfatherName.toLowerCase().includes(filters.grandfatherName.toLowerCase())
        );
    }
    
    if (filters.gotra) {
        filteredMembers = filteredMembers.filter(m => 
            m.gotra.toLowerCase().includes(filters.gotra.toLowerCase())
        );
    }
    
    if (filters.lokei) {
        filteredMembers = filteredMembers.filter(m => 
            m.lokei.toLowerCase().includes(filters.lokei.toLowerCase())
        );
    }
    
    if (filters.surname) {
        filteredMembers = filteredMembers.filter(m => 
            m.surname.toLowerCase().includes(filters.surname.toLowerCase())
        );
    }
    
    if (filters.schoolName) {
        filteredMembers = filteredMembers.filter(m => 
            m.schoolName.toLowerCase().includes(filters.schoolName.toLowerCase())
        );
    }
    
    if (filters.graduationYear) {
        filteredMembers = filteredMembers.filter(m => 
            m.graduationYear === filters.graduationYear
        );
    }
    
    displayMembers(filteredMembers);
}

function displayMembers(memberList) {
    const container = document.getElementById('membersGrid');
    const noMembers = document.getElementById('noMembers');
    
    if (memberList.length === 0) {
        container.innerHTML = '';
        noMembers.style.display = 'block';
        return;
    }
    
    noMembers.style.display = 'none';
    container.innerHTML = memberList.map(member => `
        <div class="member-card" onclick="viewMemberDetails('${member.id}')">
            <div class="member-header">
                <div class="member-avatar">${member.name.charAt(0).toUpperCase()}</div>
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p>${member.village}</p>
                </div>
            </div>
            <div class="member-details">
                <div class="member-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${member.city}, ${member.country}</span>
                </div>
                <div class="member-detail">
                    <i class="fas fa-phone"></i>
                    <span>${maskMobile(member.mobileNumber)}</span>
                </div>
                <div class="member-detail">
                    <i class="fas fa-graduation-cap"></i>
                    <span>${member.education}</span>
                </div>
                ${member.gotra ? `<div class="member-detail"><i class="fas fa-tag"></i><span>Gotra: ${member.gotra}</span></div>` : ''}
            </div>
        </div>
    `).join('');
}

function viewMemberDetails(memberId) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    alert(`Member Details:\n\nName: ${member.name}\nFather: ${member.fatherName}\nMother: ${member.motherName}\nGrandfather: ${member.grandfatherName}\n\nAddress:\n${member.houseNo}, ${member.village}\n${member.town}, ${member.city}\n${member.district}, ${member.state}\n${member.country} - ${member.pinCode}\n\nContact:\nMobile: ${member.mobileNumber}\nEmail: ${member.email}\n\nEducation: ${member.education}\n${member.schoolName ? 'School: ' + member.schoolName : ''}\n${member.graduationYear ? 'Graduation: ' + member.graduationYear : ''}\n\nJob: ${member.jobDescription}`);
}

// Search Functions
function searchMembers() {
    const filters = {
        search: document.getElementById('searchName').value,
        village: document.getElementById('searchVillage').value,
        city: document.getElementById('searchCity').value,
        grandfatherName: document.getElementById('searchGrandfather').value,
        gotra: document.getElementById('searchGotra').value,
        lokei: document.getElementById('searchLokei').value,
        surname: document.getElementById('searchSurname').value,
        schoolName: document.getElementById('searchSchool').value,
        graduationYear: document.getElementById('searchYear').value
    };
    
    loadMembers(filters);
}

function resetFilters() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchVillage').value = '';
    document.getElementById('searchCity').value = '';
    document.getElementById('searchGrandfather').value = '';
    document.getElementById('searchGotra').value = '';
    document.getElementById('searchLokei').value = '';
    document.getElementById('searchSurname').value = '';
    document.getElementById('searchSchool').value = '';
    document.getElementById('searchYear').value = '';
    loadMembers();
}

// Analytics Functions
function updateAnalytics() {
    const total = members.length;
    const approved = members.filter(m => m.status === 'approved').length;
    const pending = members.filter(m => m.status === 'pending').length;
    const trash = members.filter(m => m.status === 'trash').length;
    
    document.getElementById('totalMembers').textContent = approved;
    document.getElementById('analyticsTotal').textContent = total;
    document.getElementById('analyticsApproved').textContent = approved;
    document.getElementById('analyticsPending').textContent = pending;
    document.getElementById('analyticsTrash').textContent = trash;
    
    // Calculate by country, city, state
    const approvedMembers = members.filter(m => m.status === 'approved');
    
    const byCountry = {};
    const byCity = {};
    const byState = {};
    
    approvedMembers.forEach(member => {
        byCountry[member.country] = (byCountry[member.country] || 0) + 1;
        byCity[member.city] = (byCity[member.city] || 0) + 1;
        byState[member.state] = (byState[member.state] || 0) + 1;
    });
    
    displayStats('countryStats', byCountry);
    displayStats('cityStats', byCity);
    displayStats('stateStats', byState);
}

function displayStats(containerId, data) {
    const container = document.getElementById(containerId);
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }
    
    container.innerHTML = sorted.map(([key, value]) => `
        <div class="stats-item">
            <span class="stats-label">${key}</span>
            <span class="stats-value">${value}</span>
        </div>
    `).join('');
}

// Utility Functions
function generateId() {
    return 'member_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function maskMobile(mobile) {
    if (!mobile || mobile.length < 4) return mobile;
    return '*'.repeat(mobile.length - 4) + mobile.slice(-4);
}

function saveMembers() {
    localStorage.setItem('members', JSON.stringify(members));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});