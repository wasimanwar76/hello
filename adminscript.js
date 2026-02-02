// Anti-DevTools Logic
(function () {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" || e.key === "J" || e.key === "C")) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
    }
  });

  const detectDevTools = () => {
    const start = new Date();
    debugger;
    const end = new Date();
    if (end - start > 100) {
      document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#0f172a;color:white;text-align:center"><div><h1 style="font-size:32px">⚠ Access Restricted</h1><p>Developer tools are not allowed on this panel.</p></div></div>`;
    }
  };
  setInterval(detectDevTools, 1000);
})();

/**
 * RTPS MASTER DASHBOARD - CORE LOGIC
 * Includes: Tab Navigation, Bihar Locality DB, Form Validation,
 * Multi-Table Data Fetching, and Cashfree v3 Integration.
 */

// ==========================================
// 1. GLOBAL INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const emailDisp = document.getElementById("user-email-display");
  if (emailDisp) emailDisp.innerText = localStorage.getItem("email") || "Admin";

  // Initialize DB Dropdowns
  loadDistricts();
  loadCategories();

  // Default Tab
  showTab("apply");
});

// ==========================================
// 2. TAB & NAVIGATION LOGIC
// ==========================================
function showTab(tabName) {
  const applyTab = document.getElementById("tab-apply");
  const recordsTab = document.getElementById("tab-records");
  const navApply = document.getElementById("nav-apply");
  const navRecords = document.getElementById("nav-records");
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");

  if (tabName === "records") {
    applyTab?.classList.add("hidden");
    recordsTab?.classList.remove("hidden");
    navApply?.classList.remove("active");
    navRecords?.classList.add("active");
    if (title) title.innerText = "Application Records";
    if (subtitle)
      subtitle.innerText = "Manage and download your digital documents.";
    fetchRecords();
  } else {
    applyTab?.classList.remove("hidden");
    recordsTab?.classList.add("hidden");
    navApply?.classList.add("active");
    navRecords?.classList.remove("active");
    if (title) title.innerText = "RTPS Registration";
    if (subtitle)
      subtitle.innerText = '"Connecting citizens to digital governance."';
  }
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("sidebar-open");
  document
    .getElementById("sidebar-overlay")
    .classList.toggle("sidebar-overlay-active");
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 1024) toggleSidebar();
}

// ==========================================
// 3. BIHAR LOCALITY & CASTE DATABASE (300+ Lines)
// ==========================================
const BiharDB = {
  Araria: ["Araria", "Forbesganj", "Jokihat", "Kursakanta"],
  Arwal: ["Arwal", "Kaler", "Kurtha", "Sonbhadra"],
  Aurangabad: ["Aurangabad", "Daudnagar", "Obra", "Rafiganj"],
  Banka: ["Banka", "Barahat", "Katoria"],
  Begusarai: ["Begusarai", "Barauni", "Matihani"],
  Bhagalpur: ["Bhagalpur", "Colgong", "Nathnagar"],
  Bhojpur: ["Arrah", "Bihiya", "Jagdishpur"],
  Buxar: ["Buxar", "Dumraon", "Itarhi"],
  Darbhanga: ["Darbhanga", "Baheri", "Benipur"],
  Gaya: ["Gaya Sadar", "Bodh Gaya", "Dobhi", "Sherghati"],
  Gopalganj: ["Gopalganj", "Barauli", "Hathua"],
  Jamui: ["Jamui", "Chakai", "Sono"],
  Jehanabad: ["Jehanabad", "Makhdumpur", "Ghosi"],
  Kaimur: ["Bhabua", "Mohania", "Ramgarh"],
  Katihar: ["Katihar", "Barsoi", "Kadwa"],
  Khagaria: ["Khagaria", "Gogri", "Parbatta"],
  Kishanganj: ["Kishanganj", "Bahadurganj", "Thakurganj"],
  Lakhisarai: ["Lakhisarai", "Barahiya", "Surajgarha"],
  Madhepura: ["Madhepura", "Murliganj", "Singheshwar"],
  Madhubani: ["Madhubani", "Benipatti", "Jhanjharpur"],
  Munger: ["Munger", "Jamalpur", "Tarapur"],
  Muzaffarpur: ["Muzaffarpur West", "Muzaffarpur East", "Kanti", "Marwan"],
  Nalanda: ["Biharsharif", "Rajgir", "Hilsa"],
  Nawada: ["Nawada", "Hisua", "Rajauli"],
  Patna: [
    "Danapur",
    "Phulwari Sharif",
    "Patna Sadar",
    "Sampatchak",
    "Barh",
    "Bakhtiyarpur",
  ],
  Purnia: ["Purnia", "Banmankhi", "Dhamdaha"],
  Rohtas: ["Sasaram", "Dehri", "Bikramganj"],
  Saharsa: ["Saharsa", "Simri Bakhtiarpur"],
  Samastipur: ["Samastipur", "Dalsinghsarai", "Rosera"],
  Saran: ["Chhapra", "Marhaura", "Sonpur"],
  Sheikhpura: ["Sheikhpura", "Barbigha"],
  Sheohar: ["Sheohar", "Dumri Katsari"],
  Sitamarhi: ["Sitamarhi", "Belsand", "Pupri"],
  Siwan: ["Siwan", "Maharajganj", "Mairwa"],
  Supaul: ["Supaul", "Birpur", "Nirmali"],
  Vaishali: ["Hajipur", "Mahua", "Lalganj"],
  "West Champaran": ["Bettiah", "Bagaha", "Narkatiaganj"],
  "East Champaran": ["Motihari", "Chakia", "Raxaul"],
};

const CasteDB = {
  "OBC (BC-II)": ["Yadav", "Kushwaha", "Kurmi", "Baniya", "Jat"],
  "EBC (BC-I)": ["Nai", "Kanu", "Teli", "Mallah", "Lohar"],
  "Scheduled Caste (SC)": ["Chamar", "Paswan", "Dhobi", "Pasi"],
  "Scheduled Tribe (ST)": ["Santhal", "Oraon", "Munda"],
  General: ["Brahmin", "Rajput", "Kayastha", "Bhumihar"],
};

function loadDistricts() {
  const distSelect = document.getElementById("district");
  if (!distSelect) return;
  distSelect.innerHTML = '<option value="">Select District</option>';
  Object.keys(BiharDB)
    .sort()
    .forEach((d) => {
      distSelect.innerHTML += `<option value="${d}">${d}</option>`;
    });
}

function loadCategories() {
  const catSelect = document.getElementById("category");
  if (!catSelect) return;
  catSelect.innerHTML = '<option value="">Select Category</option>';
  Object.keys(CasteDB).forEach((c) => {
    catSelect.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function loadBlocks() {
  const distVal = document.getElementById("district")?.value;
  const block = document.getElementById("block");
  if (!block) return;
  block.innerHTML = '<option value="">Select Block</option>';
  if (distVal && BiharDB[distVal]) {
    BiharDB[distVal].forEach((b) => {
      block.innerHTML += `<option value="${b}">${b}</option>`;
    });
  }
}

function loadPoliceStations() {
  const ps = document.getElementById("police_station");
  const b = document.getElementById("block")?.value;
  if (!ps) return;
  ps.innerHTML = '<option value="">Select PS</option>';
  if (b) {
    [`${b} Thana`, `${b} Rural OP`, `${b} Town PS`].forEach((p) => {
      ps.innerHTML += `<option value="${p}">${p}</option>`;
    });
  }
}

function loadCastes() {
  const cat = document.getElementById("category")?.value;
  const caste = document.getElementById("caste");
  if (!caste) return;
  caste.innerHTML = '<option value="">Select Caste</option>';
  if (cat && CasteDB[cat]) {
    CasteDB[cat].forEach((c) => {
      caste.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }
}

function loadSubCastes() {
  const sc = document.getElementById("sub_caste");
  const c = document.getElementById("caste")?.value;
  if (!sc) return;
  sc.innerHTML = '<option value="">-- No Subcaste --</option>';
  if (c === "Yadav")
    sc.innerHTML =
      '<option value="Ahir">Ahir</option><option value="Gopa">Gopa</option>';
  if (c === "Brahmin")
    sc.innerHTML =
      '<option value="Jha">Jha</option><option value="Mishra">Mishra</option>';
}

// ==========================================
// 4. CALCULATION & UI TOGGLES
// ==========================================
function handleTypeChange() {
  const val = document.getElementById("document_type")?.value;
  const incSec = document.getElementById("incomeSection");
  const casSec = document.getElementById("casteSection");
  if (incSec) incSec.classList.toggle("hidden", val !== "income");
  if (casSec) casSec.classList.toggle("hidden", val !== "caste");
}

function calcIncome() {
  const g = +document.getElementById("inc_govt")?.value || 0;
  const b = +document.getElementById("inc_biz")?.value || 0;
  const a = +document.getElementById("inc_agri")?.value || 0;
  const o = +document.getElementById("inc_other")?.value || 0;
  const totalEl = document.getElementById("total_annual_income");
  if (totalEl) totalEl.value = g + b + a + o;
}

// ==========================================
// 5. SUBMISSION & CASHFREE FIX
// ==========================================
async function submitForm() {
  const btn = document.getElementById("submitBtn");
  const loader = document.getElementById("btnLoader");
  const btnText = document.getElementById("btnText");

  const docTypeRaw = document.getElementById("document_type")?.value;
  const nameVal = document.getElementById("name")?.value.trim();
  const mobileVal = document.getElementById("mobile_number")?.value.trim();
  const districtVal = document.getElementById("district")?.value;
  const blockVal = document.getElementById("block")?.value;
  const photoFile = document.getElementById("applicant_photo")?.files[0];
  const docFile = document.getElementById("document_file")?.files[0];

  if (!docTypeRaw) return showToast("Please select Certificate Type");
  if (!nameVal || mobileVal?.length !== 10)
    return showToast("Invalid Name or 10-digit Mobile");
  if (!districtVal || !blockVal) return showToast("Locality missing");
  if (!photoFile || !docFile)
    return showToast("Both Photo and ID Proof required");

  // 1. CONSTRUCT MAIN DATA OBJECT (Common fields for all certificates)
  const finalJson = {
    document_type:
      docTypeRaw === "domicile"
        ? "Domicile Certificate"
        : docTypeRaw === "income"
          ? "Income Certificate"
          : "Caste Certificate",
    level: document.getElementById("level")?.value,
    gender: document.getElementById("gender")?.value,
    name: nameVal,
    father_name: document.getElementById("father_name")?.value.trim(),
    mother_name: document.getElementById("mother_name")?.value.trim(),
    husband_name: document.getElementById("husband_name")?.value.trim() || null,
    mobile_number: mobileVal,
    email_id: document.getElementById("email_id")?.value.trim(),
    state: "Bihar",
    district: districtVal,
    sub_division: districtVal,
    block: blockVal,
    local_body:
      document.getElementById("local_body")?.value || "Gram Panchayat",
    ward_no: document.getElementById("ward_no")?.value.trim() || "N/A",
    town: document.getElementById("town")?.value.trim(),
    post_office: document.getElementById("post_office")?.value.trim(),
    police_station: document.getElementById("police_station")?.value,
    pincode: document.getElementById("pincode")?.value.trim(),
    residence_type: document.getElementById("residence_type")?.value,
    aadhar_number:
      document.getElementById("aadhar_number")?.value.trim() || null,
    purpose_of_application: document.getElementById("purpose")?.value.trim(),
    // REMOVED: caste_serial_number from here to prevent Domicile table errors
  };

  // 2. CONDITIONAL FIELDS (Specific to each certificate type)
  if (docTypeRaw === "income") {
    finalJson.profession =
      document.getElementById("profession_income")?.value || "Farmer";
    finalJson.total_annual_income =
      +document.getElementById("total_annual_income")?.value || 0;
    finalJson.income_govt_service =
      +document.getElementById("inc_govt")?.value || 0;
    finalJson.income_business = +document.getElementById("inc_biz")?.value || 0;
    finalJson.income_agriculture =
      +document.getElementById("inc_agri")?.value || 0;
    finalJson.income_other_sources =
      +document.getElementById("inc_other")?.value || 0;
  } else if (docTypeRaw === "caste") {
    finalJson.profession =
      document.getElementById("profession_caste")?.value || "Student";
    finalJson.category = document.getElementById("category")?.value;
    finalJson.caste = document.getElementById("caste")?.value;
    finalJson.sub_caste =
      document.getElementById("sub_caste")?.value || "General";

    // MOVED HERE: Only sent when the document type is actually "caste"
    finalJson.caste_serial_number =
      document.getElementById("caste_serial")?.value || "";
  }

  // Ensure 'caste' maps to 'castes' if that's your backend route
  const apiSlug = { domicile: "domicile", caste: "castes", income: "income" };
  const apiUrl = `https://backend-5gc912wx6-wasimsonu76-gmailcoms-projects.vercel.app/api/${apiSlug[docTypeRaw] || docTypeRaw}/create`;

  btn.disabled = true;
  loader?.classList.remove("hidden");
  if (btnText) btnText.innerText = "Transmitting...";

  try {
    const formData = new FormData();
    Object.keys(finalJson).forEach((key) => {
      if (finalJson[key] !== null && finalJson[key] !== undefined)
        formData.append(key, finalJson[key]);
    });
    formData.append("profilePhoto", photoFile);
    formData.append("documentId", docFile);

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const result = await response.json();

    if (result.success) {
      // ROBUST CHECK FOR SESSION ID
      const sessionId =
        result.payment_session_id ||
        result.data?.payment_session_id ||
        result.payment?.payment_session_id;

      if (sessionId) {
        const isProduction =
          !window.location.hostname.includes("localhost") &&
          !window.location.hostname.includes("127.0.0.1");
        const cashfree = new window.Cashfree({
          mode: isProduction ? "production" : "sandbox",
        });

        cashfree
          .checkout({
            paymentSessionId: sessionId,
            redirectTarget: "_self",
          })
          .then((cfResult) => {
            if (cfResult.error) showToast(cfResult.error.message, "error");
          });
      } else {
        showToast("Payment session ID not found in server response.", "error");
        console.error("Result missing session ID:", result);
      }
    } else {
      showToast(result.message || "Submission failed", "error");
    }
  } catch (error) {
    showToast("Network Error: Could not connect to server.");
  } finally {
    btn.disabled = false;
    loader?.classList.add("hidden");
    if (btnText) btnText.innerText = "TRANSMIT APPLICATION";
  }
}

// ==========================================
// 6. RECORDS DATA FETCHING
// ==========================================
// Helper Function to force download from URL
async function triggerDownload(url, fileName) {
  if (!url) return;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback to opening in new tab if fetch fails
    window.open(url, "_blank");
  }
}

async function fetchRecords() {
  const tableBody = document.getElementById("records-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="4" class="p-20 text-center font-bold text-slate-400">Syncing Records...</td></tr>`;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://backend-pi-mocha-44.vercel.app/api/records/my-records",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const result = await response.json();
    if (!result.success || !result.data) return;

    tableBody.innerHTML = "";

    result.data.forEach((item) => {
      const isSuccess = item.payment_status === "SUCCESS";
      const statusBadge = isSuccess
        ? "bg-emerald-100 text-emerald-600"
        : "bg-amber-100 text-amber-600";

      // Clean filenames for download
      const safeName = item.name.replace(/\s+/g, "_");
      const certFileName = `Certificate_${safeName}.pdf`;
      const receiptFileName = `Receiving_${safeName}.pdf`;

      // Certificate Column with Automatic Download
      const certAction =
        isSuccess && item.certificate_document
          ? `<button onclick="triggerDownload('${item.certificate_document}', '${certFileName}')" 
                    class="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-2 transition-transform active:scale-95">
                    <span class="text-lg">📥</span> DOWNLOAD
                   </button>`
          : `<span class="text-slate-300 italic flex items-center gap-2">
                    <span class="text-lg">🔒</span> ${isSuccess ? "PROCESSING" : "LOCKED"}
                   </span>`;

      // Receiving Column with Automatic Download
      const receivingAction = item.receiving_url
        ? `<button onclick="triggerDownload('${item.receiving_url}', '${receiptFileName}')" 
                    class="mx-auto flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                   </button>`
        : `<div class="mx-auto w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-200">
                    <span class="text-xs font-bold">N/A</span>
                   </div>`;

      const row = `
                <tr class="border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
                    <td class="p-6">
                        <p class="font-bold text-slate-800">${item.name}</p>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">${item.document_type}</p>
                    </td>
                    <td class="p-6">
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusBadge}">
                            ${item.payment_status}
                        </span>
                    </td>
                    <td class="p-6 text-xs font-bold">${certAction}</td>
                    <td class="p-6 text-center">${receivingAction}</td>
                </tr>
            `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="4" class="p-20 text-center text-rose-500 font-bold">Connection Error.</td></tr>`;
  }
}

// ==========================================
// 7. UTILITIES
// ==========================================
function showToast(msg, type = "error") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "bg-rose-500" : "bg-emerald-500"}`;
  toast.innerHTML = `<span>${type === "error" ? "⚠️" : "✅"}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function logoutUser() {
  localStorage.clear();
  window.location.href = "login.html";
}
