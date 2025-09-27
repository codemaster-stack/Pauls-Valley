// Your existing BACKEND_URL definition
const BACKEND_URL = "https://api.pvbonline.online"; // or however you define it

// PUT THE FUNCTION HERE - right after BACKEND_URL
function getImageUrl(profilePicPath) {
  if (!profilePicPath) return null;
  
  if (profilePicPath.startsWith('http://') || profilePicPath.startsWith('https://')) {
    return profilePicPath;
  } else {
    return `${BACKEND_URL}/${profilePicPath}`;
  }
}


// Place the openSection function HERE 
function openSection(sectionId) {
  // Hide all sections with class 'section'
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });

// card

  if (sectionId === 'cardManagement') {
    console.log("Loading card management...");
    if (typeof initializeCardManagement === 'function') {
        initializeCardManagement();
    }
}
  
  // Hide all sections with class 'content-section' 
  const contentSections = document.querySelectorAll('.content-section');
  contentSections.forEach(section => {
    section.style.display = 'none';
  });
  
  // Show the selected section (try both class types)
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    if (targetSection.classList.contains('section')) {
      targetSection.classList.add('active');
    } else if (targetSection.classList.contains('content-section')) {
      targetSection.style.display = 'block';
    }
  }

  // Load users when viewUsers is opened
  if (sectionId === 'viewUsers') {
    if (typeof window.loadUsers === 'function') {
      window.loadUsers();
    }
  }
  
  // Special handling for chat
  if (sectionId === 'chat') {
    console.log("Loading chat users...");
    setTimeout(() => {
      if (typeof loadChatUsers === 'function') {
        loadChatUsers();
      } else {
        console.error("loadChatUsers function not available yet");
      }
    }, 100);
  }
}

// Make openSection globally available
window.openSection = openSection;

// Then rest of your code...


document.addEventListener("DOMContentLoaded", () => {
  // Function to toggle sidebar
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
  }

  // Make toggleSidebar globally available
  window.toggleSidebar = toggleSidebar;

  // Show dashboard by default
  openSection('dashboard');
});



// // Logout functionality
// document.addEventListener("DOMContentLoaded", () => {
//   // ... rest of your logout code
// });


// Logout functionality
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminToken");
      window.location.href = "admin-signup.html";
    });
  }
});

// Admin form handlers
 
document.addEventListener("DOMContentLoaded", () => {
  // const BACKEND_URL = "https://api.pvbonline.online";
  const token = localStorage.getItem("token"); // Change to "adminToken" if different

  // Show message helper
  function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const activeSection = document.querySelector('.section.active');
    activeSection.insertBefore(messageDiv, activeSection.firstChild);
    
    setTimeout(() => messageDiv.remove(), 5000);
  }

  // Create User Form
  const createUserForm = document.getElementById('createUserForm');
  if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (response.ok) {
          showMessage('User created successfully!');
          e.target.reset();
        } else {
          showMessage(result.message || 'Failed to create user', 'error');
        }
      } catch (error) {
        showMessage('Error creating user', 'error');
        console.error(error);
      }
    });
  }

  // Delete User Form
  const deleteUserForm = document.getElementById('deleteUserForm');
  if (deleteUserForm) {
    deleteUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      
      if (!confirm(`Are you sure you want to delete user: ${email}?`)) return;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/auth/users/${email}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        
        const result = await response.json();
        if (response.ok) {
          showMessage('User deleted successfully!');
          e.target.reset();
        } else {
          showMessage(result.message || 'Failed to delete user', 'error');
        }
      } catch (error) {
        showMessage('Error deleting user', 'error');
        console.error(error);
      }
    });
  }

  // Deactivate User Form
  const deactivateUserForm = document.getElementById('deactivateUserForm');
  if (deactivateUserForm) {
    deactivateUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/auth/users/${email}/deactivate`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${localStorage.getItem("adminToken")}` }
        });
        
        const result = await response.json();
        if (response.ok) {
          showMessage('User deactivated successfully!');
          e.target.reset();
        } else {
          showMessage(result.message || 'Failed to deactivate user', 'error');
        }
      } catch (error) {
        showMessage('Error deactivating user', 'error');
        console.error(error);
      }
    });
  }

  
  // Reactivate User Form

  const reactivateUserForm = document.getElementById('reactivateUserForm');
if (reactivateUserForm) {
  reactivateUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/auth/users/${email}/reactivate`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem("adminToken")}` }
      });
      
      const result = await response.json();
      if (response.ok) {
        showMessage('User reactivated successfully!');
        e.target.reset();
      } else {
        showMessage(result.message || 'Failed to reactivate user', 'error');
      }
    } catch (error) {
      showMessage('Error reactivating user', 'error');
      console.error(error);
    }
  });
}


  // Fund User Form
  const fundUserForm = document.getElementById('fundUserForm');
  if (fundUserForm) {
    fundUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/auth/fund-user`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("adminToken")}` 
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (response.ok) {
          showMessage('User account funded successfully!');
          e.target.reset();
        } else {
          showMessage(result.message || 'Failed to fund user account', 'error');
        }
      } catch (error) {
        showMessage('Error funding user account', 'error');
        console.error(error);
      }
    });
  }

  // transfer

const transferForm = document.getElementById('transferForm');
if (transferForm) {
  transferForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData); // This will now include both senderDescription and receiverDescription
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/auth/transfer-funds`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("adminToken")}` 
        },
        body: JSON.stringify(data) // Sends both descriptions to backend
      });
      
      const result = await response.json();
      if (response.ok) {
        showMessage('Funds transferred successfully!');
        e.target.reset();
      } else {
        showMessage(result.message || 'Failed to transfer funds', 'error');
      }
    } catch (error) {
      showMessage('Error transferring funds', 'error');
      console.error(error);
    }
  });
}



  // Send Email Form
  const sendEmailForm = document.getElementById('sendEmailForm');
  if (sendEmailForm) {
    sendEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/auth/send-email`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("adminToken")}` 
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (response.ok) {
          showMessage('Email sent successfully!');
          e.target.reset();
        } else {
          showMessage(result.message || 'Failed to send email', 'error');
        }
      } catch (error) {
        showMessage('Error sending email', 'error');
        console.error(error);
      }
    });
  }

  // Load Users Function
   
 window.loadUsers = async function() {
  const usersTableBody = document.getElementById('usersTableBody');
  if (!usersTableBody) return;
  
  usersTableBody.innerHTML = '<tr><td colspan="8" class="loading">Loading users...</td></tr>';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/auth/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem("adminToken")}` }
    });
    
    const users = await response.json();
    
    if (response.ok && Array.isArray(users)) {
      usersTableBody.innerHTML = users.map(user => {
        const profilePicPath = user.profilePic || user.profilePicture;
        const imageUrl = getImageUrl(profilePicPath); // USE HELPER FUNCTION
        
        return `
          <tr>
            <td>${user.fullname || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>$${((user.balances?.current || 0) + (user.balances?.savings || 0)).toFixed(2)}</td>
            <td class="${user.isActive !== false ? 'status-active' : 'status-inactive'}">
              ${user.isActive !== false ? 'Active' : 'Inactive'}
            </td>
            <td>${user.savingsAccountNumber || 'Not Generated'}</td>
            <td>${user.currentAccountNumber || 'Not Generated'}</td>
            <td>
              ${imageUrl 
               ? `<img src="${imageUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`
                : '<span style="color: #666;">No Image</span>'
              }
            </td>
          </tr>
        `;
      }).join('');
    } else {
      usersTableBody.innerHTML = '<tr><td colspan="8">Failed to load users</td></tr>';
    }
  } catch (error) {
    console.error('Error loading users:', error);
    usersTableBody.innerHTML = '<tr><td colspan="8">Error loading users</td></tr>';
  }
};
  // Update User Profile functionality
 const updateUserForm = document.getElementById('updateUserForm');   
 const searchUserBtn = document.getElementById('searchUserBtn');   
 const userUpdateFields = document.getElementById('userUpdateFields');    

  if (searchUserBtn) {
   searchUserBtn.addEventListener('click', async () => {
  const email = updateUserForm.searchEmail.value;
 if (!email) return;    

  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/auth/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem("adminToken")}` }
    });
    
    const users = await response.json();
    const user = users.find(u => u.email === email);
    
    if (user) {
      updateUserForm.fullname.value = user.fullname || '';
      updateUserForm.email.value = user.email || '';       
      updateUserForm.phone.value = user.phone || '';  
      
 // Display current profile picture       
      const currentProfilePic = document.getElementById('currentProfilePic');
      if (user.profilePic) {
       const imageUrl = getImageUrl(user.profilePic);
       currentProfilePic.src = imageUrl;  
      } else {
        currentProfilePic.src = '/default-avatar.png';
      }
      
      userUpdateFields.style.display = 'block';
    } else {
      showMessage('User not found', 'error');
    }
  } catch (error) {
    showMessage('Error searching user', 'error');
    console.error(error);
  }
});
  }

  if (updateUserForm) {
  updateUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchEmail = e.target.searchEmail.value;
    
    // Use FormData instead of JSON for file uploads
    const formData = new FormData();
    
    // Add text fields
    if (e.target.fullname.value) formData.append('fullname', e.target.fullname.value);
    if (e.target.email.value) formData.append('email', e.target.email.value);
    if (e.target.phone.value) formData.append('phone', e.target.phone.value);
    
    // Handle file upload
    const fileInput = e.target.profilePic;
    if (fileInput.files.length > 0) {
      formData.append('profilePic', fileInput.files[0]);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/auth/users/${searchEmail}/profile`, {
        
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
          // Remove Content-Type header - let browser set it for FormData
        },
        body: formData // Use FormData instead of JSON
      });

      const result = await response.json();
      if (response.ok) {
        showMessage('User profile updated successfully!');
        userUpdateFields.style.display = 'none';
        e.target.reset();
      } else {
        showMessage(result.message || 'Failed to update user profile', 'error');
      }
    } catch (error) {
      showMessage('Error updating user profile', 'error');
      console.error(error);
    }
  });
}
});


function openMailModal() {
  document.getElementById("mailModal").style.display = "block";

  // Fetch messages
  fetch("https://api.pvbonline.online/api/admin/auth/messages", { credentials: "include" })
  
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("messageList");
      list.innerHTML = "";

      data.forEach((msg, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <div class="collapsible">
            <div class="summary">
              <strong>${msg.email || "Guest User"}</strong> - ${msg.subject}
              <button class="toggle-btn">+</button>
            </div>
            <div class="details" style="display: none; margin-top: 5px;">
              <strong>Name:</strong> ${msg.name || "Guest User"}<br>
              <strong>Email:</strong> ${msg.email}<br>
              <strong>Phone:</strong> ${msg.phone || "N/A"}<br>
              <strong>Subject:</strong> ${msg.subject}<br>
              <strong>Message:</strong> ${msg.message}
            </div>
          </div>
        `;

        // Toggle expand/collapse
        li.querySelector(".toggle-btn").addEventListener("click", (e) => {
          const details = li.querySelector(".details");
          const btn = e.target;
          if (details.style.display === "none") {
            details.style.display = "block";
            btn.textContent = "−";
          } else {
            details.style.display = "none";
            btn.textContent = "+";
          }
        });

        list.appendChild(li);
      });
    });

  // Fetch loan applications
   fetch("https://api.pvbonline.online/api/admin/auth/loans", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("loanList");
      list.innerHTML = "";

      data.forEach((loan, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <div class="collapsible">
            <div class="summary">
              <strong>${loan.applicantName}</strong> applied for ${loan.loanType} loan - $${loan.loanAmount}
              <button class="toggle-btn">+</button>
            </div>
            <div class="details" style="display: none; margin-top: 5px;">
              <strong>Loan Type:</strong> ${loan.loanType}<br>
              <strong>Amount:</strong> $${loan.loanAmount}<br>
              <strong>Applicant Name:</strong> ${loan.applicantName}<br>
              <strong>Email:</strong> ${loan.applicantEmail}<br>
              <strong>Phone:</strong> ${loan.applicantPhone}<br>
              <strong>Annual Income:</strong> $${loan.annualIncome}<br>
              <strong>Purpose:</strong> ${loan.loanPurpose}<br>
              <strong>Status:</strong> ${loan.status}
            </div>
          </div>
        `;

        // Toggle expand/collapse
        li.querySelector(".toggle-btn").addEventListener("click", (e) => {
          const details = li.querySelector(".details");
          const btn = e.target;
          if (details.style.display === "none") {
            details.style.display = "block";
            btn.textContent = "−";
          } else {
            details.style.display = "none";
            btn.textContent = "+";
          }
        });

        list.appendChild(li);
      });
    });
}

function closeMailModal() {
  document.getElementById("mailModal").style.display = "none";
}




// Connect to your backend socket server
let selectedVisitorId = null;

const socket = io("https://api.pvbonline.online");

// Admin joins the admin room
socket.emit("joinAdmin", "admin_" + Date.now());

// Fetch active visitors
function loadChatUsers() {
  console.log("🔍 loadChatUsers called!");
  console.trace("Called from:"); // This will show you exactly what called this function
  
  const usersUl = document.getElementById("usersUl");
  if (!usersUl) {
    console.error("❌ usersUl element not found!");
    return;
  }
  
  // Check if visitors are already in the list
  const existingVisitors = usersUl.querySelectorAll('li[id^="visitor-"]');
  console.log("📋 Existing visitors found:", existingVisitors.length);
  
  if (existingVisitors.length === 0) {
    console.log("📋 No visitors, showing waiting message");
    usersUl.innerHTML = "<li><em>Waiting for visitors to send messages...</em></li>";
  } else {
    console.log("📋 Visitors already in list, preserving them");
    // Don't clear the list if visitors are already there
  }
}
function selectUser(visitorId, email) {
  selectedVisitorId = visitorId;
  document.getElementById("chatWindow").innerHTML = `<p><em>Chatting with ${email}</em></p>`;
  console.log("Selected user:", visitorId, email);
}

// Send message
function sendMessage() {
  if (!selectedVisitorId) {
    alert("Please select a user first.");
    return;
  }

  const input = document.getElementById("chatMessage");
  const message = input.value.trim();
  if (!message) return;

  socket.emit("adminMessage", { visitorId: selectedVisitorId, text: message });

  appendMessage("Admin", message);
  input.value = "";
}

// Receive visitor messages
socket.on("chatMessage", (data) => {
  console.log("📨 Received message:", data);
  
  // Auto-add visitor to list if not already there
  if (!document.getElementById(`visitor-${data.visitorId}`)) {
    const usersUl = document.getElementById("usersUl");
    if (usersUl) {
      // Clear the "Waiting for visitors..." message
      if (usersUl.innerHTML.includes("Waiting for visitors")) {
        usersUl.innerHTML = "";
      }
      
      // Create new visitor list item
      const li = document.createElement("li");
      li.textContent = data.visitorId;
      li.style.cursor = "pointer";
      li.style.padding = "8px";
      li.style.borderBottom = "1px solid #ddd";
      li.style.listStyle = "none";
      li.onclick = () => {
        selectUser(data.visitorId, data.visitorId);
        // Highlight selected user
        document.querySelectorAll("#usersUl li").forEach(item => {
          item.style.backgroundColor = "";
          item.style.fontWeight = "normal";
        });
        li.style.backgroundColor = "#e3f2fd";
      };
      li.id = `visitor-${data.visitorId}`;
      usersUl.appendChild(li);
      
      console.log("✅ Added visitor to list:", data.visitorId);
    }
  }
  
  // Handle the message
  if (data.visitorId === selectedVisitorId) {
    appendMessage("User", data.text);
  } else {
    console.log("📩 New message from another visitor:", data);
    // Highlight visitor with new message
    const visitorLi = document.getElementById(`visitor-${data.visitorId}`);
    if (visitorLi) {
      visitorLi.style.backgroundColor = "#ffeb3b";
      visitorLi.style.fontWeight = "bold";
    }
  }
});

function appendMessage(sender, message) {
  const chatWindow = document.getElementById("chatWindow");
  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-message";
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Card

 // Global variables
        let currentCardId = null;
        let allCardsData = [];
        // const BACKEND_URL = 'https://api.pvbonline.online';

        // Initialize on page
     function initializeCardManagement() {
    loadPendingCards();
    loadStats();
}

// Open rejection modal
function openRejectionModal(cardId) {
    currentCardId = cardId;
    document.getElementById('rejectionModal').style.display = 'block';
}

// Close rejection modal
function closeRejectionModal() {
    document.getElementById('rejectionModal').style.display = 'none';
    document.getElementById('rejectionForm').reset();
    currentCardId = null;
}

// Handle rejection form submission - Add this event listener separately
document.addEventListener('DOMContentLoaded', () => {
    const rejectionForm = document.getElementById('rejectionForm');
    if (rejectionForm) {
        rejectionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const reason = document.getElementById('rejectionReason').value;
            
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/reject-card/${currentCardId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    },
                    body: JSON.stringify({ reason })
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('❌ Card application rejected successfully!');
                    closeRejectionModal();
                    loadPendingCards();
                    loadStats();
                } else {
                    alert(`❌ Error: ${result.message}`);
                }
            } catch (error) {
                alert('❌ Network error. Please try again.');
                console.error('Error rejecting card:', error);
            }
        });
    }
});

        // Tab switching
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
            
            // Load data based on tab
            switch(tabName) {
                case 'pending':
                    loadPendingCards();
                    break;
                case 'approved':
                    loadApprovedCards();
                    break;
                case 'all':
                    loadAllCards();
                    break;
                case 'stats':
                    loadStats();
                    break;
            }
        }

        // Load pending card applications
        async function loadPendingCards() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/pending-cards`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    displayPendingCards(result.pendingCards);
                } else {
                    console.error('Error loading pending cards:', result.message);
                }
            } catch (error) {
                console.error('Network error loading pending cards:', error);
            }
        }

        // Load approved cards
        async function loadApprovedCards() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/all-cards?status=approved`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    displayApprovedCards(result.cards);
                } else {
                    console.error('Error loading approved cards:', result.message);
                }
            } catch (error) {
                console.error('Network error loading approved cards:', error);
            }
        }

        // Load all cards
        async function loadAllCards() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/all-cards`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    allCardsData = result.cards;
                    displayAllCards(result.cards);
                } else {
                    console.error('Error loading all cards:', result.message);
                }
            } catch (error) {
                console.error('Network error loading all cards:', error);
            }
        }

        // Load statistics
        async function loadStats() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/all-cards`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    const cards = result.cards;
                    const totalCards = cards.length;
                    const pendingCards = cards.filter(card => card.status === 'pending').length;
                    const approvedCards = cards.filter(card => card.status === 'approved').length;
                    const activeCards = cards.filter(card => card.status === 'approved' && card.isActive).length;

                    document.getElementById('totalCards').textContent = totalCards;
                    document.getElementById('pendingCards').textContent = pendingCards;
                    document.getElementById('approvedCards').textContent = approvedCards;
                    document.getElementById('activeCards').textContent = activeCards;
                }
            } catch (error) {
                console.error('Network error loading stats:', error);
            }
        }

        // Display pending cards
        function displayPendingCards(cards) {
            const container = document.getElementById('pendingCardsContainer');
            
            if (cards.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>🎉 No Pending Applications</h3>
                        <p>All card applications have been processed.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = cards.map(card => `
                <div class="card-application pending">
                    <div class="card-header">
                        <div class="user-info">
                            <h3>${card.userId.fullname}</h3>
                            <p>${card.userId.email}</p>
                        </div>
                        <span class="status-badge pending">${card.status}</span>
                    </div>
                    
                    <div class="card-details">
                        <div class="detail-item">
                            <label>Card Holder Name</label>
                            <span>${card.cardHolderName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Card Type</label>
                            <span>${card.cardType.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Card Number</label>
                            <span>${card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Expiry Date</label>
                            <span>${card.expiryDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>CVV</label>
                            <span>${card.cvv}</span>
                        </div>
                        <div class="detail-item">
                            <label>Applied On</label>
                            <span>${new Date(card.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn btn-approve" onclick="approveCard('${card._id}')">
                            ✅ Approve
                        </button>
                        <button class="btn btn-reject" onclick="openRejectionModal('${card._id}')">
                            ❌ Reject
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Display approved cards
        function displayApprovedCards(cards) {
            const container = document.getElementById('approvedCardsContainer');
            
            if (cards.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>📭 No Approved Cards</h3>
                        <p>No cards have been approved yet.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = cards.map(card => `
                <div class="card-application approved">
                    <div class="card-header">
                        <div class="user-info">
                            <h3>${card.userId.fullname}</h3>
                            <p>${card.userId.email}</p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="status-badge approved">${card.status}</span>
                            <span class="status-badge ${card.isActive ? 'approved' : 'rejected'}">
                                ${card.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="card-details">
                        <div class="detail-item">
                            <label>Card Holder Name</label>
                            <span>${card.cardHolderName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Card Type</label>
                            <span>${card.cardType.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Card Number</label>
                            <span>${card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Expiry Date</label>
                            <span>${card.expiryDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>Created By</label>
                            <span>${card.createdBy.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Approved On</label>
                            <span>${card.approvedAt ? new Date(card.approvedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="card-actions">
                        ${card.isActive 
                            ? `<button class="btn btn-deactivate" onclick="deactivateCard('${card._id}')">🚫 Deactivate</button>`
                            : `<button class="btn btn-reactivate" onclick="reactivateCard('${card._id}')">✅ Reactivate</button>`
                        }
                    </div>
                </div>
            `).join('');
        }

        // Display all cards
        function displayAllCards(cards) {
            const container = document.getElementById('allCardsContainer');
            
            if (cards.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>📭 No Cards Found</h3>
                        <p>No cards match the selected filters.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = cards.map(card => `
                <div class="card-application ${card.status}">
                    <div class="card-header">
                        <div class="user-info">
                            <h3>${card.userId.fullname}</h3>
                            <p>${card.userId.email}</p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="status-badge ${card.status}">${card.status}</span>
                            ${card.status === 'approved' ? `
                                <span class="status-badge ${card.isActive ? 'approved' : 'rejected'}">
                                    ${card.isActive ? 'Active' : 'Inactive'}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="card-details">
                        <div class="detail-item">
                            <label>Card Holder Name</label>
                            <span>${card.cardHolderName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Card Type</label>
                            <span>${card.cardType.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Card Number</label>
                            <span>${card.cardNumber.replace(/(.{4})/g, '$1 ').trim()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Created By</label>
                            <span>${card.createdBy.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Applied On</label>
                            <span>${new Date(card.createdAt).toLocaleDateString()}</span>
                        </div>
                        ${card.rejectionReason ? `
                            <div class="detail-item" style="grid-column: 1 / -1;">
                                <label>Rejection Reason</label>
                                <span style="color: #dc3545;">${card.rejectionReason}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="card-actions">
                        ${card.status === 'pending' ? `
                            <button class="btn btn-approve" onclick="approveCard('${card._id}')">✅ Approve</button>
                            <button class="btn btn-reject" onclick="openRejectionModal('${card._id}')">❌ Reject</button>
                        ` : card.status === 'approved' ? `
                            ${card.isActive 
                                ? `<button class="btn btn-deactivate" onclick="deactivateCard('${card._id}')">🚫 Deactivate</button>`
                                : `<button class="btn btn-reactivate" onclick="reactivateCard('${card._id}')">✅ Reactivate</button>`
                            }
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Approve card
      async function approveCard(cardId) {
            if (!confirm('Are you sure you want to approve this card application?')) {
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/approve-card/${cardId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('✅ Card approved successfully!');
                    loadPendingCards();
                    loadStats();
                } else {
                    alert(`❌ Error: ${result.message}`);
                }
            } catch (error) {
                alert('❌ Network error. Please try again.');
                console.error('Error approving card:', error);
            }
        }

                            // Deactivate card
        async function deactivateCard(cardId) {
            if (!confirm('Are you sure you want to deactivate this card? The user will not be able to use it.')) {
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/deactivate-card/${cardId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('🚫 Card deactivated successfully!');
                    loadApprovedCards();
                    loadAllCards();
                    loadStats();
                } else {
                    alert(`❌ Error: ${result.message}`);
                }
            } catch (error) {
                alert('❌ Network error. Please try again.');
                console.error('Error deactivating card:', error);
            }
        }


              // Reactivate card
        async function reactivateCard(cardId) {
            if (!confirm('Are you sure you want to reactivate this card?')) {
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/reactivate-card/${cardId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert('✅ Card reactivated successfully!');
                    loadApprovedCards();
                    loadAllCards();
                    loadStats();
                } else {
                    alert(`❌ Error: ${result.message}`);
                }
            } catch (error) {
                alert('❌ Network error. Please try again.');
                console.error('Error reactivating card:', error);
            }
        }
                // Filter approved cards
        function filterCards() {
            const statusFilter = document.getElementById('statusFilter').value;
            const cardTypeFilter = document.getElementById('cardTypeFilter').value;
            
            let url = `${BACKEND_URL}/api/admin/all-cards?status=approved`;
            
            if (statusFilter !== '') {
                url += `&isActive=${statusFilter}`;
            }
            
            if (cardTypeFilter !== '') {
                url += `&cardType=${cardTypeFilter}`;
            }
            
            fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            })
            .then(response => response.json())
            .then(result => {
                if (result.cards) {
                    displayApprovedCards(result.cards);
                }
            })
            .catch(error => console.error('Error filtering cards:', error));
        }

        // Filter all cards
        function filterAllCards() {
            const statusFilter = document.getElementById('allStatusFilter').value;
            const activeFilter = document.getElementById('allActiveFilter').value;
            const cardTypeFilter = document.getElementById('allCardTypeFilter').value;
            
            let filteredCards = [...allCardsData];
            
            if (statusFilter) {
                filteredCards = filteredCards.filter(card => card.status === statusFilter);
            }
            
            if (activeFilter !== '') {
                filteredCards = filteredCards.filter(card => card.isActive === (activeFilter === 'true'));
            }
            
            if (cardTypeFilter) {
                filteredCards = filteredCards.filter(card => card.cardType === cardTypeFilter);
            }
            
            displayAllCards(filteredCards);
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('rejectionModal');
            if (event.target === modal) {
                closeRejectionModal();
            }
        }

        function openCardCreationPage() {
    // Option 1: Open in new tab (recommended)
    window.open('admin-user-card.html', '_blank');
    
    // Option 2: Open in same window
    // window.location.href = 'admin-card-creation.html';
    
    // Option 3: Open in popup window
    // window.open('admin-card-creation.html', 'cardCreation', 'width=1200,height=800,scrollbars=yes');
}