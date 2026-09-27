const LOGIN_USER="admin";
const LOGIN_PASS="bismillah";
const STORAGE="kjiBuktiBayarV1";
let records=JSON.parse(localStorage.getItem(STORAGE)||"[]");
let currentId=null;

const $=id=>document.getElementById(id);
const rupiah=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
function pad(n){return String(n).padStart(2,"0")}
function today(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function formatDate(v){if(!v)return "-";const [y,m,d]=v.split("-");return `${d}-${m}-${y}`}
function terbilang(n){
  n=Math.floor(Number(n)||0);
  const a=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];
  if(n<12)return a[n];
  if(n<20)return terbilang(n-10)+" belas";
  if(n<100)return terbilang(Math.floor(n/10))+" puluh"+(n%10?" "+terbilang(n%10):"");
  if(n<200)return "seratus"+(n%100?" "+terbilang(n-100):"");
  if(n<1000)return terbilang(Math.floor(n/100))+" ratus"+(n%100?" "+terbilang(n%100):"");
  if(n<2000)return "seribu"+(n%1000?" "+terbilang(n-1000):"");
  if(n<1000000)return terbilang(Math.floor(n/1000))+" ribu"+(n%1000?" "+terbilang(n%1000):"");
  if(n<1000000000)return terbilang(Math.floor(n/1000000))+" juta"+(n%1000000?" "+terbilang(n%1000000):"");
  if(n<1000000000000)return terbilang(Math.floor(n/1000000000))+" miliar"+(n%1000000000?" "+terbilang(n%1000000000):"");
  return String(n);
}
function save(){localStorage.setItem(STORAGE,JSON.stringify(records))}
function nextReceipt(){
  const year=new Date().getFullYear();
  const nums=records.map(r=>parseInt(String(r.no||"").replace(/\D/g,""))||0);
  const next=(Math.max(0,...nums)+1);
  return `KJI/${year}/${String(next).padStart(4,"0")}`;
}
function getForm(){
  return {id:currentId||crypto.randomUUID(),no:$("receiptNo").value.trim(),date:$("date").value,payer:$("payer").value.trim(),
    phone:$("phone").value.trim(),description:$("description").value.trim(),amount:Number($("amount").value)||0,
    method:$("method").value,notes:$("notes").value.trim()};
}
function setForm(r){
  currentId=r?.id||null;
  $("receiptNo").value=r?.no||nextReceipt();$("date").value=r?.date||today();$("payer").value=r?.payer||"";
  $("phone").value=r?.phone||"";$("description").value=r?.description||"";$("amount").value=r?.amount||"";
  $("method").value=r?.method||"Tunai";$("notes").value=r?.notes||"";updatePreview();
}
function updatePreview(){
  const d={no:$("receiptNo").value,date:$("date").value,payer:$("payer").value,phone:$("phone").value,
    description:$("description").value,amount:$("amount").value,method:$("method").value,notes:$("notes").value};
  $("pvNo").textContent=d.no||"-";$("pvDate").textContent=formatDate(d.date);$("pvPayer").textContent=d.payer||"-";
  $("pvPhone").textContent=d.phone||"-";$("pvDescription").textContent=d.description||"-";$("pvMethod").textContent=d.method||"-";
  $("pvAmount").textContent=rupiah(d.amount);$("pvTerbilang").textContent="Terbilang: "+(d.amount?terbilang(d.amount)+" rupiah":"-");
  $("pvNotes").textContent=d.notes?("Catatan: "+d.notes):"";
}
function renderHistory(){
  const q=$("historySearch").value.toLowerCase();
  const rows=records.filter(r=>(r.no+" "+r.payer+" "+r.description).toLowerCase().includes(q))
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  $("historyBody").innerHTML=rows.length?rows.map(r=>`<tr>
    <td>${r.no}</td><td>${formatDate(r.date)}</td><td>${r.payer}</td><td>${r.description}</td><td>${rupiah(r.amount)}</td>
    <td><button class="mini" onclick="editRecord('${r.id}')">Edit</button> <button class="mini red" onclick="removeRecord('${r.id}')">Hapus</button></td>
  </tr>`).join(""):`<tr><td colspan="6" style="text-align:center;color:#6b7280">Belum ada data.</td></tr>`;
}
window.editRecord=id=>{const r=records.find(x=>x.id===id);if(r){setForm(r);window.scrollTo({top:0,behavior:"smooth"})}}
window.removeRecord=id=>{if(confirm("Hapus bukti pembayaran ini?")){records=records.filter(x=>x.id!==id);save();if(currentId===id)setForm();renderHistory()}}

async function imageData(url){
  return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>{
    const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext("2d").drawImage(img,0,0);resolve({data:c.toDataURL("image/png"),w:img.naturalWidth,h:img.naturalHeight})
  };img.onerror=reject;img.src=url})
}
async function createPDF(r){
  if(!window.jspdf){
    alert("Library PDF belum termuat. Pastikan internet aktif saat membuka aplikasi.");
    return;
  }

  try {
    const { jsPDF } = window.jspdf;

    // Ukuran A4
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const W = 210;
    const H = 297;

    const margin = 15;
    const contentW = W - (margin * 2);

    // =========================
    // WARNA
    // =========================
    const dark = [17, 24, 39];
    const gray = [107, 114, 128];
    const lightGray = [229, 231, 235];
    const green = [22, 163, 74];

    // =========================
    // LOGO
    // =========================
    const logo = await imageData("logo-dojo.png");
    const stamp = await imageData("stampel-dojo.png");

    // =========================
    // BORDER UTAMA
    // =========================
    doc.setDrawColor(...dark);
    doc.setLineWidth(0.6);
    doc.roundedRect(
      margin,
      15,
      contentW,
      267,
      3,
      3
    );

    // =========================
    // HEADER
    // =========================

    doc.addImage(
      logo.data,
      "PNG",
      margin + 7,
      23,
      27,
      27
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...dark);

    doc.text(
      "KJI DOJO PANGANDARAN",
      margin + 42,
      31
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(
      "KOPORYU JU-JITSU INDONESIA",
      margin + 42,
      38
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);

    doc.text(
      "BUKTI PEMBAYARAN",
      W / 2,
      57,
      { align: "center" }
    );

    // Garis header
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);

    doc.line(
      margin + 7,
      63,
      W - margin - 7,
      63
    );

    // =========================
    // NOMOR BUKTI
    // =========================

    let y = 75;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);

    doc.text(
      "No. Bukti",
      margin + 8,
      y
    );

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);

    doc.text(
      String(r.no || "-"),
      margin + 55,
      y
    );

    y += 14;

    // =========================
    // DATA PEMBAYARAN
    // =========================

    const row = (label, value) => {

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);

      doc.text(
        label,
        margin + 8,
        y
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);

      const textValue = String(value || "-");

      // Supaya keterangan panjang tidak keluar halaman
      doc.text(
        textValue,
        margin + 55,
        y,
        {
          maxWidth: contentW - 70
        }
      );

      doc.setDrawColor(...lightGray);
      doc.setLineWidth(0.3);

      doc.line(
        margin + 7,
        y + 5,
        W - margin - 7,
        y + 5
      );

      y += 15;
    };

    row("Tanggal", formatDate(r.date));
    row("Nama Pembayar", r.payer);
    row("No. HP", r.phone);
    row("Keperluan", r.description);
    row("Metode Pembayaran", r.method);

    // =========================
    // TOTAL PEMBAYARAN
    // =========================

    y += 3;

    doc.setFillColor(245, 247, 250);

    doc.roundedRect(
      margin + 7,
      y - 7,
      contentW - 14,
      20,
      2,
      2,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...dark);

    doc.text(
      "TOTAL PEMBAYARAN",
      margin + 13,
      y + 5
    );

    doc.setFontSize(13);
    doc.setTextColor(...green);

    doc.text(
      rupiah(r.amount),
      W - margin - 13,
      y + 5,
      { align: "right" }
    );

    y += 28;

    // =========================
    // TERBILANG
    // =========================

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...gray);

    doc.text(
      "Terbilang: " +
      terbilang(r.amount) +
      " rupiah",
      margin + 8,
      y,
      {
        maxWidth: contentW - 16
      }
    );

    y += 16;

    // =========================
    // CATATAN
    // =========================

    if(r.notes){

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);

      doc.text(
        "Catatan:",
        margin + 8,
        y
      );

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);

      doc.text(
        r.notes,
        margin + 35,
        y,
        {
          maxWidth: contentW - 45
        }
      );

      y += 15;
    }

    // =========================
    // TANDA TANGAN
    // =========================

    const sx = 130;
    const sy = 220;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);

    doc.text(
      "Petugas Keuangan",
      sx + 25,
      sy,
      { align: "center" }
    );

    // Stempel
    doc.addImage(
      stamp.data,
      "PNG",
      sx,
      sy + 5,
      50,
      50
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.text(
      "Gustian Sastriajie Kohar, ST., S.Pd.I",
      sx + 25,
      sy + 61,
      { align: "center" }
    );

    // =========================
    // FOOTER
    // =========================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...gray);

    doc.text(
      "Bukti pembayaran ini dibuat sebagai tanda terima yang sah.",
      W / 2,
      273,
      { align: "center" }
    );

    // =========================
    // SIMPAN PDF
    // =========================

    const fileName =
      (r.no || "bukti-pembayaran")
      .replace(/[\/\\]/g, "-") +
      ".pdf";

    doc.save(fileName);

  } catch(error){

    console.error(error);

    alert(
      "PDF gagal dibuat. Pastikan folder assets berisi logo-dojo.png dan stampel-dojo.png."
    );
  }
}

$("loginForm").addEventListener("submit",e=>{e.preventDefault();if($("loginUser").value===LOGIN_USER&&$("loginPass").value===LOGIN_PASS){
  localStorage.setItem("kjiLogged","1");$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");
}else $("loginError").textContent="Username atau password salah."});
$("logoutBtn").onclick=()=>{localStorage.removeItem("kjiLogged");location.reload()};
$("paymentForm").addEventListener("submit",e=>{e.preventDefault();const r=getForm();const idx=records.findIndex(x=>x.id===r.id);if(idx>=0)records[idx]=r;else records.push(r);save();currentId=r.id;$("formMessage").textContent="Data berhasil disimpan.";renderHistory();updatePreview()});
$("newBtn").onclick=()=>{setForm();$("formMessage").textContent=""};
$("deleteBtn").onclick=()=>{if(!currentId){setForm();return}removeRecord(currentId)};
$("pdfBtn").onclick=()=>createPDF(getForm());
$("historySearch").oninput=renderHistory;
["receiptNo","date","payer","phone","description","amount","method","notes"].forEach(id=>$(id).addEventListener("input",updatePreview));
$("date").addEventListener("change",updatePreview);

if(localStorage.getItem("kjiLogged")==="1"){$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden")}
setForm();renderHistory();
