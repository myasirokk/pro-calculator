const SCALE = 1e12;
const clean = n => Math.abs(n) < 1e-14 ? 0 : Math.round((n + Number.EPSILON) * SCALE) / SCALE;

export class MathEngine {
  constructor() { this.angleMode = 'DEG'; }
  setAngleMode(mode) { this.angleMode = mode === 'RAD' ? 'RAD' : 'DEG'; }
  tokenize(input) {
    const s = input.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt');
    const out=[]; let i=0;
    while(i<s.length){
      if(/\s/.test(s[i])){i++;continue;}
      const num=s.slice(i).match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
      if(num){out.push({t:'num',v:Number(num[0])});i+=num[0].length;continue;}
      const id=s.slice(i).match(/^[a-z]+/i);
      if(id){out.push({t:'id',v:id[0].toLowerCase()});i+=id[0].length;continue;}
      if('+-*/^()%!'.includes(s[i])){out.push({t:'op',v:s[i++]});continue;}
      throw new Error(`Geçersiz karakter: ${s[i]}`);
    }
    return out;
  }
  toRpn(tokens){
    const output=[], stack=[], prec={'+':1,'-':1,'*':2,'/':2,'%':2,'^':3,'u-':4,'!':5};
    const right=new Set(['^','u-']); let prev='start';
    for(const token of tokens){
      if(token.t==='num'||(token.t==='id'&&['pi','e','ans'].includes(token.v))){output.push(token);prev='value';continue;}
      if(token.t==='id'){stack.push({t:'fn',v:token.v});prev='fn';continue;}
      if(token.v==='('){stack.push(token);prev='open';continue;}
      if(token.v===')'){
        while(stack.length&&stack.at(-1).v!=='(') output.push(stack.pop());
        if(!stack.length) throw new Error('Parantezler eşleşmiyor'); stack.pop();
        if(stack.at(-1)?.t==='fn') output.push(stack.pop()); prev='value'; continue;
      }
      let op=token.v;
      if(op==='-'&&['start','open','operator','fn'].includes(prev)) op='u-';
      while(stack.length&&prec[stack.at(-1).v]!==undefined&&
        (right.has(op)?prec[op]<prec[stack.at(-1).v]:prec[op]<=prec[stack.at(-1).v])) output.push(stack.pop());
      stack.push({t:'op',v:op}); prev=op==='!'?'value':'operator';
    }
    while(stack.length){if(stack.at(-1).v==='(')throw new Error('Parantezler eşleşmiyor');output.push(stack.pop());}
    return output;
  }
  factorial(n){if(!Number.isInteger(n)||n<0||n>170)throw new Error('Faktöriyel 0–170 arası tamsayı ister');let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
  evaluate(expression, ans=0){
    const st=[]; const angle=x=>this.angleMode==='DEG'?x*Math.PI/180:x;
    for(const x of this.toRpn(this.tokenize(expression))){
      if(x.t==='num')st.push(x.v);
      else if(x.t==='id')st.push(x.v==='pi'?Math.PI:x.v==='e'?Math.E:ans);
      else if(x.t==='fn'){
        if(!st.length)throw new Error('Eksik fonksiyon değeri');const a=st.pop();
        const f={sin:v=>Math.sin(angle(v)),cos:v=>Math.cos(angle(v)),tan:v=>Math.tan(angle(v)),log:Math.log10,ln:Math.log,sqrt:Math.sqrt,abs:Math.abs}[x.v];
        if(!f)throw new Error(`Bilinmeyen fonksiyon: ${x.v}`);st.push(f(a));
      } else if(x.v==='u-') st.push(-st.pop());
      else if(x.v==='!') st.push(this.factorial(st.pop()));
      else {if(st.length<2)throw new Error('Eksik değer');const b=st.pop(),a=st.pop();
        if((x.v==='/'||x.v==='%')&&b===0)throw new Error('Sıfıra bölünemez');
        st.push({'+':()=>clean(a+b),'-':()=>clean(a-b),'*':()=>clean(a*b),'/':()=>clean(a/b),'%':()=>clean(a%b),'^':()=>Math.pow(a,b)}[x.v]());}
    }
    if(st.length!==1||!Number.isFinite(st[0]))throw new Error('Geçersiz veya tanımsız sonuç');return clean(st[0]);
  }
  format(n){return Number(n).toLocaleString('tr-TR',{maximumSignificantDigits:14,useGrouping:false});}
}
