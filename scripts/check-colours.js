// check-colours.js — measures the contrast of every visible piece of text against its real background
// (WCAG 2.x: 4.5 for normal text, 3 for large text), on every page type, in the light and dark themes.
// Run after any colour change:  npm run build && npm run check:colours
const fs=require('fs');
const path=require('path');
const p=require('puppeteer-core');
const S='file://'+path.resolve(__dirname,'..','site')+'/';
const CHROME=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/chromium','C:/Program Files/Google/Chrome/Application/chrome.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean).find((x)=>fs.existsSync(x));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const measure=()=>{
  const parse=(c)=>{let m;
    if((m=/^rgba?\(([^)]+)\)/.exec(c))){const v=m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);return [v[0],v[1],v[2],v.length>3?v[3]:1];}
    if((m=/^color\(srgb ([^)]+)\)/.exec(c))){const v=m[1].split(/[\s\/]+/).filter(Boolean).map(Number);return [v[0]*255,v[1]*255,v[2]*255,v.length>3?v[3]:1];}
    return [0,0,0,0];};
  const over=(f,b)=>{const a=f[3];return [f[0]*a+b[0]*(1-a),f[1]*a+b[1]*(1-a),f[2]*a+b[2]*(1-a),1];};
  const lum=(c)=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);};
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
  const bgOf=(el)=>{const stack=[];for(let e=el;e;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c[3]>0){stack.push(c);if(c[3]>=1)break;}}
    let base=[255,255,255,1];const root=parse(getComputedStyle(document.documentElement).backgroundColor);
    if(!stack.length||stack[stack.length-1][3]<1){const b=parse(getComputedStyle(document.body).backgroundColor);base=b[3]>0?over(b,[255,255,255,1]):[255,255,255,1];}
    for(let i=stack.length-1;i>=0;i--)base=over(stack[i],base);return base;};
  const hex=c=>'#'+c.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  const out=new Map();
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  for(let n=walker.nextNode();n;n=walker.nextNode()){
    if(!n.nodeValue.trim())continue;const el=n.parentElement;if(!el)continue;
    if(el.closest('.katex-mathml, script, style, [hidden], .print-only'))continue;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;
    const r=el.getBoundingClientRect();if(r.width===0||r.height===0)continue;
    if(el.closest('details:not([open])')&&!el.closest('summary'))continue;
    const bg=bgOf(el);const fg=over(parse(cs.color),bg);const size=parseFloat(cs.fontSize);const bold=Number(cs.fontWeight)>=700;
    const large=size>=24||(bold&&size>=18.66);const need=large?3:4.5;const cr=ratio(fg,bg);
    const path=[];for(let e=el,i=0;e&&i<3;e=e.parentElement,i++){path.unshift(e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):''));}
    const key=path.join(' > ')+'|'+hex(fg)+'|'+hex(bg);
    if(!out.has(key))out.set(key,{where:path.join(' > '),fg:hex(fg),bg:hex(bg),ratio:Math.round(cr*100)/100,need,size:Math.round(size),sample:n.nodeValue.trim().slice(0,24)});
  }
  return [...out.values()];
};
(async()=>{const b=await p.launch({executablePath:CHROME,args:['--no-sandbox','--allow-file-access-from-files']});
const pg=await b.newPage();await pg.setViewport({width:1440,height:900});
const all=[];
for(const theme of ['light','dark']){
  const run=async(name,url,prep)=>{await pg.goto(S+url+'?theme='+theme);await pg.evaluate(()=>document.fonts.ready);if(prep)await prep();await wait(250);
    const r=await pg.evaluate(measure);for(const x of r)all.push({theme,page:name,...x});};
  await run('index','index.html');
  await run('lesson','lessons/1.01a/index.html',async()=>{await pg.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));});
  await run('lesson+tooltip','lessons/1.01a/index.html',async()=>{await pg.evaluate(()=>document.querySelector('.term').focus());});
  await run('search','index.html',async()=>{await pg.click('[data-open-search]');await pg.type('.search input','عدد');});
  await run('contributors','contributors/index.html');
  await pg.setViewport({width:390,height:844});
  await run('drawer','lessons/1.01a/index.html',async()=>{await pg.click('[data-toggle-nav]');await wait(300);});
  await pg.setViewport({width:1440,height:900});
}
const fails=all.filter(x=>x.ratio<x.need);
const seen=new Set();const uniq=fails.filter(x=>{const k=x.theme+x.where+x.fg+x.bg;if(seen.has(k))return false;seen.add(k);return true;});
console.log('measured',all.length,'distinct text/background pairs;',uniq.length,'below threshold');
for(const x of uniq.sort((a,b)=>a.ratio-b.ratio))console.log(`${x.theme.padEnd(5)} ${String(x.ratio).padStart(5)} (needs ${x.need}) ${x.fg} on ${x.bg} ${x.size}px  ${x.where}   "${x.sample}"`);
const low=all.filter(x=>x.ratio>=x.need&&x.ratio<x.need+0.6);const s2=new Set();
console.log('--- close to the limit');for(const x of low){const k=x.theme+x.fg+x.bg;if(s2.has(k))continue;s2.add(k);console.log(`${x.theme.padEnd(5)} ${String(x.ratio).padStart(5)} ${x.fg} on ${x.bg} ${x.size}px ${x.where.split(' > ').pop()}`);}
await b.close();
process.exit(uniq.length?1:0);})();
