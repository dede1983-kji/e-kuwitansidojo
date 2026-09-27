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
  if(!window.jspdf){alert("Library PDF belum termuat. Pastikan internet aktif saat membuka aplikasi.");return}
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:"mm",format:"a4"});
  const W=210, margin=18;
  const logo=await imageData("logo-dojo.png");
  const stamp=await imageData("stampel-dojo.png");
  doc.setDrawColor(20);doc.setLineWidth(.7);doc.rect(margin,18,W-margin*2,260);
  doc.addImage(logo.data,"PNG",margin+5,23,25,25);
  doc.setFont("helvetica","bold");doc.setFontSize(16);doc.text("KJI DOJO PANGANDARAN",margin+34,29);
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.text("KOPORYU JU-JITSU INDONESIA",margin+34,35);
  doc.setFont("helvetica","bold");doc.setFontSize(13);doc.text("BUKTI PEMBAYARAN",W/2,48,{align:"center"});
  doc.line(margin+5,53,W-margin-5,53);
  doc.setFontSize(9);doc.setFont("helvetica","normal");
  let y=65;
  const line=(label,val)=>{doc.setFont("helvetica","normal");doc.text(label,margin+8,y);doc.setFont("helvetica","bold");doc.text(String(val||"-"),margin+55,y);doc.setFont("helvetica","normal");doc.line(margin+5,y+3,W-margin-5,y+3);y+=12};
  line("No. Bukti",r.no);line("Tanggal",formatDate(r.date));line("Nama Pembayar",r.payer);line("No. HP",r.phone);
  line("Keperluan",r.description);line("Metode Pembayaran",r.method);
  doc.setFont("helvetica","bold");doc.text("TOTAL PEMBAYARAN",margin+8,y);doc.text(rupiah(r.amount),W-margin-8,y,{align:"right"});doc.line(margin+5,y+3,W-margin-5,y+3);y+=17;
  doc.setFont("helvetica","italic");doc.setFontSize(9);doc.text("Terbilang: "+terbilang(r.amount)+" rupiah",margin+8,y);y+=14;
  if(r.notes){doc.setFont("helvetica","normal");doc.text("Catatan: "+r.notes,margin+8,y,{maxWidth:W-margin*2-16});y+=12}
  const sx=135, sy=214;
  doc.setFont("helvetica","normal");doc.setFontSize(9);doc.text("Petugas Keuangan",sx+25,sy,{align:"center"});
  doc.addImage(stamp.data,"png",sx,sy+3,50,53);
  doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text("Gustian Sastriajie Kohar, ST., S.Pd.I",sx+25,sy+61,{align:"center"});
  doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text("Bukti pembayaran ini dibuat sebagai tanda terima yang sah.",W/2,269,{align:"center"});
  doc.save((r.no||"bukti-pembayaran").replace(/[\/\\]/g,"-")+".pdf");
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
