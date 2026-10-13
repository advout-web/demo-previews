const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv,.reveal').forEach(el=>io.observe(el));
document.body.classList.add('is-ready');
const tg=document.querySelector('.hd__toggle'),nv=document.getElementById('hd-nav');
tg.addEventListener('click',()=>{const o=tg.getAttribute('aria-expanded')!=='true';tg.setAttribute('aria-expanded',o);tg.textContent=o?'CLOSE':'MENU';nv.classList.toggle('is-open',o)});
nv.addEventListener('click',e=>{if(e.target.closest('a')){tg.setAttribute('aria-expanded','false');tg.textContent='MENU';nv.classList.remove('is-open')}});
if(document.getElementById('thread')){

// 章の番号をつなぐ金の線（スクロールに合わせて描かれる）
const main=document.getElementById('main'),svg=document.getElementById('thread'),[ghost,gold]=svg.querySelectorAll('path');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let len=0,top0=0,h=0;
function build(){
  const mr=main.getBoundingClientRect();top0=mr.top+scrollY;h=main.offsetHeight;
  const w=main.clientWidth;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const pts=[...document.querySelectorAll('[data-mark]')].map(m=>{const r=m.getBoundingClientRect();return[r.left+r.width/2-mr.left,r.top+r.height/2-mr.top]});
  const edge=w<760?8:Math.max(40,(w-760)/2),R=w<760?24:60;
  let d=`M${pts[0][0]} ${pts[0][1]}`;
  // 番号から横へ出て、画面の端を下り、次の番号へ横から戻る（本文の上を横切らない）
  const seg=(x0,y0,side,y1,x1)=>{const s=Math.sign(side-x0),t=Math.sign(x1-side);
    return ` L${side-s*R} ${y0} Q${side} ${y0} ${side} ${y0+R} L${side} ${y1-R} Q${side} ${y1} ${side+t*R} ${y1} L${x1} ${y1}`};
  for(let i=1;i<pts.length;i++){const[x0,y0]=pts[i-1],[x1,y1]=pts[i];d+=seg(x0,y0,i%2?edge:w-edge,y1,x1)}
  const[xl,yl]=pts.at(-1),sl=pts.length%2?edge:w-edge;
  d+=` L${sl-Math.sign(sl-xl)*R} ${yl} Q${sl} ${yl} ${sl} ${yl+R} L${sl} ${h}`;
  ghost.setAttribute('d',d);gold.setAttribute('d',d);
  len=gold.getTotalLength();gold.style.strokeDasharray=len;draw();
}
function draw(){
  const p=reduce?1:Math.min(1,Math.max(0,(scrollY+innerHeight*.62-top0)/h));
  gold.style.strokeDashoffset=len*(1-p);
}
let raf=0;addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})},{passive:true});
let rb=0;new ResizeObserver(()=>{clearTimeout(rb);rb=setTimeout(build,120)}).observe(main);addEventListener('load',build);document.fonts.ready.then(build);build();

}
