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

// --- 0. INITIALIZATION & CONFIGURATION ---
const SUPABASE_URL = "https://douciplboqmayceruthu.supabase.co";
const SUPABASE_KEY = "sb_publishable_1CKpfNGUpUFQqOeIENMe_A_7Yk84j_z";

// Declare client variable globally
let supabaseClient = null;

// Initialize immediately with safety check
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.error("❌ Critical Error: Supabase library not loaded.");
  alert(
    "System Error: Could not load database library. Please refresh the page.",
  );
}

// --- 1. TOASTER NOTIFICATIONS ---
function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-5 right-5 z-50 flex flex-col gap-3";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  const baseClasses =
    "min-w-[300px] p-4 rounded-lg shadow-2xl text-sm font-medium text-white flex items-center gap-3 transform transition-all duration-300 translate-x-full";
  const typeClasses =
    type === "success"
      ? "bg-green-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-blue-600";
  const icon =
    type === "success"
      ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
      : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

  toast.className = `${baseClasses} ${typeClasses}`;
  toast.innerHTML = `<div class="shrink-0">${icon}</div><div class="flex-1">${message}</div><button onclick="this.parentElement.remove()" class="opacity-70 hover:opacity-100 ml-2">✖</button>`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove("translate-x-full"));
  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- 2. VIEW SWITCHING ---
function switchView(view) {
  const applyView = document.getElementById("view-apply");
  const trackView = document.getElementById("view-track");

  if (view === "apply") {
    applyView.classList.remove("hidden");
    trackView.classList.add("hidden");
    if (window.innerWidth < 768)
      applyView.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    applyView.classList.add("hidden");
    trackView.classList.remove("hidden");
    if (window.innerWidth < 768)
      trackView.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// --- 3. INCOME CALCULATOR ---
function calcTotal() {
  const g = Number(document.getElementById("incGovt").value) || 0;
  const b = Number(document.getElementById("incBusiness").value) || 0;
  const a = Number(document.getElementById("incAgri").value) || 0;
  const o = Number(document.getElementById("incOther").value) || 0;
  document.getElementById("incTotal").innerText = (
    g +
    b +
    a +
    o
  ).toLocaleString();
}

// --- 4. DYNAMIC FIELD LOGIC ---
function handleLogic() {
  const gender = document.getElementById("gender").value;
  const docType = document.getElementById("documentType").value;

  const divParentAadhaar = document.getElementById("divParentAadhaar");
  const divNclDocs = document.getElementById("divNclDocs");
  const divCasteVer = document.getElementById("divCasteVerification");
  const divFinDisc = document.getElementById("divFinancialDisclosure");

  const showParent = docType === "income" && gender === "female";
  const showNcl = docType === "ncl";
  const showCaste = docType === "caste";
  const showIncome = docType === "income";

  // Logic A: Parent Aadhaar
  if (showParent) divParentAadhaar.classList.remove("hidden");
  else {
    divParentAadhaar.classList.add("hidden");
    resetError("fileParentAadhaar");
  }

  // Logic B: NCL Docs
  if (showNcl) divNclDocs.classList.remove("hidden");
  else {
    divNclDocs.classList.add("hidden");
    resetError("fileOldDomicile");
    resetError("fileOldCaste");
    resetError("fileOldIncome");
  }

  // Logic C: Caste
  if (showCaste) divCasteVer.classList.remove("hidden");
  else divCasteVer.classList.add("hidden");

  // Logic D: Income
  if (showIncome) divFinDisc.classList.remove("hidden");
  else {
    divFinDisc.classList.add("hidden");
    resetError("incomeProfession");
  }
}

// --- 5. VALIDATION UTILS ---
function showError(id) {
  const input = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  if (input) input.classList.add("input-error");
  if (err) err.classList.remove("hidden");
  return false;
}

function resetError(id) {
  const input = document.getElementById(id);
  const err = document.getElementById("err-" + id);
  if (input) input.classList.remove("input-error");
  if (err) err.classList.add("hidden");
  return true;
}

function checkFile(id) {
  const fileInput = document.getElementById(id);
  if (fileInput.offsetParent === null) return true; // hidden
  if (fileInput.files.length === 0) return showError(id);
  return resetError(id);
}

// --- 6. FILE UPLOAD HELPER ---
async function uploadToSupabase(fileInputId, folder) {
  const fileInput = document.getElementById(fileInputId);
  // If element doesn't exist or no file selected, return empty string (valid for optional files)
  if (!fileInput || fileInput.files.length === 0) return "";

  const file = fileInput.files[0];
  // Clean filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `${folder}/${Date.now()}_${Math.floor(Math.random() * 1000)}_${cleanName}`;

  try {
    if (!supabaseClient) throw new Error("Supabase client not initialized");

    const { data, error } = await supabaseClient.storage
      .from("documents") // MUST MATCH BUCKET NAME IN SUPABASE
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabaseClient.storage
      .from("documents")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error(`Upload failed for ${fileInputId}:`, err);
    throw new Error(`Failed to upload ${file.name}`);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // 1. Basic Validation
  if (!validateForm()) return;

  try {
    // 2. Show Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> Processing...`;

    // 3. Collect Form Data
    const formData = new FormData();

    // --- Personal ---
    const docType = document.getElementById("documentType").value;
    const mobile = document.getElementById("mobile").value;
    const name = document.getElementById("applicantName").value;
    const email = document.getElementById("email").value;
    const gender = document.getElementById("gender").value;

    formData.append("document_type", docType);
    formData.append("applicant_name", name);
    formData.append("mobile", mobile);
    formData.append("email", email);
    formData.append("gender", gender);

    // --- Files (Upload to Storage & Get URL) ---
    // Helper to upload file and return public URL
    async function uploadFile(fileInputId, path) {
      const input = document.getElementById(fileInputId);
      if (input && input.files.length > 0) {
        const file = input.files[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${mobile}/${path}_${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from("user_uploads")
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("user_uploads")
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      }
      return "";
    }

    // Upload Common Docs
    formData.append(
      "file_aadhaar_front",
      await uploadFile("aadhaarFront", "aadhaar_front"),
    );
    formData.append(
      "file_aadhaar_back",
      await uploadFile("aadhaarBack", "aadhaar_back"),
    );
    formData.append(
      "file_signed_photo",
      await uploadFile("signedPhoto", "signed_photo"),
    );

    // Upload Specific Docs
    if (docType === "income") {
      formData.append(
        "income_profession",
        document.getElementById("incProfession").value,
      );
      formData.append(
        "income_govt",
        document.getElementById("incGovt").value || 0,
      );
      formData.append(
        "income_business",
        document.getElementById("incBusiness").value || 0,
      );
      formData.append(
        "income_agri",
        document.getElementById("incAgri").value || 0,
      );
      formData.append(
        "income_other",
        document.getElementById("incOther").value || 0,
      );
      // Calculate Total
      const total =
        Number(formData.get("income_govt")) +
        Number(formData.get("income_business")) +
        Number(formData.get("income_agri")) +
        Number(formData.get("income_other"));
      formData.append("income_total", total);
    } else if (docType === "caste") {
      formData.append(
        "caste_category",
        document.getElementById("casteCategory").value,
      );
      formData.append("caste_name", document.getElementById("casteName").value);
      formData.append("sub_caste", document.getElementById("subCaste").value);
      formData.append(
        "caste_profession",
        document.getElementById("casteProfession").value,
      );
      formData.append(
        "file_old_caste",
        await uploadFile("oldCaste", "old_caste"),
      );
    } else if (docType === "residence") {
      // Add residence specific logic if you have extra fields
      formData.append(
        "file_old_domicile",
        await uploadFile("oldDomicile", "old_domicile"),
      );
    }

    // 4. Save to Database (Create Order)
    // Convert FormData to JSON object for Supabase
    const dbData = {};
    formData.forEach((value, key) => (dbData[key] = value));

    // Initial Payment Status
    dbData.payment_status = "PENDING";
    dbData.documents_status = "PENDING";
    dbData.payment_amount = "50.00";

    const { data: insertData, error: insertError } = await supabase
      .from("application_entries")
      .insert([dbData])
      .select()
      .single();

    if (insertError) throw insertError;

    // 5. Create Payment Session (Call Your Backend)
    const response = await fetch(
      "https://your-backend-url.onrender.com/create-order",
      {
        // REPLACE WITH YOUR REAL BACKEND URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `ORD_${insertData.id}_${Date.now()}`,
          amount: 50,
          customerId: mobile,
          customerPhone: mobile,
          customerName: name,
        }),
      },
    );

    const paymentData = await response.json();

    if (!paymentData.payment_session_id) {
      throw new Error("Failed to generate payment session");
    }

    // Update DB with Order ID
    await supabase
      .from("application_entries")
      .update({ payment_order_id: paymentData.order_id })
      .eq("id", insertData.id);

    // 6. 🚀 Trigger Cashfree Checkout (FIXED LINE BELOW)
    const cashfree = new window.Cashfree({ mode: "production" });

    cashfree.checkout({
      paymentSessionId: paymentData.payment_session_id,
      redirectTarget: "_self",
    });
  } catch (err) {
    console.error("❌ Submission Failed:", err);
    alert(`Error: ${err.message}`);

    // Reset Button
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
}
// --- 8. TRACKING LOGIC ---
async function performTracking() {
  const mobile = document.getElementById("trackMobile").value.trim();
  const btn = document.getElementById("btn-track");
  const resDiv = document.getElementById("trackResult");
  const errMobile = document.getElementById("err-trackMobile");

  // 1. Validation
  if (!/^[0-9]{10}$/.test(mobile)) {
    errMobile.classList.remove("hidden");
    return;
  } else {
    errMobile.classList.add("hidden");
  }

  // 2. Show Loading State
  btn.disabled = true;
  const originalBtnText = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> Searching / खोज रहा है...`;

  resDiv.classList.remove("hidden");
  resDiv.innerHTML = `
    <div class="text-center text-slate-500 py-8">
        <div class="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <br><span class="font-medium animate-pulse">Fetching records / रिकॉर्ड खोज रहा है...</span>
    </div>`;

  try {
    // 3. Fetch from Supabase
    const { data, error } = await supabaseClient
      .from("application_entries")
      .select("*")
      .eq("mobile", mobile)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 4. Handle No Data
    if (!data || data.length === 0) {
      resDiv.innerHTML = `
        <div class="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
            <i class="fas fa-search text-3xl text-red-400 mb-3"></i>
            <p class="text-slate-800 font-bold">No Records Found / कोई रिकॉर्ड नहीं मिला</p>
            <p class="text-xs text-slate-500 mt-1">Check your mobile number / अपना मोबाइल नंबर जांचें</p>
        </div>`;
      return;
    }

    // 5. Build Result Cards
    let html = "";

    data.forEach((app) => {
      // Status Logic
      const docStatus = app.documents_status || "PENDING";
      const isCompleted = docStatus === "COMPLETED" || docStatus === "APPROVED";

      let statusColor = "bg-amber-100 text-amber-700 border-amber-200";
      let statusIcon = "fa-clock";
      let statusLabel = "Processing / प्रक्रिया में";

      if (isCompleted) {
        statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
        statusIcon = "fa-check-circle";
        statusLabel = "Approved / स्वीकृत";
      } else if (docStatus === "REJECTED") {
        statusColor = "bg-rose-100 text-rose-700 border-rose-200";
        statusIcon = "fa-times-circle";
        statusLabel = "Rejected / अस्वीकृत";
      }

      // --- BUTTONS LOGIC ---
      let actionButtons = "";

      if (isCompleted) {
        // Show TWO buttons (Receipt + Certificate)
        const recBtn = app.receiving_document
          ? `<a href="${app.receiving_document}" target="_blank" class="flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-sm border border-slate-300">
                     <i class="fas fa-file-invoice mr-2"></i> Receipt / रसीद
                   </a>`
          : `<button disabled class="w-full bg-slate-50 text-slate-300 font-bold py-3 rounded-xl text-sm border border-slate-100 cursor-not-allowed">No Receipt</button>`;

        const certBtn = app.certificate_document
          ? `<a href="${app.certificate_document}" target="_blank" class="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md shadow-emerald-100">
                     <i class="fas fa-certificate mr-2"></i> Certificate / प्रमाण पत्र
                   </a>`
          : `<button disabled class="w-full bg-emerald-50 text-emerald-300 font-bold py-3 rounded-xl text-sm border border-emerald-100 cursor-not-allowed">Generating...</button>`;

        actionButtons = `
                <div class="mt-4 grid grid-cols-2 gap-3">
                    ${recBtn}
                    ${certBtn}
                </div>`;
      } else if (docStatus === "PENDING") {
        // Just show Receipt if available
        if (app.receiving_document) {
          actionButtons = `
                <div class="mt-4">
                    <a href="${app.receiving_document}" target="_blank" class="flex items-center justify-center w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl transition text-sm border border-indigo-200">
                        <i class="fas fa-file-invoice mr-2"></i> Download Receipt / रसीद डाउनलोड करें
                    </a>
                    <p class="text-[10px] text-center text-slate-400 mt-2">Certificate will come after approval / स्वीकृति के बाद प्रमाण पत्र यहाँ आएगा</p>
                </div>`;
        } else {
          actionButtons = `<div class="mt-4 text-center text-xs text-slate-400 italic bg-slate-50 py-3 rounded-xl border border-slate-100">Under Review / समीक्षाधीन</div>`;
        }
      } else if (docStatus === "REJECTED") {
        actionButtons = `<div class="mt-4 text-center text-xs text-rose-500 font-bold bg-rose-50 py-3 rounded-xl border border-rose-100">Rejected / आवेदन अस्वीकृत</div>`;
      }

      // Card HTML
      html += `
        <div class="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 hover:border-indigo-300 transition group relative overflow-hidden">
            
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">Ref: #${app.id}</span>
                    <h3 class="text-lg font-bold text-slate-900 mt-2 leading-tight">${app.document_type ? app.document_type.toUpperCase() : "SERVICE"}</h3>
                    <p class="text-xs text-slate-500 mt-1">Date / दिनांक: ${new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 rounded-full text-xs font-bold border ${statusColor} flex items-center gap-1">
                        <i class="fas ${statusIcon}"></i> ${statusLabel}
                    </span>
                </div>
            </div>

            <div class="border-t border-slate-100 pt-3">
                 <p class="text-sm text-slate-600"><span class="font-semibold">Name / नाम:</span> ${app.applicant_name}</p>
            </div>

            ${actionButtons}
        </div>`;
    });

    resDiv.innerHTML = html;
  } catch (err) {
    console.error("Tracking Error:", err);
    resDiv.innerHTML = `<div class="text-center text-red-500 py-4">Error fetching data / डेटा लाने में त्रुटि</div>`;
  } finally {
    // Reset Button
    btn.disabled = false;
    btn.innerHTML = originalBtnText;
  }
}

// --- 9. AUTO-SELECT ---
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  if (type && document.getElementById("documentType")) {
    document.getElementById("documentType").value = type;
    handleLogic();
    switchView("apply");
  }
});
