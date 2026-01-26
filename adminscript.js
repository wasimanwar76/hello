/**
 * RTPS MASTER DASHBOARD LOGIC
 * Features: Tab Switching, Dynamic Form Loading, Cascading Dropdowns,
 * Multi-Endpoint Data Fetching, and Cashfree Integration.
 */

// ==========================================
// 1. TAB & NAVIGATION LOGIC
// ==========================================

function showTab(tabName) {
  const applyTab = document.getElementById("tab-apply");
  const recordsTab = document.getElementById("tab-records");
  const navApply = document.getElementById("nav-apply");
  const navRecords = document.getElementById("nav-records");
  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");

  if (tabName === "records") {
    // Toggle Visibility
    applyTab.classList.add("hidden");
    recordsTab.classList.remove("hidden");

    // Highlight Sidebar
    navApply.classList.remove("active");
    navRecords.classList.add("active");

    // Update Header
    title.innerText = "Application Records";
    subtitle.innerText = "Manage and download your digital documents.";

    // Trigger Data Fetch
    fetchRecords();
  } else {
    // Toggle Visibility
    applyTab.classList.remove("hidden");
    recordsTab.classList.add("hidden");

    // Highlight Sidebar
    navApply.classList.add("active");
    navRecords.classList.remove("active");

    // Update Header
    title.innerText = "RTPS Registration";
    subtitle.innerText = '"Connecting citizens to digital governance."';
  }
}

// ==========================================
// 2. DATA FETCHING (RECORDS TABLE)
// ==========================================

async function fetchRecords() {
  const tableBody = document.getElementById("records-table-body");

  // Show Loading State
  tableBody.innerHTML = `<tr><td colspan="4" class="p-20 text-center font-bold text-slate-400">Syncing Database Records...</td></tr>`;

  try {
    const endpoints = ["domicile", "income", "castes"];
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    const fetchPromises = endpoints.map((slug) =>
      fetch(
        `https://backend-5gc912wx6-wasimsonu76-gmailcoms-projects.vercel.app/api/${slug}/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ).then((res) => res.json()),
    );

    const results = await Promise.all(fetchPromises);
    const allData = results.flatMap((res) => res.data || []);

    if (allData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="p-20 text-center text-slate-400">No applications found in your history.</td></tr>`;
      return;
    }

    tableBody.innerHTML = ""; // Clear loader

    allData.forEach((item) => {
      const isSuccess = item.payment_status === "SUCCESS";
      const statusBadge = isSuccess
        ? "bg-emerald-100 text-emerald-600"
        : "bg-amber-100 text-amber-600";

      // Certificate Download Logic
      const certAction =
        isSuccess && item.certificate_url
          ? `<a href="${item.certificate_url}" target="_blank" class="text-indigo-600 font-bold hover:underline flex items-center"><span class="mr-2">📥</span> DOWNLOAD</a>`
          : `<span class="text-slate-300 italic flex items-center"><span class="mr-2">🔒</span> PENDING</span>`;

      const row = `
        <tr class="border-b border-slate-50 hover:bg-slate-50/80 transition-all">
            <td class="p-6">
                <p class="font-bold text-slate-800">${item.name}</p>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">${item.document_type || "Certificate"}</p>
            </td>
            <td class="p-6">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadge}">
                    ${item.payment_status || "PENDING"}
                </span>
            </td>
            <td class="p-6 text-xs font-bold">${certAction}</td>
            <td class="p-6 text-center">
                <button class="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm">
                    <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                </button>
            </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    showToast("Database Connection Error");
    tableBody.innerHTML = `<tr><td colspan="4" class="p-20 text-center text-rose-500 font-bold">Failed to load data from server.</td></tr>`;
  }
}

// ==========================================
// 3. BIHAR LOCALITY & CASTE DATABASE
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

// ==========================================
// 4. FORM FIELD POPULATION & CALCULATION
// ==========================================

function loadDistricts() {
  const distSelect = document.getElementById("district");
  if (!distSelect) return;
  Object.keys(BiharDB)
    .sort()
    .forEach((d) => {
      distSelect.innerHTML += `<option value="${d}">${d}</option>`;
    });
}

function loadCategories() {
  const catSelect = document.getElementById("category");
  if (!catSelect) return;
  Object.keys(CasteDB).forEach((c) => {
    catSelect.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function loadBlocks() {
  const distSelect = document.getElementById("district");
  const block = document.getElementById("block");
  const ps = document.getElementById("police_station");
  block.innerHTML = ps.innerHTML = '<option value="">Select Block</option>';
  if (distSelect.value) {
    BiharDB[distSelect.value].forEach((b) => {
      block.innerHTML += `<option value="${b}">${b}</option>`;
    });
  }
}

function loadPoliceStations() {
  const ps = document.getElementById("police_station");
  const b = document.getElementById("block").value;
  ps.innerHTML = '<option value="">Select Police Station</option>';
  if (b) {
    [`${b} Thana`, `${b} Rural OP`, `${b} Mahila Thana`].forEach((p) => {
      ps.innerHTML += `<option value="${p}">${p}</option>`;
    });
  }
}

function loadCastes() {
  const catSelect = document.getElementById("category");
  const caste = document.getElementById("caste");
  caste.innerHTML = '<option value="">Select Caste</option>';
  if (catSelect.value) {
    CasteDB[catSelect.value].forEach((c) => {
      caste.innerHTML += `<option value="${c}">${c}</option>`;
    });
  }
}

function loadSubCastes() {
  const sc = document.getElementById("sub_caste");
  const c = document.getElementById("caste").value;
  sc.innerHTML = '<option value="">-- No Subcaste --</option>';
  if (c === "Yadav")
    sc.innerHTML =
      '<option value="Ahir">Ahir</option><option value="Gopa">Gopa</option>';
  if (c === "Brahmin")
    sc.innerHTML =
      '<option value="Jha">Jha</option><option value="Mishra">Mishra</option>';
}

function handleTypeChange() {
  const val = document.getElementById("document_type").value;
  document
    .getElementById("incomeSection")
    .classList.toggle("hidden", val !== "income");
  document
    .getElementById("casteSection")
    .classList.toggle("hidden", val !== "caste");
}

function calcIncome() {
  const g = +document.getElementById("inc_govt").value || 0;
  const b = +document.getElementById("inc_biz").value || 0;
  const a = +document.getElementById("inc_agri").value || 0;
  const o = +document.getElementById("inc_other").value || 0;
  document.getElementById("total_annual_income").value = g + b + a + o;
}

// ==========================================
// 5. SUBMISSION & CASHFREE INTEGRATION
// ==========================================

async function submitForm() {
  const btn = document.getElementById("submitBtn");
  const loader = document.getElementById("btnLoader");
  const btnText = document.getElementById("btnText");

  // 1. SELECT RAW ELEMENTS & VALUES
  const docTypeRaw = document.getElementById("document_type").value;
  const nameVal = document.getElementById("name").value.trim();
  const mobileVal = document.getElementById("mobile_number").value.trim();
  const emailVal = document.getElementById("email_id").value.trim();
  const districtVal = document.getElementById("district").value;
  const blockVal = document.getElementById("block").value;
  const photoFile = document.getElementById("applicant_photo").files[0];
  const docFile = document.getElementById("document_file").files[0];

  // 2. VALIDATION
  if (!docTypeRaw) return showToast("Please select Certificate Type");
  if (!nameVal) return showToast("Name is required");
  if (mobileVal.length !== 10) return showToast("Mobile must be 10 digits");
  if (!districtVal || !blockVal)
    return showToast("Locality details are mandatory");
  if (!photoFile || !docFile) return showToast("Required files are missing");

  // 3. CONSTRUCT DATA OBJECT
  const finalJson = {
    document_type:
      docTypeRaw === "domicile"
        ? "Domicile Certificate"
        : docTypeRaw === "income"
          ? "Income Certificate"
          : "Caste Certificate",
    level: document.getElementById("level").value,
    gender: document.getElementById("gender").value,
    name: nameVal,
    father_name: document.getElementById("father_name").value.trim(),
    mother_name: document.getElementById("mother_name").value.trim(),
    husband_name: document.getElementById("husband_name").value.trim() || null,
    mobile_number: mobileVal,
    email_id: emailVal,
    state: "Bihar",
    district: districtVal,
    sub_division: districtVal, // Satisfies the not-null constraint
    block: blockVal,
    local_body: document.getElementById("local_body").value, // 👈 Added this
    ward_no: document.getElementById("ward_no").value.trim() || "N/A",
    town: document.getElementById("town").value.trim(),
    post_office: document.getElementById("post_office").value.trim(),
    police_station: document.getElementById("police_station").value,
    pincode: document.getElementById("pincode").value.trim(),
    residence_type: document.getElementById("residence_type").value,
    aadhar_number:
      document.getElementById("aadhar_number").value.trim() || null,
    purpose_of_application: document.getElementById("purpose").value.trim(),
  };

  // 4. CONDITIONAL FIELDS
  if (docTypeRaw === "income") {
    finalJson.profession = document.getElementById("profession_income").value;
    finalJson.total_annual_income =
      +document.getElementById("total_annual_income").value || 0;
    finalJson.income_govt_service =
      +document.getElementById("inc_govt").value || 0;
    finalJson.income_business = +document.getElementById("inc_biz").value || 0;
    finalJson.income_agriculture =
      +document.getElementById("inc_agri").value || 0;
    finalJson.income_other_sources =
      +document.getElementById("inc_other").value || 0;
  }

  if (docTypeRaw === "caste") {
    finalJson.profession = document.getElementById("profession_caste").value;
    finalJson.category = document.getElementById("category").value;
    finalJson.caste = document.getElementById("caste").value;
    finalJson.sub_caste =
      document.getElementById("sub_caste").value || "General";
  }

  // 5. API CONFIGURATION
  const apiSlug = { domicile: "domicile", castes: "castes", income: "income" };
  const apiUrl = `https://backend-5gc912wx6-wasimsonu76-gmailcoms-projects.vercel.app/api/${apiSlug[docTypeRaw] || docTypeRaw}/create`;

  // 6. UI LOADING STATE
  btn.disabled = true;
  loader.classList.remove("hidden");
  btnText.innerText = "Transmitting...";

  try {
    const formData = new FormData();
    Object.keys(finalJson).forEach((key) => {
      if (finalJson[key] !== null && finalJson[key] !== undefined) {
        formData.append(key, finalJson[key]);
      }
    });
    formData.append("profilePhoto", photoFile);
    formData.append("documentId", docFile);

    const authToken =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const result = await response.json();

    if (result.success) {
      const sessionId =
        result.payment_session_id || result.payment?.payment_session_id;
      if (sessionId) {
        showToast("Opening Secure Payment...", "success");

        // Mode logic: Production for Vercel, Sandbox for local
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
          .then((result) => {
            if (result.error) {
              // This handles cases where the SDK couldn't even start the checkout
              console.error("SDK Error:", result.error);
              showToast(result.error.message, "error");
            }
          });
      } else {
        showToast("Registration Successful!", "success");
        setTimeout(() => location.reload(), 2000);
      }
    } else {
      showToast(result.message || "Submission failed", "error");
    }
  } catch (error) {
    console.error("Submit Error:", error);
    showToast("Network Error: Could not connect to server.");
  } finally {
    btn.disabled = false;
    loader.classList.add("hidden");
    btnText.innerText = "TRANSMIT APPLICATION";
  }
}

// ==========================================
// 6. UTILITIES
// ==========================================

function showToast(msg, type = "error") {
  const container = document.getElementById("toast-container");
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("user-email-display").innerText =
    localStorage.getItem("email") || "Admin";
  loadDistricts();
  loadCategories();
});
