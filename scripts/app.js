import {MathEngine} from './mathEngine.js';import {units,convert} from './converter.js';import {KeySound} from './sound.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const engine=new MathEngine(),sound=new KeySound();let expression='',answer=0,mode='standard';
const display=$('#display'), formula=$('#formula'), historyEl=$('#historyList');
let history=JSON.parse(localStorage.getItem('calc-history')||'[]');
function render(){formula.textContent=expression||'Hazır';display.textContent=expression||'0';}
function add(v){expression+=v;render();}
function calculate(){try{const result=engine.evaluate(expression,answer);answer=result;history.unshift({expression,result,time:Date.now()});history=history.slice(0,50);localStorage.setItem('calc-history',JSON.stringify(history));display.textContent=engine.format(result);formula.textContent=`${expression} =`;expression=String(result);renderHistory();}catch(e){display.textContent='Hata';formula.textContent=e.message;}}
function renderHistory(){historyEl.innerHTML=history.length?'':'<p class="empty">Henüz işlem yok.</p>';history.forEach((h,i)=>{const li=document.createElement('button');li.className='history-item';li.innerHTML=`<span>${h.expression}</span><strong>${engine.format(h.result)}</strong><small>Yüklemek için dokun · Kopyala ⧉</small>`;li.onclick=async e=>{if(e.offsetX>li.clientWidth*.72){await navigator.clipboard?.writeText(String(h.result));}else{expression=h.expression;render();} };historyEl.append(li);});}
function setMode(next){mode=next;$$('.mode-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));$$('.panel').forEach(p=>p.hidden=p.dataset.panel!==mode);if(innerWidth<800)document.body.classList.remove('history-open');}
$$('[data-value]').forEach(b=>b.onclick=()=>{sound.play();add(b.dataset.value)});
$$('[data-action]').forEach(b=>b.onclick=()=>{sound.play();const a=b.dataset.action;if(a==='clear'){expression='';render()}if(a==='back'){expression=expression.slice(0,-1);render()}if(a==='equals')calculate();if(a==='sign'){expression=expression.startsWith('-')?expression.slice(1):'-'+expression;render();}});
$$('.mode-tab').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('#angleBtn').onclick=()=>{engine.setAngleMode(engine.angleMode==='DEG'?'RAD':'DEG');$('#angleBtn').textContent=engine.angleMode;};
$('#themeBtn').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('calc-theme',dark?'dark':'light');};
$('#soundBtn').onclick=()=>{$('#soundBtn').textContent=sound.toggle()?'Ses: Açık':'Ses: Kapalı';};
$('#historyBtn').onclick=()=>document.body.classList.toggle('history-open');$('#closeHistory').onclick=()=>document.body.classList.remove('history-open');
$('#clearHistory').onclick=()=>{history=[];localStorage.removeItem('calc-history');renderHistory();};
function programmer(){let raw=$('#progInput').value.trim(),base=Number($('#progBase').value),n=parseInt(raw||'0',base);if(!Number.isFinite(n))n=0;n=Math.trunc(n);$('#dec').textContent=n.toString(10);$('#hex').textContent=n.toString(16).toUpperCase();$('#oct').textContent=n.toString(8);$('#bin').textContent=n.toString(2);}
$('#progInput').oninput=programmer;$('#progBase').onchange=programmer;$$('[data-bit]').forEach(b=>b.onclick=()=>{let a=parseInt($('#progInput').value||'0',Number($('#progBase').value))||0,v=parseInt($('#operand').value||'0',10)||0;const op=b.dataset.bit,r=op==='AND'?a&v:op==='OR'?a|v:op==='XOR'?a^v:~a;$('#progInput').value=r.toString(Number($('#progBase').value)).toUpperCase();programmer();});
const cat=$('#category'),from=$('#fromUnit'),to=$('#toUnit');Object.entries(units).forEach(([k,u])=>cat.add(new Option(u.label,k)));
function unitOptions(){from.innerHTML=to.innerHTML='';Object.entries(units[cat.value].items).forEach(([k,v])=>{from.add(new Option(v[0],k));to.add(new Option(v[0],k));});to.selectedIndex=1;doConvert();}
function doConvert(){const n=convert($('#fromValue').value,cat.value,from.value,to.value);$('#toValue').value=n===''?'':Number(n.toPrecision(12));}
cat.onchange=unitOptions;from.onchange=to.onchange=$('#fromValue').oninput=doConvert;$('#swapUnits').onclick=()=>{[from.value,to.value]=[to.value,from.value];doConvert();};unitOptions();
addEventListener('keydown',e=>{if(mode!=='standard'||['INPUT','SELECT'].includes(document.activeElement.tagName))return;const map={'Enter':'=','Backspace':'back','Escape':'clear'};if(/[0-9.+\-*/^()%]/.test(e.key)&&e.key.length===1){add(e.key);sound.play();e.preventDefault()}else if(map[e.key]==='='){calculate();e.preventDefault()}else if(map[e.key]==='back'){expression=expression.slice(0,-1);render()}else if(map[e.key]==='clear'){expression='';render();}});
document.documentElement.dataset.theme=localStorage.getItem('calc-theme')||((matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light');$('#soundBtn').textContent=sound.enabled?'Ses: Açık':'Ses: Kapalı';renderHistory();render();programmer();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
