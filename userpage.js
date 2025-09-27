// setupProfilePictureUpload();
// loadUserProfile();

document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_URL = "https://api.pvbonline.online";

  loadUserDashboard();
  setupProfilePictureUpload();

  // Load user dashboard info
  async function loadUserDashboard() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/me`, {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("token")
        }
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to load user info", data);
        return;
      }

      // Update name
      const userNameEl = document.getElementById("userName");
      if (userNameEl) userNameEl.textContent = data.fullname;

      // Update profile picture
      const profilePicEl = document.getElementById("profilePic");
      
      function loadProfilePicture(profilePicPath, profilePicElement) {
  const defaultAvatar = "data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100' height='100' fill='%23ddd'/%3e%3ctext x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='0.3em'%3eUser%3c/text%3e%3c/svg%3e";

  if (!profilePicPath) {
    console.log('No profile pic path provided, using default');
    profilePicElement.src = defaultAvatar;
    profilePicElement.style.visibility = "visible";
    return;
  }

  // Check if it's already a full URL (Cloudinary) or a local path
  let imageUrl;
  if (profilePicPath.startsWith('http://') || profilePicPath.startsWith('https://')) {
    // It's already a full URL (Cloudinary)
    imageUrl = profilePicPath;
    console.log('🖼️ Loading Cloudinary image:', imageUrl);
  } else {
    // It's a local path (for backward compatibility during migration)
    const timestamp = Date.now();
    imageUrl = `${BACKEND_URL}/${profilePicPath}?t=${timestamp}`;
    console.log('🖼️ Loading local image:', imageUrl);
  }
  
  console.log('📁 Profile pic path from API:', profilePicPath);

  // Test image loading before setting src
  const testImg = new Image();
  
  testImg.onload = () => {
    console.log('✅ Profile pic loaded successfully');
    profilePicElement.src = imageUrl;
    profilePicElement.style.visibility = "visible";
  };
  
  testImg.onerror = () => {
    console.log('❌ Profile pic failed to load:', imageUrl);
    console.log('📝 Fallback: Using default avatar');
    
    // Only try HEAD request for local images (not Cloudinary URLs)
    if (!profilePicPath.startsWith('http')) {
      fetch(imageUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.log(`🔍 Server response: ${response.status} - ${response.statusText}`);
          }
        })
        .catch(err => {
          console.log('🔍 Network error:', err.message);
        });
    }
    
    profilePicElement.src = defaultAvatar;
    profilePicElement.style.visibility = "visible";
  };
  
  testImg.src = imageUrl;
}

// Usage stays exactly the same
if (profilePicEl) {
  loadProfilePicture(data.profilePic, profilePicEl);
}
      // Update balances
      if (data.balances) {
        const { savings, current, loan, inflow, outflow } = data.balances;

        // Top balance (current + savings)
        const totalEl = document.getElementById("currentBalance");
        if (totalEl) totalEl.textContent = `$${(current + savings).toLocaleString()}`;

        // Individual balances
        const savingsEl = document.getElementById("savingsBalance");
        if (savingsEl) savingsEl.textContent = `$${savings.toLocaleString()}`;

        const currentEl = document.getElementById("onlyCurrentBalance");
        if (currentEl) currentEl.textContent = `$${current.toLocaleString()}`;

        const loanEl = document.getElementById("loanBalance");
        if (loanEl) loanEl.textContent = `$${loan.toLocaleString()}`;

        const inflowEl = document.getElementById("inflow");
        if (inflowEl) {
          inflowEl.textContent = `$${inflow.toLocaleString()}`;
          inflowEl.style.color = inflow > 0 ? "green" : "inherit";
        }

        const outflowEl = document.getElementById("outflow");
        if (outflowEl) {
          outflowEl.textContent = `-$${outflow.toLocaleString()}`;
          outflowEl.style.color = outflow > 0 ? "red" : "inherit";
        }
      }

      // Save account numbers globally for modal use
      window.accountNumbers = {
        current: data.currentAccountNumber || "N/A",
        savings: data.savingsAccountNumber || "N/A"
      };

    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  }

  // Profile picture upload
  function setupProfilePictureUpload() {
    const profilePicEl = document.getElementById("profilePic");
    if (!profilePicEl) return;

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.style.display = "none";
    document.body.appendChild(uploadInput);

    profilePicEl.addEventListener("click", () => uploadInput.click());

    uploadInput.addEventListener("change", async () => {
      const file = uploadInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("profilePic", file);

      try {
        const res = await fetch(`${BACKEND_URL}/api/users/profile-picture`, {
          method: "PUT",
          headers: { "Authorization": "Bearer " + localStorage.getItem("token") },
          body: formData
        });

        const data = await res.json();
        if (res.ok) {
          // Reload dashboard to show updated profile picture
          loadUserDashboard();
          alert("Profile picture updated successfully!");
        } else {
          alert(data.message || "Profile picture upload failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Profile picture upload failed");
      }
    });
  }

  // Buttons & Modals
  const btnDetails = document.getElementById("btnDetails");
  const btnAccount = document.getElementById("btnAccount");

  const detailsModal = document.getElementById("detailsModal");
  const accountModal = document.getElementById("accountModal");

  // Transactions Modal
  if (btnDetails && detailsModal) {
    btnDetails.addEventListener("click", async () => {
      detailsModal.style.display = "block";

      try {
        const res = await fetch(`${BACKEND_URL}/api/transaction/history`, {
          headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });

        const data = await res.json();
        const listEl = document.getElementById("transactionList");

        if (Array.isArray(data) && data.length > 0) {
          listEl.innerHTML = data.map(tx => `
            <p>
              <strong>${new Date(tx.date).toLocaleDateString()}</strong>: 
              ${tx.type} - $${tx.amount}
            </p>
          `).join("");
        } else {
          listEl.innerHTML = "<p>No transactions yet.</p>";
        }
      } catch (err) {
        console.error("Error loading transactions:", err);
        document.getElementById("transactionList").innerHTML = "<p>Error loading transactions.</p>";
      }
    });
  }

  // Account Details Modal
  if (btnAccount && accountModal) {
    btnAccount.addEventListener("click", () => {
      accountModal.style.display = "block";

      document.getElementById("currentAccountNumber").textContent =
        window.accountNumbers?.current || "N/A";

      document.getElementById("savingsAccountNumber").textContent =
        window.accountNumbers?.savings || "N/A";

      document.getElementById("accCurrentBalance").textContent =
        document.getElementById("onlyCurrentBalance")?.textContent || "$0";

      document.getElementById("accSavingsBalance").textContent =
        document.getElementById("savingsBalance")?.textContent || "$0";

      document.getElementById("accLoanBalance").textContent =
        document.getElementById("loanBalance")?.textContent || "$0";
    });
  }

  // Close modals
  document.querySelectorAll(".modal .close").forEach(closeBtn => {
    closeBtn.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-close");
      if (modalId) document.getElementById(modalId).style.display = "none";
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
  });

});

// Account Summary Function (for /api/users/me endpoint)
async function loadAccountSummary() {
  try {
    const token = localStorage.getItem("token"); 
    const res = await fetch("https://api.pvbonline.online/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load account details");
    const data = await res.json();

    // Welcome text
    const welcomeEl = document.getElementById("welcomeText");
    if (welcomeEl) {
      welcomeEl.innerText = `Welcome Back, ${data.fullname || "User"}`;
    }

    // Balance (current + savings)
    const totalBalance = (data.balances?.current || 0) + (data.balances?.savings || 0);
    const balanceEl = document.getElementById("accountBalance");
    if (balanceEl) {
      balanceEl.innerText = `$${totalBalance.toFixed(2)}`;
    }

    // Current account number
    const accountNumberEl = document.getElementById("accountNumber");
    if (accountNumberEl) {
      accountNumberEl.innerText = data.currentAccountNumber || "N/A";
    }

    // Account type (hard-coded since API doesn't send type)
    const accountTypeEl = document.getElementById("accountType");
    if (accountTypeEl) {
      accountTypeEl.innerText = "Current & Savings";
    }

    // Status (hard-coded since API doesn't send status)
    const accountStatusEl = document.getElementById("accountStatus");
    if (accountStatusEl) {
      accountStatusEl.innerText = "Active";
    }

  } catch (err) {
    console.error("Error loading account summary:", err);
  }
}

// Dashboard Data Function (for /api/users/dashboard endpoint)
async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token"); 
    const res = await fetch("https://api.pvbonline.online/api/users/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load dashboard details");
    const data = await res.json();

    // Welcome text (if different element)
    const welcomeEl = document.getElementById("welcomeText");
    if (welcomeEl && !welcomeEl.textContent.includes("Welcome Back")) {
      welcomeEl.innerText = `Welcome Back, ${data.fullname}`;
    }

    // Balance (current + savings)
    const totalBalance = (data.balances?.current || 0) + (data.balances?.savings || 0);
    const balanceEl = document.getElementById("accountBalance");
    if (balanceEl) {
      balanceEl.innerText = `$${totalBalance.toFixed(2)}`;
    }

    // Account number
    const accountNumberEl = document.getElementById("accountNumber");
    if (accountNumberEl && !accountNumberEl.textContent) {
      accountNumberEl.innerText = data.currentAccountNumber || "N/A";
    }

    // Type & Status
    const accountTypeEl = document.getElementById("accountType");
    if (accountTypeEl && !accountTypeEl.textContent) {
      accountTypeEl.innerText = "Current";
    }
    
    const accountStatusEl = document.getElementById("accountStatus");
    if (accountStatusEl && !accountStatusEl.textContent) {
      accountStatusEl.innerText = "Active";
    }

    // Last login details
    const lastLoginIPEl = document.getElementById("lastLoginIP");
    if (lastLoginIPEl) {
      lastLoginIPEl.innerText = data.lastLoginIP || "N/A";
    }

    const lastLoginDateEl = document.getElementById("lastLoginDate");
    if (lastLoginDateEl) {
      lastLoginDateEl.innerText = data.lastLoginDate || "N/A";
    }

  } catch (err) {
    console.error("Dashboard data error:", err);
  }
}

// Load both on DOM ready
document.addEventListener("DOMContentLoaded", loadAccountSummary);
document.addEventListener("DOMContentLoaded", loadDashboardData);

// Modal helper functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

// Open Transfer Modal function
function openTransferModal() {
  // First check if user has PIN set up
  checkPinStatus().then(hasPIN => {
    if (!hasPIN) {
      openModal("createPinModal");
    } else {
      openModal("transferModal");
    }
  });
}

// Check if user has PIN set up
async function checkPinStatus() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://api.pvbonline.online/api/users/check-pin-status", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    return data.hasPinSetup;
  } catch (err) {
    console.error("Error checking PIN status:", err);
    return false;
  }
}

// Global variable for transfer data
let transferData = {};

document.addEventListener("DOMContentLoaded", () => {
  
  // Check for PIN reset token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const pinResetToken = urlParams.get('pinResetToken');
  if (pinResetToken) {
    openModal("resetPinModal");
    // Store token globally for form submission
    window.pinResetToken = pinResetToken;
  }
  
  // Create transfer modal content
  const transferModal = document.getElementById("transferModal");
  if (transferModal) {
    transferModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="fas fa-exchange-alt"></i> Transfer Money</h2>
          <button class="close" onclick="closeModal('transferModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="transferForm">
            <div class="form-group">
              <label for="transferAmount">Transfer Amount ($)</label>
              <input type="number" id="transferAmount" min="1" step="0.01" required>
            </div>
            <div class="form-group">
              <label for="recipientAccountNumber">Recipient Account Number</label>
              <input type="text" id="recipientAccountNumber" required>
            </div>
            <div class="form-group">
              <label for="recipientBank">Recipient Bank</label>
              <input type="text" id="recipientBank" required>
            </div>
            <div class="form-group">
              <label for="recipientCountry">Recipient Country</label>
              <input type="text" id="recipientCountry" required>
            </div>
            <div class="form-group">
              <label for="fromAccountType">Transfer From</label>
              <select id="fromAccountType" required>
                <option value="savings">Savings Account</option>
                <option value="current">Current Account</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeModal('transferModal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Continue</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Create PIN modal content
  const pinModal = document.getElementById("enterPinModal");
  if (pinModal) {
    pinModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Enter Transfer PIN</h2>
          <button class="close" onclick="closeModal('enterPinModal')">&times;</button>
        </div>
        <div class="modal-body">
          <form id="enterPinForm">
            <div class="form-group">
              <label for="transferPin">Enter 4-digit PIN</label>
              <input type="password" id="transferPin" maxlength="4" pattern="[0-9]{4}" required>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-link" onclick="closeModal('enterPinModal'); openModal('forgotPinModal');">Forgot PIN?</button>
              <button type="submit" class="btn btn-primary">Confirm Transfer</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Create "Create PIN" modal
  const createPinModal = document.getElementById("createPinModal");
  if (createPinModal) {
    createPinModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Transfer PIN</h2>
          <button class="close" onclick="closeModal('createPinModal')">&times;</button>
        </div>
        <div class="modal-body">
          <p>You need to set up a 4-digit PIN for secure transfers.</p>
          <form id="createPinForm">
            <div class="form-group">
              <label for="newPin">Enter New PIN</label>
              <input type="password" id="newPin" maxlength="4" pattern="[0-9]{4}" required>
            </div>
            <div class="form-group">
              <label for="confirmNewPin">Confirm PIN</label>
              <input type="password" id="confirmNewPin" maxlength="4" pattern="[0-9]{4}" required>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeModal('createPinModal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Create PIN</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Create "Forgot PIN" modal
  const forgotPinModal = document.getElementById("forgotPinModal");
  if (forgotPinModal) {
    forgotPinModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Reset PIN</h2>
          <button class="close" onclick="closeModal('forgotPinModal')">&times;</button>
        </div>
        <div class="modal-body">
          <p>Click below to receive PIN reset instructions.</p>
          <form id="forgotPinForm">
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeModal('forgotPinModal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Send Reset Instructions</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Create "Reset PIN" modal
  const resetPinModal = document.getElementById("resetPinModal");
  if (resetPinModal) {
    resetPinModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Reset PIN</h2>
          <button class="close" onclick="closeModal('resetPinModal')">&times;</button>
        </div>
        <div class="modal-body">
          <p>Enter your new 4-digit PIN below.</p>
          <form id="resetPinForm">
            <div class="form-group">
              <label for="resetNewPin">Enter New PIN</label>
              <input type="password" id="resetNewPin" maxlength="4" pattern="[0-9]{4}" required>
            </div>
            <div class="form-group">
              <label for="resetConfirmPin">Confirm New PIN</label>
              <input type="password" id="resetConfirmPin" maxlength="4" pattern="[0-9]{4}" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Reset PIN</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // Handle transfer form submission
  const transferForm = document.getElementById("transferForm");
  if (transferForm) {
    transferForm.addEventListener("submit", (e) => {
      e.preventDefault();

      transferData = {
        amount: parseFloat(document.getElementById("transferAmount").value),
        accountNumber: document.getElementById("recipientAccountNumber").value,
        bank: document.getElementById("recipientBank").value,
        country: document.getElementById("recipientCountry").value,
        fromAccountType: document.getElementById("fromAccountType").value,
        toAccountType: "current"
      };

      closeModal("transferModal");
      openModal("enterPinModal");
    });
  }

  // Handle PIN form submission
  const enterPinForm = document.getElementById("enterPinForm");
  if (enterPinForm) {
    enterPinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const pin = document.getElementById("transferPin").value;
      const token = localStorage.getItem("token");

      if (pin.length !== 4) {
        alert("PIN must be 4 digits");
        return;
      }

      try {
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Processing...";

        const res = await fetch("https://api.pvbonline.online/api/transaction/transfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ...transferData, pin })
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          closeModal("enterPinModal");
          // Refresh balances
          if (typeof loadUserDashboard === 'function') {
            loadUserDashboard();
          }
        } else {
          alert(data.message || "Transfer failed. Please try again.");
          if (data.requiresPinSetup) {
            closeModal("enterPinModal");
            openModal("createPinModal");
          }
        }
      } catch (err) {
        console.error("Transfer error:", err);
        alert("Something went wrong. Please try again.");
      } finally {
        const submitButton = document.querySelector('#enterPinForm button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Confirm Transfer";
        }
      }
    });
  }

  // Handle create PIN form submission
  const createPinForm = document.getElementById("createPinForm");
  if (createPinForm) {
    createPinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPin = document.getElementById("newPin").value;
      const confirmPin = document.getElementById("confirmNewPin").value;
      const token = localStorage.getItem("token");

      if (newPin !== confirmPin) {
        alert("PINs do not match");
        return;
      }

      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        alert("PIN must be exactly 4 digits");
        return;
      }

      try {
        const res = await fetch("https://api.pvbonline.online/api/transaction/create-pin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ pin: newPin, confirmPin })
        });

        const data = await res.json();

        if (res.ok) {
          alert("PIN created successfully!");
          closeModal("createPinModal");
          // Now open transfer modal
          openModal("transferModal");
        } else {
          alert(data.message || "Failed to create PIN");
        }
      } catch (err) {
        console.error("Create PIN error:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // Handle forgot PIN form submission
  const forgotPinForm = document.getElementById("forgotPinForm");
  if (forgotPinForm) {
    forgotPinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = localStorage.getItem("token");

      try {
        const res = await fetch("https://api.pvbonline.online/api/transaction/forgot-pin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (res.ok) {
          alert("PIN reset instructions sent to your email!");
          closeModal("forgotPinModal");
        } else {
          alert(data.message || "Failed to send reset instructions");
        }
      } catch (err) {
        console.error("Forgot PIN error:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // Handle reset PIN form submission (from email link)
  const resetPinForm = document.getElementById("resetPinForm");
  if (resetPinForm) {
    resetPinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPin = document.getElementById("resetNewPin").value;
      const confirmPin = document.getElementById("resetConfirmPin").value;
      const token = window.pinResetToken; // Token from URL

      if (!token) {
        alert("Invalid reset link. Please request a new reset email.");
        return;
      }

      if (newPin !== confirmPin) {
        alert("PINs do not match");
        return;
      }

      if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        alert("PIN must be exactly 4 digits");
        return;
      }

      try {
        const res = await fetch("https://api.pvbonline.online/api/transaction/reset-pin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            token, 
            newPin, 
            confirmPin 
          })
        });

        const data = await res.json();

        if (res.ok) {
          alert("PIN reset successfully! You can now use your new PIN for transfers.");
          closeModal("resetPinModal");
          
          // Clear URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          alert(data.message || "Failed to reset PIN");
        }
      } catch (err) {
        console.error("Reset PIN error:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  }
});

async function loadRecentTransactions() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("https://api.pvbonline.online/api/users/transactions", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const transactions = await res.json();
    const listEl = document.getElementById("transactionsList");

    if (!res.ok || !Array.isArray(transactions) || transactions.length === 0) {
      listEl.innerHTML = "<p>No recent transactions found.</p>";
      return;
    }

    listEl.innerHTML = transactions
      .slice(0, 5) // show only latest 5
      .map(tx => {
        const date = new Date(tx.createdAt).toLocaleString();
        const sign = tx.type === "outflow" ? "-" : "+";
        const amountClass = tx.type === "outflow" ? "negative" : "positive";
        const icon = tx.type === "outflow" ? "fa-arrow-up" : "fa-arrow-down";

        return `
          <div class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-icon"><i class="fas ${icon}"></i></div>
              <div class="transaction-details">
                <h4>${tx.description || "Transaction"}</h4>
                <p>${date}</p>
              </div>
            </div>
            <div class="transaction-amount ${amountClass}">
              ${sign}$${tx.amount.toLocaleString()}
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading transactions:", err);
    document.getElementById("transactionsList").innerHTML =
      "<p>Failed to load transactions.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadRecentTransactions);




document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Clear token/session
      localStorage.removeItem("token");

      // Redirect back to login page
      window.location.href = "index.html";
    });
  }
});



// send email
function openContactModal() {
  document.getElementById("contactModal").style.display = "block";
}

function closeContactModal() {
  document.getElementById("contactModal").style.display = "none";
}

// Optional: close when clicking outside the modal
window.addEventListener("click", function (event) {
  const modal = document.getElementById("contactModal");
  if (event.target === modal) {
    closeContactModal();
  }
});


document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const subject = document.getElementById("contactSubject").value;
  const message = document.getElementById("contactMessage").value;

  const adminEmail = "info@pvbonline.online"; // replace with your real admin email

  const mailtoLink = `mailto:${adminEmail}?cc=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;

  window.location.href = mailtoLink;

  alert("Your default email app will open. Please send the message.");
  closeContactModal();
});

// send email end

function setButtonLoading(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
    }
  }
}


// form submition
function openContactSupportModal() {
  document.getElementById("contactSupportModal").style.display = "block";
}

function closeContactSupportModal() {
  document.getElementById("contactSupportModal").style.display = "none";
}
// ----- CONTACT SUPPORT -----
const supportForm = document.getElementById("supportForm");

if (supportForm) {
  supportForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = supportForm.querySelector("button[type='submit']");
    setButtonLoading(button, true);

    const data = {
      name: "Guest User", // optional, since we don’t have auth
      email: document.getElementById("supportEmail").value,
      phone: document.getElementById("supportPhone").value,
      subject: document.getElementById("supportSubject").value,
      message: document.getElementById("supportMessage").value,
    };

    try {
      const res = await fetch("https://api.pvbonline.online/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Message sent successfully! Our team will reach out to you shortly via your mail");
        supportForm.reset();
        closeContactSupportModal();
      } else {
        alert(result.message || "Failed to send message.");
      }
    } catch (err) {
      alert("Error sending message. Please try again.");
    } finally {
      setButtonLoading(button, false);
    }
  });
}

// form submition end



// Show About Modal
function showAboutModal() {
  const modal = document.getElementById("aboutModal");
  if (modal) modal.style.display = "block";
}

// Close About Modal
function closeAboutModal() {
  const modal = document.getElementById("aboutModal");
  if (modal) modal.style.display = "none";
}

// Optional: close when clicking outside modal
window.addEventListener("click", function (event) {
  const modal = document.getElementById("aboutModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
// end about us



// ================= Loan Services Modal =================
function showLoanModal() {
  document.getElementById("loanModal").style.display = "block";
}

function closeLoanModal() {
  document.getElementById("loanModal").style.display = "none";
}

// ================= Personal / Business Section =================
function showPersonalLoan() {
  showLoanModal();
  document.getElementById("personalLoanSection").style.display = "block";
  document.getElementById("businessLoanSection").style.display = "none";
}

function showBusinessLoan() {
  showLoanModal();
  document.getElementById("personalLoanSection").style.display = "none";
  document.getElementById("businessLoanSection").style.display = "block";
}

// ================= Loan Application Modal =================
function showLoanApplication() {
  document.getElementById("loanApplicationModal").style.display = "block";
}

function closeLoanApplication() {
  document.getElementById("loanApplicationModal").style.display = "none";
}

// ================= Close Modals when clicking outside =================
window.addEventListener("click", function (event) {
  const loanModal = document.getElementById("loanModal");
  const loanAppModal = document.getElementById("loanApplicationModal");

  if (event.target === loanModal) closeLoanModal();
  if (event.target === loanAppModal) closeLoanApplication();
});

// ================= Loan Application Form Submit =================
document.getElementById("loanApplicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const loanData = {
    loanType: document.getElementById("loanType").value,
    loanAmount: document.getElementById("loanAmount").value,
    applicantName: document.getElementById("applicantName").value,
    applicantEmail: document.getElementById("applicantEmail").value,
    applicantPhone: document.getElementById("applicantPhone").value,
    annualIncome: document.getElementById("annualIncome").value,
    loanPurpose: document.getElementById("loanPurpose").value,
  };

  try {
    const res = await fetch("https://api.pvbonline.online/api/public/loans/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loanData),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Loan application submitted successfully! Our team will reach out you shortly via your mail");
      document.getElementById("loanApplicationForm").reset();
      closeLoanApplication();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("Loan application error:", err);
    alert("Something went wrong. Please try again later.");
  }
});
// loan end



//  hamburger menu code
const hamburger = document.querySelector('.open-mobilemenu');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
}

hamburger.addEventListener('click', toggleMobileMenu);
mobileOverlay.addEventListener('click', closeMobileMenu);

// Close menu when nav item is clicked
const mobileNavItems = document.querySelectorAll('.mobile-menu .nav-item');
mobileNavItems.forEach(item => {
    item.addEventListener('click', closeMobileMenu);
});

// // end of hamburger menu code


// chart


  // --- Initialize socket ---
  const socket = io("https://api.pvbonline.online", {
    transports: ["websocket"],
    withCredentials: true
  });

  // Unique visitor ID for this session
  const visitorId = "visitor_" + Date.now();

  socket.on("connect", () => {
    socket.emit("joinVisitor", visitorId);
    document.getElementById("chatStatusText").innerText = "Connected";
    document.querySelector(".chat-status-dot").style.background = "green";
  });

  socket.on("disconnect", () => {
    document.getElementById("chatStatusText").innerText = "Disconnected";
    document.querySelector(".chat-status-dot").style.background = "red";
  });

  // Receive message from admin
  socket.on("chatMessage", (data) => {
    appendMessage(
      data.sender === "admin" ? "Support" : "You",
      data.text,
      data.sender
    );
  });

  // --- Open chat modal ---
  function openChatModal() {
    document.getElementById("chatModal").style.display = "block";
  }

  // --- Close chat modal ---
  function closeChatModal() {
    document.getElementById("chatModal").style.display = "none";
  }

  // --- Send message from visitor to admin ---
  function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const msg = input.value.trim();
    if (!msg) return;

    socket.emit("visitorMessage", { visitorId, text: msg });
    appendMessage("You", msg, "visitor");
    input.value = "";
  }

  // --- Press Enter to send ---
  function handleChatKeyPress(e) {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  }

  // --- Append message to chat window ---
  function appendMessage(sender, text, type) {
    const chatBox = document.getElementById("chatMessages");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", type === "admin" ? "agent-message" : "user-message");
    msgDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas ${type === "admin" ? "fa-user-tie" : "fa-user"}"></i>
      </div>
      <div class="message-content">
        <div class="message-header">${sender}</div>
        <div class="message-text">${text}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
// chart end
