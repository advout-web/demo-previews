const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv,.reveal').forEach(el=>io.observe(el));
document.body.classList.add('is-ready');
const tg=document.querySelector('.rail__toggle'),nv=document.getElementById('rail-nav');
tg.addEventListener('click',()=>{const o=tg.getAttribute('aria-expanded')!=='true';tg.setAttribute('aria-expanded',o);tg.textContent=o?'CLOSE':'MENU';nv.classList.toggle('is-open',o)});

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const win=document.querySelector('.win'),g=document.getElementById('g5g'),stage=document.querySelector('.win__stage');
const bigs=[...document.querySelectorAll('.f')];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
function tick(){
  if(!win)return;
  const vh=innerHeight;
  // 5G の文字が窓になって広がる：0→0.75 で拡大、0.7→0.95 で写真全体へ
  const r=win.getBoundingClientRect();
  const p=reduce?1:clamp(-r.top/(r.height-vh));
  const e=p<.75?Math.pow(p/.75,2.4):1;
  g.style.transform=`scale(${1+e*38})`;
  stage.style.setProperty('--full',clamp((p-.7)/.25).toFixed(3));
  if(!reduce)bigs.forEach(f=>{const b=f.getBoundingClientRect();f.style.setProperty('--p',clamp(1-(b.top+b.height/2)/vh,-1,1).toFixed(3))});
}
let raf=0;addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;tick()})},{passive:true});
addEventListener('resize',tick);tick();
