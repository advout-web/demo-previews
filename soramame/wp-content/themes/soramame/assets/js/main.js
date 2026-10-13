const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});
document.querySelectorAll('.rv,.map,.reveal').forEach(el=>io.observe(el));
document.body.classList.add('is-ready');
const tg=document.querySelector('.hd__toggle'),nv=document.getElementById('hd-nav');
tg.addEventListener('click',()=>{const o=tg.getAttribute('aria-expanded')!=='true';tg.setAttribute('aria-expanded',o);nv.classList.toggle('is-open',o)});

const SHOPS=[
  {img:'shop',alt:'木のカウンターがある駅前店の店内',nm:'駅前店',ad:'そらまめ線「中町駅」改札を出て右へ1分 ／ 10:00–19:00',q:'会社帰りに寄ってくださる方が多いお店です。夜7時まで開いています。',who:'店長 たなか'},
  {img:'hands',alt:'湯のみを手にくつろぐ様子',nm:'川べり店',ad:'いなほ川の土手沿い、町役場の裏 ／ 9:30–17:30',q:'お茶をいれてお待ちしています。スマホ教室は毎週水曜の午後です。',who:'スタッフ すずき'},
  {img:'garden',alt:'野菜が育つお店の前の畑',nm:'畑の前店',ad:'中町の畑のとなり、駐車場10台 ／ 10:00–18:00',q:'店の前の畑でとれた野菜を、ご来店の方にお分けしています。',who:'スタッフ やまだ'}
];
const shop=document.getElementById('shop'),pins=document.querySelectorAll('.pin');
pins.forEach(b=>b.addEventListener('click',()=>{
  const s=SHOPS[+b.dataset.i];
  pins.forEach(p=>p.setAttribute('aria-pressed',p===b));
  shop.classList.remove('is-flip');void shop.offsetWidth;shop.classList.add('is-flip');
  setTimeout(()=>{
    const img=shop.querySelector('img');img.src=img.src.replace(/[^/]+\.webp$/,s.img+'.webp');img.alt=s.alt;
    shop.querySelector('.nm').textContent=s.nm;shop.querySelector('.ad').textContent=s.ad;
    shop.querySelector('blockquote').innerHTML=s.q+'<cite>'+s.who+'</cite>';
  },matchMedia('(prefers-reduced-motion: reduce)').matches?0:270);
}));
