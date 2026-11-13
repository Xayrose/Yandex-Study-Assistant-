const DEFAULTS={maxSteps:150,remember:true,expand:true,geminiApiKey:"",geminiModel:"gemini-2.5-flash-lite",groqApiKey:"",groqModel:"openai/gpt-oss-20b",openrouterApiKey:"",openrouterModel:"openrouter/free",cerebrasApiKey:"",cerebrasModel:"gpt-oss-120b",sambanovaApiKey:"",sambanovaModel:"DeepSeek-V3.1"};
document.addEventListener("DOMContentLoaded",async()=>{
 const s=await chrome.storage.local.get(DEFAULTS);
 ["maxSteps","geminiApiKey","geminiModel","groqApiKey","groqModel","openrouterApiKey","openrouterModel","cerebrasApiKey","cerebrasModel","sambanovaApiKey","sambanovaModel"].forEach(id=>{document.getElementById(id).value=s[id]||DEFAULTS[id];});
 ["remember","expand"].forEach(id=>{document.getElementById(id).checked=s[id]!==false;});
 document.getElementById("save").addEventListener("click",async()=>{
  const value={maxSteps:Math.min(500,Math.max(1,Number(document.getElementById("maxSteps").value)||150)),remember:document.getElementById("remember").checked,expand:document.getElementById("expand").checked};
  ["geminiApiKey","geminiModel","groqApiKey","groqModel","openrouterApiKey","openrouterModel","cerebrasApiKey","cerebrasModel"].forEach(id=>{value[id]=document.getElementById(id).value.trim();});
  await chrome.storage.local.set(value);document.getElementById("status").textContent="Настройки сохранены на этом устройстве.";
 });
});