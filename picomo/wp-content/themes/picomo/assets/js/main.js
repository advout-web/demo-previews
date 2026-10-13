// 出現演出
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv,.reveal').forEach(el=>io.observe(el));
document.body.classList.add('is-ready');

// スマホのメニュー
const tg=document.querySelector('.hd__toggle'),nv=document.getElementById('hd-nav');
if(tg){tg.addEventListener('click',()=>{const o=tg.getAttribute('aria-expanded')!=='true';tg.setAttribute('aria-expanded',o);nv.classList.toggle('is-open',o)});nv.addEventListener('click',e=>{if(e.target.closest('a')){tg.setAttribute('aria-expanded','false');nv.classList.remove('is-open')}})}

// プラン診断ガチャ
const PLANS=[
  {c:'#FFD23F',name:'3GB プラン',yen:'¥990',txt:'LINE と調べものが中心なら、これで十分。5分かけ放題つきです。'},
  {c:'#FF4F9A',name:'15GB プラン',yen:'¥1,980',txt:'SNS も写真もほどよく。余ったギガは翌月にくり越せます。'},
  {c:'#7EE1FF',name:'40GB プラン',yen:'¥2,980',txt:'通学中の動画もたっぷり。テザリングも無料で使えます。'},
  {c:'#18C29C',name:'∞ 無制限プラン',yen:'¥3,980',txt:'ゲームも配信も、ギガを気にせず思いきり楽しめます。'}
];
const m=document.getElementById('machine'),lever=document.getElementById('lever'),out=document.getElementById('out'),res=document.getElementById('result');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let turns=0;
if(lever){
const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));
lever.addEventListener('click',async()=>{
  const vals=[...document.querySelectorAll('.chips input:checked')].map(i=>+i.value);
  const idx=vals.length?Math.max(...vals):Math.floor(Math.random()*4);
  const p=PLANS[idx];
  lever.disabled=true;res.classList.remove('is-show');
  m.classList.remove('is-drop','is-open');void m.offsetWidth;
  out.style.setProperty('--c',p.c);
  turns++;lever.style.rotate=turns*360+'deg';
  m.classList.add('is-shake');await wait(1000);m.classList.remove('is-shake');
  m.classList.add('is-drop');await wait(1150);
  m.classList.add('is-open');await wait(350);
  res.style.background=p.c;
  res.innerHTML=`<p class="k">あなたにぴったりなのは…</p><h3 class="dela">${p.name}</h3><p><b>月額 ${p.yen}</b>（税込）　${p.txt}</p><button class="again" type="button">選びなおしてもう一回</button>`;
  res.classList.add('is-show');
  res.querySelector('.again').onclick=()=>{document.querySelectorAll('.chips input').forEach(i=>i.checked=false);res.classList.remove('is-show');m.classList.remove('is-drop','is-open');lever.focus()};
  lever.disabled=false;
});
}
