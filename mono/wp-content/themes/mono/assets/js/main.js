// 出現演出（下層ページの .reveal）とスマホのメニュー
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.body.classList.add('is-ready');
const tg=document.querySelector('.hd__toggle'),nv=document.getElementById('hd-nav');
tg.addEventListener('click',()=>{const o=tg.getAttribute('aria-expanded')!=='true';tg.setAttribute('aria-expanded',o);tg.textContent=o?'Close':'Menu';nv.classList.toggle('is-open',o)});

if(document.getElementById('gb')){
// データ量スライダー：料金の数字がその場でカウントする
const gb=document.getElementById('gb'),yen=document.getElementById('yen'),gbv=document.getElementById('gbv'),steps=[...document.querySelectorAll('.steps div')];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const priceOf=g=>g<=1?880:g<=5?1480:g<=10?1980:g<20?1980+Math.ceil((g-10)/2)*70:2680;
let shown=priceOf(+gb.value),raf=0;
function animateTo(t){
  cancelAnimationFrame(raf);
  const from=shown,start=performance.now(),dur=reduce?0:420;
  const step=now=>{const k=dur?Math.min(1,(now-start)/dur):1,e=1-Math.pow(1-k,3);
    shown=Math.round(from+(t-from)*e);yen.textContent=shown.toLocaleString('ja-JP');if(k<1)raf=requestAnimationFrame(step)};
  raf=requestAnimationFrame(step);
}
function update(){
  const g=+gb.value,p=priceOf(g);
  gbv.textContent=g;gb.style.setProperty('--fill',g/30*100+'%');
  gb.setAttribute('aria-valuetext',`${g}GB、月額${p.toLocaleString('ja-JP')}円`);
  const idx=steps.findIndex(s=>g<=+s.dataset.max);steps.forEach((s,i)=>s.classList.toggle('on',i===idx));
  animateTo(p);
}
gb.addEventListener('input',update);update();
}
