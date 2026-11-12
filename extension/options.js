const DEFAULTS={maxSteps:150,remember:true,expand:true};
document.addEventListener("DOMContentLoaded",async()=>{
 const s=await chrome.storage.local.get(DEFAULTS);
 document.getElementById("maxSteps").value=s.maxSteps;
 document.getElementById("remember").checked=s.remember;
 document.getElementById("expand").checked=s.expand;
 document.getElementById("save").addEventListener("click",async()=>{
  const value={maxSteps:Math.min(500,Math.max(1,Number(document.getElementById("maxSteps").value)||150)),
   remember:document.getElementById("remember").checked,expand:document.getElementById("expand").checked};
  await chrome.storage.local.set(value);document.getElementById("status").textContent="Сохранено.";
 });
});