(() => {
  const norm = s => (s || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  const unsub = s => (s || "")
    .replace(/([0-9a-fA-F]+)([₀-₉]+)/g, (m, a, b) => a + "_" + [...b].map(c => c.charCodeAt(0) - 0x2080).join(""))
    .replace(/\(([0-9a-fA-F]+)\)\s*_?\s*(\d{1,2})(?!\d)/g, "$1_$2")
    .replace(/([0-9a-fA-F]+)\((\d{1,2})\)/g, "$1_$2");
  const prep = raw => unsub((raw || "").toLowerCase().replace(/ё/g, "е").replace(/[ \t\u00a0]+/g, " "));
  const LABELS = {
    next: /^(далее|дальше|следующее|следующий|продолжить|продолжение|показать продолжение|читать дальше|вперед|вперед!|начать|начать урок|начать занятие|к заданиям|отлично!?|завершить занятие)$/,
    confirm: /^(ответить|проверить|проверить ответ|отправить ответ|подтвердить|ответ)$/
  };
  const FORBIDDEN = /(выйти|выход|пропустить|завершить|закончить|сдать|отправить работу|назад|профиль|меню|удалить|сбросить|подсказк|показать ответ|показать решение|сдаться)/;
  const ERR = /неверн|неправильн|ответ не принят|попробуй(?:те)? ещ[её] раз|к сожалению|есть ошибки|ответ ошибочный/i;
  const OK = /ответ верный|верно!|правильно!|задание выполнено|сделано!|молодец|все верно|все правильно/i;
  const FINAL = /(урок|занятие|работа|тест|тренажер)\s+(завершен|пройден|окончен)|поздравляем|все задания выполнены|вы выполнили все/i;
  const cleanLabel = s => norm(s).replace(/[→>»….!\s]+$/g, "").replace(/^[«"\s]+|[»"\s]+$/g, "");
  const isErrorText = s => ERR.test(norm(s));
  const isSuccessText = s => OK.test(norm(s));
  const isFinalText = s => FINAL.test(norm(s));
  const isNextLabel = l => LABELS.next.test(cleanLabel(l));
  const isConfirmLabel = l => LABELS.confirm.test(cleanLabel(l));
  const isForbiddenLabel = l => FORBIDDEN.test(norm(l));
  const BASE_PREFIX = { "двоичн": 2, "восьмеричн": 8, "десятичн": 10, "шестнадцатеричн": 16 };
  const baseOf = w => { w = (w || "").replace(/[^а-я]/g, ""); for (const k in BASE_PREFIX) if (w.startsWith(k)) return BASE_PREFIX[k]; return null; };
  const DIG = "[0-9a-f]+";
  const toBase = (digits, from, to) => { const d=digits.toLowerCase(),alpha="0123456789abcdef".slice(0,from); if(!d||[...d].some(c=>!alpha.includes(c)))return null;const n=parseInt(d,from);if(!Number.isSafeInteger(n))return null;return n.toString(to).toUpperCase(); };
  function solveBase(t) {
    const out=[];let m;
    let re=new RegExp(`перевед\\S*\\s+(?:число\\s+)?(${DIG})\\s+из\\s+(\\S+)\\s+(?:систем\\S*\\s+(?:счислени\\S*\\s+)?)?в\\s+(\\S+)`,"g");
    while((m=re.exec(t))){const a=baseOf(m[2]),b=baseOf(m[3]);if(a&&b)out.push(toBase(m[1],a,b));}
    re=new RegExp(`(?:перевед\\S*|запиш\\S*|выраз\\S*|чему равн\\S*|найд\\S*)\\s+(?:число\\s+)?(${DIG})_(\\d{1,2})\\s+(?:в|на)\\s+(\\S+)`,"g");
    while((m=re.exec(t))){const b=baseOf(m[3]),a=+m[2];if(b&&[2,8,10,16].includes(a))out.push(toBase(m[1],a,b));}
    re=new RegExp(`(?:перевед\\S*|запиш\\S*|представьте)\\s+(?:(двоичн\\S*|восьмеричн\\S*|десятичн\\S*|шестнадцатеричн\\S*)\\s+)?число\\s+(${DIG})\\s+в\\s+(\\S+)`,"g");
    while((m=re.exec(t))){const a=m[1]?baseOf(m[1]):10,b=baseOf(m[3]);if(a&&b)out.push(toBase(m[2],a,b));}
    re=new RegExp(`(?:запиш\\S*|представьте)\\s+(\\d+)\\s+в\\s+(\\S+)\\s+систем`,"g");
    while((m=re.exec(t))){const b=baseOf(m[2]);if(b)out.push(toBase(m[1],10,b));}
    return out.filter(x=>x!==null);
  }
  const bitsOfUnit = w => { w=(w||"").replace(/[^а-я]/g,"");if(/^(кбайт|килобайт|кб)/.test(w))return 8*1024;if(/^(мбайт|мегабайт|мб)/.test(w))return 8*1024**2;if(/^(гбайт|гигабайт|гб)/.test(w))return 8*1024**3;if(/^(кбит|килобит)/.test(w))return 1024;if(/^(мбит|мегабит)/.test(w))return 1024**2;if(/^байт/.test(w))return 8;if(/^бит/.test(w))return 1;return null; };
  const fmt = x => {if(!Number.isFinite(x))return null;if(Number.isInteger(x))return String(x);return String(Math.round(x*1e6)/1e6);};
  function solveUnits(t){const out=[],re=/сколько\s+(\S+)\s+(?:содержится\s+|содержат\s+|будет\s+|получится\s+)?в\s+(\d+(?:[.,]\d+)?)\s+(\S+)/g;let m;while((m=re.exec(t))){const to=bitsOfUnit(m[1]),from=bitsOfUnit(m[3]);if(to&&from)out.push(fmt(parseFloat(m[2].replace(",","."))*from/to));}return out.filter(Boolean);}
  function solveVolume(t){if(!/информационн\S*\s+(?:объ[её]м|размер)|объ[её]м\S*\s+(?:сообщени|текст|информаци)|сколько\s+(?:бит|байт|кбайт|килобайт)/.test(t))return[];const sym=[...t.matchAll(/(\d+)\s+символ/g)].map(x=>+x[1]);const k=[...t.matchAll(/(?:кодируется|занимает|использу\S+|выделя\S+|отвод\S+|весит)\s+(?:ровно\s+)?(\d+)\s+(бит\S*|байт\S*)/g)];const wants=[...t.matchAll(/(?:^|\s)в\s+(битах|байтах|кбайт\S*|килобайт\S*|мбайт\S*|мегабайт\S*|бит|байт)(?=[\s?.,:;!]|$)/g)];if(sym.length!==1||k.length!==1||!wants.length)return[];const per=+k[0][1]*bitsOfUnit(k[0][2]),unit=bitsOfUnit(wants[wants.length-1][1]);if(!unit)return[];const r=fmt(sym[0]*per/unit);return r?[r]:[];}
  function solveAlphabet(t){const out=[];if(/сколько\s+символов\s+в\s+двоичн\S*\s+алфавит/.test(t))out.push("2");if(/сколько\s+символов\s+в\s+(?:троичн\S*)\s+алфавит/.test(t))out.push("3");if(/сколько\s+бит\S*[^.?]*(?:одного\s+символа|на\s+(?:один\s+)?символ|каждого\s+символа)/.test(t)){const n=t.match(/(?:алфавит\S*\s+(?:из|мощностью|мощность)\s+|мощност\S+\s+(?:алфавита\s+)?(?:равн\S+\s+)?)(\d+)/);if(n&&+n[1]>=2&&+n[1]<=1e9&&!/сообщени\S*\s+(?:содержит|состоит)/.test(t))out.push(String(Math.ceil(Math.log2(+n[1]))));}if(!/скорост|минут|секунд|в\s+секунду|бит\s*\/\s*с/.test(t)){const m=t.match(/сколько\s+(?:разных\s+|различных\s+)?(?:сообщений|слов|кодовых\s+слов|комбинаций|чисел|значений|символов|вариантов)[^.?]*?можно\s+(?:закодировать|составить|получить|передать|записать)[^.?]*?(\d+)[\s-]*(?:бит|разряд)/);if(m&&+m[1]<=40)out.push(String(2**+m[1]));}return out;}
  function evalExpr(src){const s=src.replace(/[×*·]/g,"*").replace(/[÷:]/g,"/").replace(/(\d),(\d)/g,"$1.$2").replace(/\s+/g,"");if(!/^[0-9+\-*/^().]+$/.test(s)||s.length>80||!/[0-9]/.test(s)||!/[+\-*/^]/.test(s.replace(/^-/,"")))return null;const tok=s.match(/\d+(?:\.\d+)?|[+\-*/^()]/g);if(!tok||tok.join("")!==s)return null;let i=0;const peek=()=>tok[i],eat=()=>tok[i++];function expr(){let v=term();while(peek()==="+"||peek()==="-"){const o=eat(),r=term();v=o==="+"?v+r:v-r;}return v;}function term(){let v=pow();while(peek()==="*"||peek()==="/"){const o=eat(),r=pow();if(o==="/"&&r===0)throw 0;v=o==="*"?v*r:v/r;}return v;}function pow(){const b=unary();if(peek()==="^"){eat();return Math.pow(b,pow());}return b;}function unary(){if(peek()==="-"){eat();return-unary();}if(peek()==="+"){eat();return unary();}return atom();}function atom(){const t0=eat();if(t0==="("){const v=expr();if(eat()!==")")throw 0;return v;}if(t0===undefined||/[^0-9.]/.test(t0))throw 0;return parseFloat(t0);}try{const v=expr();if(i!==tok.length)return null;return Number.isFinite(v)&&Math.abs(v)<1e12?v:null;}catch{return null;}}
  function solveArith(t){const out=[],re=/(?:вычислите|найдите\s+значение\s+выражения|значение\s+выражения|чему\s+равн\S+)\s*:?\s*([0-9+\-*/×÷:^().,·\s]+?)\s*(?:=\s*)?(?:\?|\n|$)/g;let m;while((m=re.exec(t))){const v=evalExpr(m[1]);if(v!==null)out.push(fmt(v));}return out.filter(Boolean);}

  function solveExtra(t){
    const out=[];
    let m;
    m=t.match(/(\d+(?:[.,]\d+)?)\s*%\s*от\s*(\d+(?:[.,]\d+)?)/);
    if(m)out.push(fmt(parseFloat(m[1].replace(",","."))*parseFloat(m[2].replace(",","."))/100));
    m=t.match(/(?:увеличьте|увеличить)\s+(\d+(?:[.,]\d+)?)\s+на\s+(\d+(?:[.,]\d+)?)\s*%/);
    if(m)out.push(fmt(parseFloat(m[1].replace(",","."))*(1+parseFloat(m[2].replace(",","."))/100)));
    m=t.match(/(?:уменьшите|уменьшить)\s+(\d+(?:[.,]\d+)?)\s+на\s+(\d+(?:[.,]\d+)?)\s*%/);
    if(m)out.push(fmt(parseFloat(m[1].replace(",","."))*(1-parseFloat(m[2].replace(",","."))/100)));
    if(/среднее арифметическое/.test(t)){
      m=t.match(/чисел\s*[:：]?\s*([0-9\s,;.+-]+?)(?:\.|$|\n)/);
      if(m){const a=m[1].match(/[+-]?\d+(?:[.,]\d+)?/g)||[];if(a.length>=2&&a.length<=30)out.push(fmt(a.reduce((v,x)=>v+parseFloat(x.replace(",",".")),0)/a.length));}
    }
    m=t.match(/(?:найдите|определите|вычислите)\s+расстояние[^.?]*?скорост\S*\s+(\d+(?:[.,]\d+)?)\s*км\/ч[^.?]*?врем\S*\s+(\d+(?:[.,]\d+)?)\s*ч/);
    if(m)out.push(fmt(parseFloat(m[1].replace(",","."))*parseFloat(m[2].replace(",","."))));
    m=t.match(/(?:найдите|определите|вычислите)\s+площадь\s+квадрат[^.?]*?(?:сторон\S*|стороны)\s*(?:равн\S*|длин\S*)?\s*(\d+(?:[.,]\d+)?)/);
    if(m)out.push(fmt(Math.pow(parseFloat(m[1].replace(",",".")),2)));
    return out.filter(Boolean);
  }


  function baseExprValue(expr){
    const normalized=expr.replace(/[−–]/g,"-").replace(/([0-9a-f]+)[₀-₉]+/gi,(m,a,off,str)=>a+"_"+[...m.slice(a.length)].map(c=>c.charCodeAt(0)-0x2080).join(""));
    const tokens=normalized.match(/[0-9a-f]+_\d+|\d+(?:\.\d+)?|[()+*/×-]/gi);if(!tokens||tokens.join("")!==normalized.replace(/\s/g,""))return null;
    let i=0;const peek=()=>tokens[i],eat=()=>tokens[i++];
    function atom(){const x=eat();if(x==="("){const v=expr0();if(eat()!==")")throw 0;return v;}const m=x&&x.match(/^([0-9a-f]+)_(\d+)$/i);if(m){const b=+m[2];if(b<2||b>16||[...m[1].toLowerCase()].some(c=>parseInt(c,16)>=b))throw 0;return parseInt(m[1],b);}if(x&&/^\d+(?:\.\d+)?$/.test(x))return +x;throw 0;}
    function term(){let v=atom();while(peek()==="*"||peek()==="×"||peek()==="/"){const o=eat(),q=atom();v=o==="/"?(q?v/q:NaN):v*q;}return v;}
    function expr0(){let v=term();while(peek()==="+"||peek()==="-"){const o=eat(),q=term();v=o==="+"?v+q:v-q;}return v;}
    try{const v=expr0();return i===tokens.length&&Number.isFinite(v)?v:null;}catch{return null;}
  }

  function solvePairs(raw){
    const t=prep(raw);
    if(!/соедините кодировк|соотнесите.*кодировк/.test(t))return null;
    return [
      {source:"KOI-8",target:/8-битн\S* кодировк\S* для кириллиц\S*.*стандарт\S*.*unix/i},
      {source:"UTF-8",target:/символ\S* почти всех язык\S* мир/i},
      {source:"ASCII",target:/7-битн\S* кодировк\S*.*латинск\S*.*128 символ/i}
    ];
  }

  function solveStructured(raw){
    const t=prep(raw),out=[];
    if(/даны три арифметическ|вычисли каждое выражение/.test(t)){
      const re=/(?:^|[;\n])\s*([abc])\s*=\s*(.*?)(?=;\s*[abc]\s*=|$)/gi;let m;const vals={};
      while((m=re.exec(t))){const v=baseExprValue(m[2].replace(/=\s*[-+]?\d+\s*$/,"").replace(/[.,;]+$/,""));if(v===null)return null;vals[m[1].toUpperCase()]=fmt(v);}
      if(vals.A&&vals.B&&vals.C){out.push(vals.A,vals.B,vals.C);for(const [a,b] of [["A","B"],["B","C"],["A","C"]])out.push(+vals[a]>+vals[b]?">":+vals[a]<+vals[b]?"<":"=");return out;}
    }
    const p=t.match(/(\d+)\s*\^\s*(\d+)\s*\+\s*(\d+)\s*\^\s*(\d+)\s*[-−]\s*(\d+)/);
    if(p&&/основани\S*\s+3|троичн/.test(t)){
      const e1=+p[1]===9?2*+p[2]:null,e2=+p[4],e3=+p[5]===9?2:null;
      if(e1!==null){const value=3n**BigInt(e1)+3n**BigInt(e2)-3n**BigInt(e3),digits=value.toString(3);out.push(String(e1),String(e2),String(e3),String(e1),String(e2),String(e3),String((digits.match(/2/g)||[]).length));return out;}
    }
    return null;
  }

  function solve(raw){const t=prep(raw),all=[...solveBase(t).map(a=>({a,n:"перевод между системами счисления"})),...solveUnits(t).map(a=>({a,n:"единицы информации"})),...solveVolume(t).map(a=>({a,n:"информационный объём"})),...solveAlphabet(t).map(a=>({a,n:"алфавит/кодирование"})),...solveArith(t).map(a=>({a,n:"арифметика"})),...solveExtra(t).map(a=>({a,n:"проценты, среднее, скорость или геометрия"}))],uniq=[...new Set(all.map(x=>x.a))];if(uniq.length!==1)return null;return{answer:uniq[0],note:`Посчитано кодом (${all[0].n}): ${uniq[0]}`};}
  function optionMatches(label,ans){const l=unsub(norm(label)).replace(/,/g,"."),a=String(ans).toLowerCase(),stripped=l.replace(/\s+/g,"");if(stripped===a)return true;const tokens=l.match(/[0-9a-f]+(?:\.\d+)?(?:_\d+)?/g)||[];if(!tokens.length)return false;const first=tokens[0].replace(/_\d+$/,"");return first===a&&/\d/.test(first);}
  function plan(page){const raw=page.text||"",t=norm(raw),els=(page.elements||[]).filter(e=>!e.disabled),buttons=els.filter(e=>e.tag==="button"||e.role==="button"),inputs=els.filter(e=>["input","textarea"].includes(e.tag)&&!/^(hidden|button|submit|reset|checkbox|radio|file|password|search)$/.test(e.type||"")),radios=els.filter(e=>e.role==="radio"||e.type==="radio"),checkboxes=els.filter(e=>e.role==="checkbox"||e.type==="checkbox"),roleOpts=els.filter(e=>e.role==="option"),labels=els.filter(e=>e.tag==="label");let options=[...radios,...checkboxes,...roleOpts];if(!options.length)options=labels.filter(l=>l.label);const next=buttons.find(e=>isNextLabel(e.label)),confirm=buttons.find(e=>isConfirmLabel(e.label)),prompt=/выберите|укажите|введите|ответьте|решите|найдите|определите|сколько|чему равн|какой вариант|заполните|соотнесите|перетащите|вычислите|переведите|запишите/.test(t),hasQuestionUI=inputs.length||radios.length||checkboxes.length||roleOpts.length;if(isErrorText(raw))return{pause:true,note:"Платформа показала неверный ответ. Останавливаюсь, чтобы не тратить попытки."};
    const forward=buttons.find(e=>/^(вперед!?|продолжение|показать продолжение|читать дальше)$/i.test(cleanLabel(e.label)));
    if(forward&&!hasQuestionUI)return{action:{kind:"click",id:forward.id},note:"Длинный информационный слайд: нажимаю «Продолжение»"};
    const excellent=buttons.find(e=>/^отлично!?$/i.test(cleanLabel(e.label)));
    if(excellent&&(/тебе удалось решить все задания|все задания выполнены|теперь ты можешь/.test(t)))return{action:{kind:"click",id:excellent.id},note:"Этап завершён: нажимаю «Отлично!»"};
    const finish=buttons.find(e=>/^завершить занятие$/i.test(cleanLabel(e.label)));
    if(finish&&inputs.length&&inputs.every(e=>(e.value||"").trim()))return{action:{kind:"click",id:finish.id},note:"Все итоговые поля заполнены: завершаю занятие"};if(isFinalText(raw)&&!hasQuestionUI)return{done:true,note:"Показан финальный экран."};if(isSuccessText(raw)&&next)return{action:{kind:"click",id:next.id},note:"Ответ принят — далее"};if(next&&!hasQuestionUI&&!prompt)return{action:{kind:"click",id:next.id},note:"Информационный слайд — далее"};const filled=inputs.length>0&&inputs.every(e=>(e.value||"").trim()!==""),checked=[...radios,...checkboxes,...roleOpts].some(e=>e.checked),answered=hasQuestionUI&&(inputs.length?filled:true)&&([...radios,...checkboxes,...roleOpts].length?checked||inputs.length>0:true);const sol=hasQuestionUI||options.length?solve(raw):null;let hint=null;if(sol){hint=sol.answer;if(inputs.length===1&&!(radios.length||checkboxes.length)){const inp=inputs[0];if(norm(inp.value)!==norm(sol.answer))return{action:{kind:"type",id:inp.id,value:sol.answer},note:sol.note};if(confirm)return{action:{kind:"click",id:confirm.id},note:"Ответ введён — отправляю"};}else if(!inputs.length){const hits=options.filter(o=>optionMatches(o.label,sol.answer));if(hits.length>=1){const target=hits[0],distinct=new Set(hits.map(h=>norm(h.label)));if(distinct.size===1){const other=options.filter(o=>o.checked&&o!==target&&!hits.includes(o));if(other.length&&checkboxes.length)return{pause:true,note:"Отмечен лишний вариант. Сними отметку вручную."};if(!hits.some(h=>h.checked))return{action:{kind:"click",id:target.id},note:sol.note};if(confirm)return{action:{kind:"click",id:confirm.id},note:"Вариант выбран — отправляю"};if(next)return{action:{kind:"click",id:next.id},note:"Вариант выбран — далее"};}else return{pause:true,note:`Ответ ${sol.answer} подходит сразу нескольким вариантам. Нужна проверка.`};}}}if(answered&&hasQuestionUI){if(confirm)return{action:{kind:"click",id:confirm.id},note:"Ответ внесён — отправляю"};if(next)return{action:{kind:"click",id:next.id},note:"Ответ внесён — далее"};}return hint?{hint}:null;}
  const api={plan,solve,solveStructured,solvePairs,evalExpr,optionMatches,isErrorText,isSuccessText,isFinalText,isConfirmLabel,isNextLabel,isForbiddenLabel};
  globalThis.YSA_RULES=api;if(typeof module!=="undefined")module.exports=api;
})();