async function triggerDownload(url, filename) {
  try {
    // 1. Show loading state on the button
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Downloading...`;

    // 2. Fetch the file as a "Blob" (Binary Large Object)
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network error");
    const blob = await response.blob();

    // 3. Create a temporary link to force download
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename; // This forces the name
    document.body.appendChild(link);
    link.click();

    // 4. Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    btn.innerHTML = originalContent; // Restore button text
  } catch (err) {
    console.error("Download failed:", err);
    // Fallback: If fetch fails (e.g., CORS error), open in new tab
    window.open(url, "_blank");
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  // Pass the ID of your select element
  makeSearchable("casteName");
});

function makeSearchable(selectId) {
  const originalSelect = document.getElementById(selectId);
  if (!originalSelect) return;

  // 1. Create the wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "relative w-full"; // Tailwind relative positioning
  originalSelect.parentNode.insertBefore(wrapper, originalSelect);
  wrapper.appendChild(originalSelect);

  // 2. Create the Search Input (Visual UI)
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = originalSelect.className; // Copy original Tailwind classes
  searchInput.placeholder = "Search Caste / जाति खोजें...";
  searchInput.style.cursor = "text";
  wrapper.appendChild(searchInput);

  // 3. Create the Dropdown List (Hidden by default)
  const dropdown = document.createElement("div");
  dropdown.className =
    "absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl max-h-60 overflow-y-auto hidden";
  wrapper.appendChild(dropdown);

  // 4. Function to populate the list
  function populateList(filterText = "") {
    dropdown.innerHTML = "";
    const options = originalSelect.querySelectorAll("option, optgroup");
    let foundAny = false;

    options.forEach((node) => {
      if (node.tagName === "OPTGROUP") {
        // Handle Categories (General, BC, SC, ST)
        const groupLabel = document.createElement("div");
        groupLabel.className =
          "px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 uppercase tracking-wider sticky top-0";
        groupLabel.innerText = node.label;

        // Only append group label if it has matching children or no filter
        let hasMatchingChild = false;
        Array.from(node.children).forEach((child) => {
          if (child.text.toLowerCase().includes(filterText.toLowerCase()))
            hasMatchingChild = true;
        });

        if (hasMatchingChild || filterText === "") {
          dropdown.appendChild(groupLabel);
        }
      } else if (node.tagName === "OPTION" && node.value !== "") {
        // Handle Individual Options
        if (node.text.toLowerCase().includes(filterText.toLowerCase())) {
          const item = document.createElement("div");
          item.className =
            "px-3 py-2 text-sm text-slate-700 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors";
          item.innerText = node.text;

          item.onclick = () => {
            searchInput.value = node.text; // Update visual input
            originalSelect.value = node.value; // Update HIDDEN Select (Crucial for DB)
            dropdown.classList.add("hidden");
            // Trigger change event for other scripts
            originalSelect.dispatchEvent(new Event("change"));
          };
          dropdown.appendChild(item);
          foundAny = true;
        }
      }
    });

    if (!foundAny) {
      const noResult = document.createElement("div");
      noResult.className = "px-3 py-2 text-sm text-slate-400 italic";
      noResult.innerText = "No results found";
      dropdown.appendChild(noResult);
    }
  }

  // 5. Hide Original Select but keep it in DOM for Form Submission
  originalSelect.classList.add("hidden");

  // 6. Event Listeners
  searchInput.addEventListener("focus", () => {
    populateList(searchInput.value);
    dropdown.classList.remove("hidden");
  });

  searchInput.addEventListener("input", (e) => {
    populateList(e.target.value);
    dropdown.classList.remove("hidden");
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.add("hidden");
      // If user typed something invalid, reset to previously selected value
      const selectedOption =
        originalSelect.options[originalSelect.selectedIndex];
      if (selectedOption && selectedOption.value !== "") {
        searchInput.value = selectedOption.text;
      } else {
        searchInput.value = "";
      }
    }
  });
}

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

  // Better: return null for optional files
  if (!fileInput || fileInput.files.length === 0) return null;

  const file = fileInput.files[0];

  // Clean filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");

  // Strong unique filename
  const fileName = `${folder}/${Date.now()}_${Math.floor(Math.random() * 10000)}_${cleanName}`;

  try {
    if (!supabaseClient) throw new Error("Supabase client not initialized");

    const { error } = await supabaseClient.storage
      .from("documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabaseClient.storage
      .from("documents")
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error(`Upload failed for ${fileInputId}:`, err);
    throw new Error(`Failed to upload ${file.name}`);
  }
}

// --- 7. MAIN SUBMISSION ---
async function validateAndSubmit() {
  if (!supabaseClient) {
    alert("Database not ready. Please refresh the page.");
    return;
  }

  let isValid = true;

  // Basic Fields
  const name = document.getElementById("appName").value.trim();
  const gender = document.getElementById("gender").value;
  const mobile = document.getElementById("mobile").value.trim();
  const docType = document.getElementById("documentType").value;
  const email = document.getElementById("email").value.trim();

  // Validation - Basic Info
  if (name.length < 3) isValid = showError("appName");
  else resetError("appName");
  if (!gender) isValid = showError("gender");
  else resetError("gender");
  if (!docType) isValid = showError("documentType");
  else resetError("documentType");
  if (!/^[0-9]{10}$/.test(mobile)) isValid = showError("mobile");
  else resetError("mobile");

  // Validation - Files (Standard)
  if (!checkFile("fileAadhaarFront")) isValid = false;
  if (!checkFile("fileAadhaarBack")) isValid = false;
  if (!checkFile("fileSignedPhotoStatic")) isValid = false;

  // Validation - Files (Dynamic)
  if (!checkFile("fileParentAadhaar")) isValid = false;
  if (!checkFile("fileOldDomicile")) isValid = false;
  if (!checkFile("fileOldCaste")) isValid = false;
  if (!checkFile("fileOldIncome")) isValid = false;

  // Validation - Income Profession
  if (docType === "income") {
    if (!document.getElementById("incomeProfession").value)
      isValid = showError("incomeProfession");
    else resetError("incomeProfession");
  }

  if (!isValid) {
    const form = document.getElementById("appForm");
    form.classList.add("animate-pulse");
    setTimeout(() => form.classList.remove("animate-pulse"), 500);
    showToast("⚠️ Please fill all required fields.", "error");
    return;
  }

  // --- START PROCESSING ---
  const submitBtn = document.querySelector(
    'button[onclick="validateAndSubmit()"]',
  );
  const originalBtnText = "Submit Application / आवेदन जमा करें";

  // Change button state
  submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Processing...`;
  submitBtn.disabled = true;

  try {
    // 1. फाइलें अपलोड करें (Upload Files)
    const [
      urlAadhaarFront,
      urlAadhaarBack,
      urlPhoto,
      urlParent,
      urlOldDom,
      urlOldCaste,
      urlOldInc,
      urlSignature,
      urlLandRecord,
    ] = await Promise.all([
      uploadToSupabase("fileAadhaarFront", "aadhaar"),
      uploadToSupabase("fileAadhaarBack", "aadhaar"),
      uploadToSupabase("fileSignedPhotoStatic", "photos"),
      uploadToSupabase("fileParentAadhaar", "parents"),
      uploadToSupabase("fileOldDomicile", "old_docs"),
      uploadToSupabase("fileOldCaste", "old_docs"),
      uploadToSupabase("fileOldIncome", "old_docs"),
      uploadToSupabase("fileSignature", "signatures"),
      uploadToSupabase("fileLandRecord", "land_records"),
    ]);

    // 2. डेटा और रेफरल कोड तैयार करें
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref") || "DIRECT";

    const payload = {
      referral_code: referralCode,
      submission_date: new Date().toISOString().split("T")[0],
      applicant_name: name,
      gender: gender,
      mobile: mobile,
      email: email,
      document_type: docType,
      file_aadhaar_front: urlAadhaarFront,
      file_aadhaar_back: urlAadhaarBack,
      file_signed_photo: urlPhoto,
      file_parent_aadhaar: urlParent,
      file_old_domicile: urlOldDom,
      file_old_caste: urlOldCaste,
      file_old_income: urlOldInc,
      signature: urlSignature,
      land_record_document: urlLandRecord,

      caste_profession:
        docType === "caste"
          ? document.getElementById("casteProfession").value
          : "",
      caste_category:
        docType === "caste"
          ? document.getElementById("casteCategory").value
          : "",
      caste_name:
        docType === "caste" ? document.getElementById("casteName").value : "",
      sub_caste:
        docType === "caste" ? document.getElementById("casteSub").value : "",

      income_profession:
        docType === "income"
          ? document.getElementById("incomeProfession").value
          : "",
      income_govt:
        docType === "income"
          ? Number(document.getElementById("incGovt").value) || 0
          : 0,
      income_business:
        docType === "income"
          ? Number(document.getElementById("incBusiness").value) || 0
          : 0,
      income_agri:
        docType === "income"
          ? Number(document.getElementById("incAgri").value) || 0
          : 0,
      income_other:
        docType === "income"
          ? Number(document.getElementById("incOther").value) || 0
          : 0,
      income_total:
        docType === "income"
          ? Number(
              document.getElementById("incTotal").innerText.replace(/,/g, ""),
            ) || 0
          : 0,

      documents_status: "PENDING",
      payment_status: "PENDING",
    };

    // 3. Supabase में डेटा डालें
    const { data, error } = await supabaseClient
      .from("application_entries")
      .insert([payload])
      .select();

    if (error) throw new Error("Database error: " + error.message);

    // 4. पेमेंट गेटवे खोलें
    showToast(
      "Application saved. Opening payment / आवेदन सुरक्षित, भुगतान पोर्टल खुल रहा है...",
      "success",
    );

    const paymentResponse = await fetch(
      "https://paymentconfig.vercel.app/api/payment/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: data[0].id,
          customerPhone: mobile,
          customerName: name,
        }),
      },
    );

    const paymentData = await paymentResponse.json();
    if (!paymentData.success)
      throw new Error("Payment Error: " + paymentData.message);

    // 5. Cashfree पेमेंट शुरू करें
    const cashfree = new window.Cashfree({ mode: "production" });

    cashfree
      .checkout({
        paymentSessionId: paymentData.payment_session_id,
        redirectTarget: "_self",
      })
      .then(async (result) => {
        // 1. Handle Errors
        if (result.error) {
          showToast("Payment failed or cancelled / भुगतान विफल रहा।", "error");
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          return;
        }

        // 2. Handle Success OR Pending
        // We reward the partner if the payment is successful OR waiting for confirmation
        if (result.status === "SUCCESS" || result.status === "PENDING") {
          if (referralCode !== "DIRECT") {
            try {
              await supabaseClient.rpc("increment_partner_stats", {
                row_code: referralCode,
              });
            } catch (rpcErr) {
              console.error("Partner update failed:", rpcErr);
            }
          }

          showToast(
            "Application submitted successfully! / आवेदन सफलतापूर्वक जमा हो गया है।",
            "success",
          );
          setTimeout(() => {
            window.location.href = "https://www.r2ps.in/apply.html";
          }, 2000);
        } else {
          // If the status is "FAILED" or something else
          showToast(
            "Payment was not successful. / भुगतान सफल नहीं हुआ।",
            "error",
          );
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      });
  } catch (err) {
    console.error("❌ Submission Failed:", err);

    // एरर मैसेज हिंदी और इंग्लिश में
    const errorMsg = `❌ Error: ${err.message} / त्रुटि: आवेदन जमा नहीं हो सका। कृपया पुनः प्रयास करें।`;

    if (typeof showToast === "function") {
      showToast(errorMsg, "error");
    } else {
      alert(errorMsg);
    }

    if (submitBtn) {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
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
        // --- COMPLETED: Show TWO buttons (Receipt + Certificate) ---

        // 1. Receipt Button
        let recBtn = "";
        if (app.receiving_document) {
          const recName = `Receipt_${app.id || "Doc"}.pdf`;
          recBtn = `
            <button 
                onclick="triggerDownload('${app.receiving_document}', '${recName}')"
                class="flex items-center justify-center w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-xs sm:text-sm border border-slate-300"
                title="Download Receipt">
                <i class="fas fa-file-invoice mr-2"></i> Receipt
            </button>`;
        } else {
          recBtn = `<button disabled class="w-full bg-slate-50 text-slate-300 font-bold py-3 rounded-xl text-xs sm:text-sm border border-slate-100 cursor-not-allowed">No Receipt</button>`;
        }

        // 2. Certificate Button
        let certBtn = "";
        if (app.certificate_document) {
          const certName = `Certificate_${app.id || "Final"}.pdf`;
          certBtn = `
            <button 
                onclick="triggerDownload('${app.certificate_document}', '${certName}')"
                class="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-xs sm:text-sm shadow-md shadow-emerald-100"
                title="Download Certificate">
                <i class="fas fa-certificate mr-2"></i> Certificate
            </button>`;
        } else {
          certBtn = `<button disabled class="w-full bg-emerald-50 text-emerald-300 font-bold py-3 rounded-xl text-xs sm:text-sm border border-emerald-100 cursor-not-allowed">Generating...</button>`;
        }

        actionButtons = `
            <div class="mt-4 grid grid-cols-2 gap-3">
                ${recBtn}
                ${certBtn}
            </div>
            <p class="text-[10px] text-center text-slate-400 mt-2">
                Click to download your documents / दस्तावेज़ डाउनलोड करने के लिए क्लिक करें
            </p>`;
      } else if (docStatus === "PENDING") {
        // --- PENDING: Show Receipt Only ---
        if (app.receiving_document) {
          const fileName = `Receipt_${app.id || "Doc"}.pdf`;
          actionButtons = `
            <div class="mt-4">
                <button 
                    onclick="triggerDownload('${app.receiving_document}', '${fileName}')" 
                    class="flex items-center justify-center w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl transition text-sm border border-indigo-200 cursor-pointer"
                >
                    <i class="fas fa-download mr-2"></i> Download Receipt / रसीद डाउनलोड करें
                </button>
                <p class="text-[10px] text-center text-slate-400 mt-2">
                    Certificate will come after approval / स्वीकृति के बाद प्रमाण पत्र यहाँ आएगा
                </p>
            </div>`;
        } else {
          actionButtons = `<div class="mt-4 text-center text-xs text-slate-400 italic bg-slate-50 py-3 rounded-xl border border-slate-100">Under Review / समीक्षाधीन</div>`;
        }
      } else if (docStatus === "REJECTED") {
        // --- REJECTED ---
        actionButtons = `<div class="mt-4 text-center text-xs text-rose-600 font-bold bg-rose-50 py-3 rounded-xl border border-rose-100">
            <i class="fas fa-ban mr-1"></i> Rejected / आवेदन अस्वीकृत
        </div>`;
      }

      // --- CARD HTML ---
      html += `
        <div class="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 hover:border-indigo-300 transition group relative overflow-hidden flex flex-col h-full">
            
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

            <div class="border-t border-slate-100 pt-3 mb-auto">
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
