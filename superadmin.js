// 1. PROTECTION & DEVTOOLS
(function () {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.shiftKey && e.key === "J") ||
      (e.ctrlKey && e.shiftKey && e.key === "C") ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      return false;
    }
  });

  const detectDevTools = () => {
    const start = new Date();
    debugger;
    const end = new Date();
    if (end - start > 100) {
      document.body.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;
        font-family:sans-serif;background:#0f172a;color:white;text-align:center">
          <div>
            <h1 style="font-size:32px">⚠ Access Restricted</h1>
            <p>Developer tools are not allowed on this panel.</p>
          </div>
        </div>
      `;
    }
  };
  setInterval(detectDevTools, 1000);
})();

// 1. AUTH & ROLE REDIRECT LOGIC
const token = localStorage.getItem("token");
const email = localStorage.getItem("email");

// Check if a session exists
if (token) {
  // If logged in, determine the correct dashboard based on email
  if (email === "wasimanwar9344@gmail.com") {
    // Prevent redundant redirection if already on the superadmin page
    if (!window.location.pathname.includes("superadmin.html")) {
      window.location.href = "/superadmin.html";
    }
  } else {
    // Redirect regular admins if they try to access non-admin pages
    if (!window.location.pathname.includes("admin.html")) {
      window.location.href = "/admin.html";
    }
  }
} else {
  // If no token exists, force login (except if already on login page)
  if (!window.location.pathname.includes("login.html")) {
    window.location.href = "/login.html";
  }
}

// 2. LOGOUT FUNCTION
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  // Clear any cached application data to ensure privacy
  localStorage.removeItem("CACHED_APPLICATIONS");
  window.location.href = "/login.html";
}

// 3. CORE VARIABLES & UTILS
const API_BASE = "https://backend-5gc912wx6-wasimsonu76-gmailcoms-projects.vercel.app/api";
let applications = [];

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = message;

  let bgClass = "bg-emerald-600";
  if (type === "error") bgClass = "bg-red-600";
  else if (type === "warning") bgClass = "bg-amber-500";

  toast.className = `fixed top-6 right-6 ${bgClass} text-white px-6 py-3 rounded-xl shadow-lg font-bold z-50 transition-all`;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

function maskAadhar(aadhar) {
  if (!aadhar) return "N/A";
  return "XXXX-XXXX-" + aadhar.slice(-4);
}

// 4. MAIN DATA FETCHING
async function loadApplications() {
  const btn = document.getElementById("showDataBtn");
  const btnText = document.getElementById("btnText");
  const loader = document.getElementById("btnLoader");

  btn.disabled = true;
  btnText.innerText = "Loading...";
  loader.classList.remove("hidden");

  const type = document.getElementById("documentType").value;
  const date = document.getElementById("documentDate").value;

  if (!type || !date) {
    alert("Please select Document Type and Date");
    resetButton();
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/view/applications?type=${type}&date=${date}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const result = await res.json();

    if (!result.success) {
      showToast("Failed to fetch data", "error");
      resetButton();
      return;
    }

    applications = result.data || [];

    // Save to storage so it survives a refresh
    localStorage.setItem("CACHED_APPLICATIONS", JSON.stringify(applications));
    localStorage.setItem("CACHED_COUNT", result.count || 0);

    // --- CHECK FOR NO RECORDS FOUND ---
    if (applications.length === 0) {
      showToast("No record found for the selected criteria", "warning");
      document.getElementById("totalCount").innerText = "0";
      document.getElementById("pendingCount").innerText = "0";
      document.getElementById("approvedToday").innerText = "0";
      renderTable([]);
      resetButton();
      return;
    }

    // UPDATE DASHBOARD COUNTS
    document.getElementById("totalCount").innerText =
      result.count || applications.length;
    document.getElementById("pendingCount").innerText = applications.filter(
      (a) => a.documents_status === "PENDING",
    ).length;
    document.getElementById("approvedToday").innerText = applications.filter(
      (a) => a.documents_status === "COMPLETED",
    ).length;

    renderTable(applications);
    showToast("Application data loaded successfully.");
  } catch (err) {
    console.error(err);
    showToast("Server error", "error");
  } finally {
    resetButton();
  }
}

function resetButton() {
  const btn = document.getElementById("showDataBtn");
  const btnText = document.getElementById("btnText");
  const loader = document.getElementById("btnLoader");
  btn.disabled = false;
  btnText.innerText = "Show Data";
  loader.classList.add("hidden");
}

function renderTable(data) {
  const tbody = document.getElementById("recordsBody");
  tbody.innerHTML =
    data.length === 0
      ? `<tr><td colspan="6" class="text-center py-6 text-slate-500">No records found</td></tr>`
      : "";

  data.forEach((app) => {
    const initials = app.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    let statusHTML = "";
    const status = (app.documents_status || "PENDING").toUpperCase();

    if (status === "COMPLETED") {
      statusHTML = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">COMPLETED</span>`;
    } else if (app.receiving_document) {
      statusHTML = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">PARTIAL</span>`;
    } else {
      statusHTML = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">PENDING</span>`;
    }

    tbody.innerHTML += `
      <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
        <td class="px-8 py-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">${initials}</div>
            <div>
              <p class="font-bold text-slate-900 text-sm">${app.name}</p>
              <p class="text-[11px] text-slate-500">${app.email_id}</p>
            </div>
          </div>
        </td>
        <td class="px-8 py-6">
          <p class="text-sm font-semibold text-slate-700">${app.document_type}</p>
          <p class="text-[11px] text-indigo-600 font-medium uppercase tracking-wider">${app.level}</p>
        </td>
        <td class="px-8 py-6">
          <p class="text-sm text-slate-900 font-medium">${app.district}, ${app.state}</p>
          <p class="text-[11px] text-slate-400">${app.block} / ${app.pincode}</p>
        </td>
        <td class="px-8 py-6">
          <span class="font-mono text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200">${maskAadhar(app.aadhar_number)}</span>
        </td>
        <td class="px-8 py-6 text-center">${statusHTML}</td>
        <td class="px-8 py-6 text-center">
          <button onclick="openModal('${app.id}')" class="text-indigo-600 hover:text-indigo-800 font-bold text-sm underline cursor-pointer">View PDF</button>
        </td>
      </tr>`;
  });
}

// 5. MODAL LOGIC & SEQUENTIAL LOCKING
async function openModal(id) {
  const app = applications.find((a) => a.id === id);
  if (!app) return alert("Record not found");

  localStorage.setItem("CURRENT_APPLICATION_ID", id);

  let typeSlug = "domicile";
  const docType = app.document_type.toLowerCase();
  if (docType.includes("caste")) typeSlug = "caste";
  else if (docType.includes("income")) typeSlug = "income";

  try {
    const res = await fetch(
      `${API_BASE}/applications/status/${typeSlug}/${id}`,
    );
    const statusData = await res.json();
    if (statusData.success) {
      const dbData = statusData.current || statusData;
      app.documents_status = dbData.documents_status;
      app.receiving_document = dbData.receiving_document;
      app.certificate_document = dbData.certificate_document;
    }
  } catch (err) {
    console.error("Status fetch failed:", err);
  }
  openModalWithData(app);
}

function openModalWithData(data) {
  if (!data) return;

  // HEADER & GENERAL INFO
  document.getElementById("docType").innerText =
    "Reviewing submission for " + (data.document_type || "-");
  document.getElementById("residenceType").innerText =
    data.residence_type || "-";

  // PERSONAL DETAILS
  document.getElementById("fullName").innerText = data.name || "-";
  document.getElementById("gender").innerText = data.gender || "-";
  document.getElementById("fatherName").innerText = data.father_name || "-";
  document.getElementById("motherName").innerText = data.mother_name || "-";
  document.getElementById("aadhar").innerText = data.aadhar_number
    ? data.aadhar_number.replace(/(\d{4})(?=\d)/g, "$1 ")
    : "-";

  // CONTACT & ADDRESS
  document.getElementById("mobile").innerText = data.mobile_number || "-";
  document.getElementById("email").innerText = data.email_id || "-";
  document.getElementById("purpose").innerText = data.purpose_of_application
    ? `"${data.purpose_of_application}"`
    : "-";
  document.getElementById("state").innerText = data.state || "-";
  document.getElementById("district").innerText = data.district || "-";
  document.getElementById("subDivision").innerText = data.sub_division || "-";
  document.getElementById("block").innerText = data.block || "-";
  document.getElementById("localBody").innerText = data.local_body || "-";
  document.getElementById("ward").innerText = data.ward_no || "-";
  document.getElementById("postOffice").innerText = data.post_office || "-";
  document.getElementById("policeStation").innerText =
    data.police_station || "-";
  document.getElementById("pincode").innerText = data.pincode || "-";

  // LINKS
  document.getElementById("docLink").href = data.document || "#";
  document.getElementById("photoLink").href = data.applicant_photo || "#";

  const docType = (data.document_type || "").toLowerCase().trim();

  // CASTE SECTION
  const casteSection = document.getElementById("castesection");
  if (docType.includes("caste")) {
    casteSection.classList.remove("hidden");
    document.getElementById("profession").innerText = data.profession || "N/A";
    document.getElementById("category").innerText = data.category || "N/A";
    document.getElementById("caste").innerText = data.caste || "N/A";
    document.getElementById("subCaste").innerText = data.sub_caste || "N/A";
  } else {
    casteSection.classList.add("hidden");
  }

  // INCOME SECTION
  const incomeBlock = document.getElementById("incomesection");
  if (docType.includes("income")) {
    incomeBlock.classList.remove("hidden");
    document.getElementById("incomeGovt").innerText =
      "₹" + (data.income_govt_service ?? 0);
    document.getElementById("incomeBusiness").innerText =
      "₹" + (data.income_business ?? 0);
    document.getElementById("incomeAgri").innerText =
      "₹" + (data.income_agriculture ?? 0);
    document.getElementById("incomeOther").innerText =
      "₹" + (data.income_other_sources ?? 0);
    document.getElementById("incomeTotal").innerText =
      "₹" + (data.total_annual_income ?? 0);
  } else {
    incomeBlock.classList.add("hidden");
  }

  // UI CONTROLS & SEQUENTIAL LOCKING
  const statusText = document.getElementById("documents_status_text");
  const statusDot = document.getElementById("documents_status_dot");
  const approveBtn = document.getElementById("approveBtn");
  const recInput = document.getElementById("receivingDoc");
  const certInput = document.getElementById("certificateDoc");
  const recLabel = document.getElementById("receivingName");
  const certLabel = document.getElementById("certificateName");

  if (data.documents_status === "COMPLETED") {
    statusText.innerText = "Completed";
    statusText.className = "text-lg font-bold text-emerald-600";
    statusDot.className = "w-2 h-2 bg-emerald-500 rounded-full";
    recInput.disabled = true;
    certInput.disabled = true;
    recLabel.innerText = "Document Uploaded ✅";
    certLabel.innerText = "Document Uploaded ✅";
    approveBtn.disabled = true;
    approveBtn.innerText = "Application Approved";
    approveBtn.className =
      "w-full bg-slate-400 text-white py-3 rounded-xl font-bold cursor-not-allowed";
  } else {
    statusText.innerText = data.documents_status || "Pending";
    statusText.className = "text-lg font-bold text-red-600";
    statusDot.className = "w-2 h-2 bg-red-500 rounded-full";

    if (!data.receiving_document) {
      recInput.disabled = false;
      certInput.disabled = true;
      recLabel.innerText = "Select Receiving Document";
      certLabel.innerText = "Upload Receiving First";
      approveBtn.disabled = true;
      approveBtn.innerText = "Awaiting Receiving Doc";
      approveBtn.className =
        "w-full bg-slate-300 text-slate-500 py-3 rounded-xl font-bold cursor-not-allowed";
    } else if (!data.certificate_document) {
      recInput.disabled = true;
      recLabel.innerText = "Receiving Uploaded ✅";
      certInput.disabled = false;
      certLabel.innerText = "Select Certificate Document";
      approveBtn.disabled = true;
      approveBtn.innerText = "Awaiting Certificate Doc";
      approveBtn.className =
        "w-full bg-slate-300 text-slate-500 py-3 rounded-xl font-bold cursor-not-allowed";
    } else {
      recInput.disabled = true;
      certInput.disabled = true;
      recLabel.innerText = "Uploaded ✅";
      certLabel.innerText = "Uploaded ✅";
      approveBtn.disabled = false;
      approveBtn.innerText = "Approve Application";
      approveBtn.className =
        "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all";
    }
  }
  toggleModal();
}

// 6. AUTO-UPLOAD & EVENT LISTENERS
// --- NEW UTILITY FOR PERSISTENCE ---
function syncApplicationsToStorage() {
  localStorage.setItem("CACHED_APPLICATIONS", JSON.stringify(applications));
}

document.addEventListener("DOMContentLoaded", function () {
  const receivingInput = document.getElementById("receivingDoc");
  const certificateInput = document.getElementById("certificateDoc");
  const approveBtn = document.getElementById("approveBtn");

  // --- RECOVERY LOGIC ON REFRESH ---
  const cachedData = localStorage.getItem("CACHED_APPLICATIONS");
  if (cachedData) {
    applications = JSON.parse(cachedData);
    renderTable(applications);
    // updateDashboardCounts(); // If you have this function, call it here
  }

  async function handleAutoUpload(file, fieldName) {
    const id = localStorage.getItem("CURRENT_APPLICATION_ID");
    const app = applications.find((a) => a.id === id);
    if (!app) return alert("Application context lost.");

    let type = "domicile";
    const docType = app.document_type.toLowerCase();
    if (docType.includes("caste")) type = "caste";
    else if (docType.includes("income")) type = "income";

    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      showToast(`Uploading ${fieldName.replace("File", "")}...`, "success");
      const res = await fetch(`${API_BASE}/applications/upload/${type}/${id}`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        showToast("Document saved!");

        // Refresh individual status from database
        const statusRes = await fetch(
          `${API_BASE}/applications/status/${type}/${id}`,
        );
        const statusData = await statusRes.json();
        const dbData = statusData.current || statusData;

        // Update local object
        app.documents_status = dbData.documents_status;
        app.receiving_document = dbData.receiving_document;
        app.certificate_document = dbData.certificate_document;

        // --- CRITICAL: SYNC TO STORAGE SO IT SURVIVES REFRESH ---
        syncApplicationsToStorage();

        // Sync main UI
        renderTable(applications);
        openModalWithData(app);

        if (app.documents_status === "COMPLETED") {
          alert("All documents uploaded! Click Approve to finish.");
        }
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("System failed to upload document.");
    }
  }

  receivingInput.addEventListener("change", function () {
    if (this.files[0]) handleAutoUpload(this.files[0], "receivingFile");
  });

  certificateInput.addEventListener("change", function () {
    if (this.files[0]) handleAutoUpload(this.files[0], "certificateFile");
  });

  approveBtn.addEventListener("click", () => {
    if (!approveBtn.disabled) {
      alert("Application successfully approved.");

      // Update local status to reflect approval before refresh
      const id = localStorage.getItem("CURRENT_APPLICATION_ID");
      const app = applications.find((a) => a.id === id);
      if (app) app.documents_status = "COMPLETED";

      syncApplicationsToStorage(); // Save approved state

      toggleModal();
      loadApplications(); // This will fetch fresh data and overwrite cache
    }
  });
});
