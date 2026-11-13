const DEFAULTS={maxSteps:150,remember:true,expand:true,geminiApiKey:"",geminiModel:"gemini-2.5-flash-lite"};
document.addEventListener("DOMContentLoaded",async()=>{
 const s=await chrome.storage.local.get(DEFAULTS);
 for(const id of ["maxSteps","geminiApiKey","geminiModel"])document.getElementById(id).value=s[id]??DEFAULTS[id];
 for(const id of ["remember","expand"])document.getElementById(id).checked=s[id]!==false;
 document.getElementById("save").addEventListener("click",async()=>{
  const value={maxSteps:Math.min(500,Math.max(1,Number(document.getElementById("maxSteps").value)||150)),remember:document.getElementById("remember").checked,expand:document.getElementById("expand").checked,geminiApiKey:document.getElementById("geminiApiKey").value.trim(),geminiModel:document.getElementById("geminiModel").value};
  await chrome.storage.local.set(value);document.getElementById("status").textContent="Настройки сохранены на этом устройстве.";
 });
});