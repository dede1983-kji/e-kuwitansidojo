const LOGIN_USER = "admin";
const LOGIN_PASS = "bismillah"; // Disesuaikan kembali ke bismillah
const STORAGE = "kjiBuktiBayarV1";
let records = JSON.parse(localStorage.getItem(STORAGE) || "[]");
let currentId = null;

const $ = id => document.getElementById(id);
const rupiah = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);

function pad(n) { return String(n).padStart(2, "0"); }
function today() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function formatDate(v) { if (!v) return "-"; const [y, m, d] = v.split("-"); return `${d}-${m}-${y}`; }

function terbilang(n) {
  n = Math.floor(Number(n) || 0);
  const a = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  if (n < 12) return a[n];
  if (n < 20) return terbilang(n - 10) + " belas";
  if (n < 100) return terbilang(Math.floor(n / 10)) + " puluh" + (n % 10 ? " " + terbilang(n % 10) : "");
  if (n < 200) return "seratus" + (n % 100 ? " " + terbilang(n - 100) : "");
  if (n < 1000) return terbilang(Math.floor(n / 100)) + " ratus" + (n % 100 ? " " + terbilang(n % 100) : "");
  if (n < 2000) return "seribu" + (n % 1000 ? " " + terbilang(n - 1000) : "");
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " ribu" + (n % 1000 ? " " + terbilang(n % 1000) : "");
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " juta" + (n % 1000000 ? " " + terbilang(n % 1000000) : "");
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + " miliar" + (n % 1000000000 ? " " + terbilang(n % 1000000000) : "");
  return String(n);
}

function save() { localStorage.setItem(STORAGE, JSON.stringify(records)); }

function nextReceipt() {
  const year = new Date().getFullYear();
  const nums = records.map(r => parseInt(String(r.no || "").replace(/\D/g, "")) || 0);
  const next = (Math.max(0, ...nums) + 1);
  return `KJI/${year}/${String(next).padStart(4, "0")}`;
}

function getForm() {
  return {
    id: currentId || crypto.randomUUID(),
    no: $("receiptNo").value.trim(),
    date: $("date").value,
    payer: $("payer").value.trim(),
    phone: $("phone").value.trim(),
    description: $("description").value.trim(),
    amount: Number($("amount").value) || 0,
    method: $("method").value,
    notes: $("notes").value.trim()
  };
}

function setForm(r) {
  currentId = r?.id || null;
  $("receiptNo").value = r?.no || nextReceipt();
  $("date").value = r?.date || today();
  $("payer").value = r?.payer || "";
  $("phone").value = r?.phone || "";
  $("description").value = r?.description || "";
  $("amount").value = r?.amount || "";
  $("method").value = r?.method || "Tunai";
  $("notes").value = r?.notes || "";
  updatePreview();
}

function updatePreview() {
  const d = {
    no: $("receiptNo").value,
    date: $("date").value,
    payer: $("payer").value,
    phone: $("phone").value,
    description: $("description").value,
    amount: $("amount").value,
    method: $("method").value,
    notes: $("notes").value
  };
  $("pvNo").textContent = d.no || "-";
  $("pvDate").textContent = formatDate(d.date);
  $("pvPayer").textContent = d.payer || "-";
  $("pvPhone").textContent = d.phone || "-";
  $("pvDescription").textContent = d.description || "-";
  $("pvMethod").textContent = d.method || "-";
  $("pvAmount").textContent = rupiah(d.amount);
  $("pvTerbilang").textContent = "Terbilang: " + (d.amount ? terbilang(d.amount) + " rupiah" : "-");
  $("pvNotes").textContent = d.notes ? ("Catatan: " + d.notes) : "";
}

function renderHistory() {
  const q = $("historySearch").value.toLowerCase();
  const rows = records.filter(r => (r.no + " " + r.payer + " " + r.description).toLowerCase().includes(q))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  $("historyBody").innerHTML = rows.length ? rows.map(r => `<tr>
    <td>${r.no}</td><td>${formatDate(r.date)}</td><td>${r.payer}</td><td>${r.description}</td><td>${rupiah(r.amount)}</td>
    <td><button class="mini" onclick="editRecord('${r.id}')">Edit</button> <button class="mini red" onclick="removeRecord('${r.id}')">Hapus</button></td>
  </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;color:#6b7280">Belum ada data.</td></tr>`;
}

window.editRecord = id => { const r = records.find(x => x.id === id); if (r) { setForm(r); window.scrollTo({ top: 0, behavior: "smooth" }); } };
window.removeRecord = id => { if (confirm("Hapus bukti pembayaran ini?")) { records = records.filter(x => x.id !== id); save(); if (currentId === id) setForm(); renderHistory(); } };

// FUNGSI CETAK PDF
function cetakPDF() {
  alert("Dokumen akan diunduh berupa PDF. Silakan pilih 'Save as PDF / Simpan sebagai PDF' pada tujuan pencetakan.");
  window.print();
}

// --- LOGIN & LOGOUT ---
const loginForm = $("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault(); // Mencegah reload halaman
    
    const user = $("loginUser").value.trim();
    const pass = $("loginPass").value.trim();

    if (user === LOGIN_USER && pass === LOGIN_PASS) {
      localStorage.setItem("kjiLogged", "1");
      $("loginScreen").classList.add("hidden");
      $("app").classList.remove("hidden");
      $("loginError").textContent = "";
    } else {
      $("loginError").textContent = "Username atau password salah.";
    }
  });
}

$("logoutBtn").onclick = () => {
  localStorage.removeItem("kjiLogged");
  location.reload();
};

// --- FORM BUKTI PEMBAYARAN ---
$("paymentForm").addEventListener("submit", e => {
  e.preventDefault();
  const r = getForm();
  const idx = records.findIndex(x => x.id === r.id);
  if (idx >= 0) records[idx] = r;
  else records.push(r);
  save();
  currentId = r.id;
  $("formMessage").textContent = "Data berhasil disimpan.";
  renderHistory();
  updatePreview();
});

$("newBtn").onclick = () => { setForm(); $("formMessage").textContent = ""; };
$("deleteBtn").onclick = () => { if (!currentId) { setForm(); return; } removeRecord(currentId); };
$("pdfBtn").onclick = () => cetakPDF();
$("historySearch").oninput = renderHistory;

["receiptNo", "date", "payer", "phone", "description", "amount", "method", "notes"].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener("input", updatePreview);
});
if ($("date")) $("date").addEventListener("change", updatePreview);

// Cek status login sebelumnya
if (localStorage.getItem("kjiLogged") === "1") {
  $("loginScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
}

setForm();
renderHistory();
