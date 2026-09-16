/* Saisa editorial motion. Shopping remains owned by app.js. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.getElementById('brand-intro');
  const gsap = window.gsap;
  let paused = reduced.matches;
  let seenIntro = false;
  try { seenIntro = sessionStorage.getItem('saisa-intro-seen') === 'yes'; paused ||= localStorage.getItem('saisa-motion-paused') === 'yes'; } catch (_) {}
  const toggle = document.createElement('button');
  toggle.className = 'motion-toggle';
  toggle.type = 'button';
  document.body.append(toggle);
  const updateToggle = () => { toggle.textContent = paused ? 'Motion off' : 'Pause motion'; toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? 'Enable decorative motion' : 'Pause decorative motion'); };
  updateToggle();
  let context;
  let introTimeline;
  let ribbonTween;
  let clothProgress = 0;
  let finishIntro;

  function revealHero() {
    if (!gsap || paused) return;
    gsap.from('.editorial-hero h1 .line > span', { yPercent:110, duration:1.2, stagger:.1, ease:'power4.out', clearProps:'all' });
    gsap.from('.hero-enter', { y:16, opacity:0, duration:.8, stagger:.09, delay:.35, clearProps:'all' });
    gsap.from('.hero-photo', { clipPath:'inset(10% 0 10% 100%)', duration:1.3, ease:'power4.inOut', clearProps:'all' });
    gsap.from('.hero-mini', { opacity:0, rotation:8, y:35, duration:1.2, delay:.7, clearProps:'all' });
  }
  if (intro && !seenIntro && !paused && gsap && !location.hash) {
    intro.hidden = false;
    const oldOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const inertElements = [...document.body.children].filter(el => el !== intro && !['SCRIPT','STYLE','LINK'].includes(el.tagName) && !el.inert);
    inertElements.forEach(el => { el.inert = true; });
    document.body.style.overflow = 'hidden';
    const skip = document.getElementById('intro-skip');
    skip.focus({preventScroll:true});
    let finished = false;
    finishIntro = () => {
      if (finished) return;
      finished = true;
      introTimeline?.kill();
      intro.hidden = true;
      inertElements.forEach(el => { el.inert = false; });
      document.body.style.overflow = oldOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus({preventScroll:true});
      else document.getElementById('site-logo-link')?.focus({preventScroll:true});
      try { sessionStorage.setItem('saisa-intro-seen','yes'); } catch (_) {}
      revealHero();
      window.ScrollTrigger?.refresh();
    };
    skip.addEventListener('click', finishIntro, {once:true});
    intro.addEventListener('keydown', e => { if (e.key === 'Escape') finishIntro(); if (e.key === 'Tab') {e.preventDefault();skip.focus();} });
    introTimeline = gsap.timeline({onComplete:finishIntro})
      .from('.intro-word span',{yPercent:110,rotation:8,stagger:.07,duration:.9,ease:'power4.out'})
      .from('.intro-line',{scaleX:0,duration:.7},.3)
      .to(intro,{yPercent:-100,duration:1,ease:'power4.inOut'},1.55);
    // Never leave a blocking splash behind if another script or tab suspends a tween.
    setTimeout(finishIntro,3600);
  } else { if (intro) intro.hidden = true; revealHero(); }

  function mountMotion() {
    context?.revert();
    if (!gsap || !window.ScrollTrigger || paused) return;
    gsap.registerPlugin(window.ScrollTrigger);
    context = gsap.context(() => {
      ribbonTween = gsap.to('.ribbon-track',{xPercent:-50,duration:34,repeat:-1,ease:'none'});
      gsap.utils.toArray('.section-header,.catalog-header,.reels-header').forEach(el => {
        gsap.from(el,{y:38,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',toggleActions:'play none none reverse'}});
      });
      gsap.utils.toArray('.section-title').forEach((el,i) => {
        gsap.fromTo(el,{color:'#202b24'},{color:i%2?'#52634a':'#202b24',ease:'none',scrollTrigger:{trigger:el,start:'top 88%',end:'top 35%',scrub:1}});
      });
      gsap.utils.toArray('.category-card').forEach((el,i) => {
        gsap.from(el,{y:35,opacity:0,duration:.8,delay:(i%3)*.07,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 95%',toggleActions:'play none none reverse'}});
      });
      gsap.to('.hero-photo img',{yPercent:9,scale:1.07,ease:'none',scrollTrigger:{trigger:'.editorial-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-mini',{y:-65,rotation:2,ease:'none',scrollTrigger:{trigger:'.editorial-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-copy .eyebrow',{letterSpacing:'.28em',color:'#7d9254',ease:'none',scrollTrigger:{trigger:'.editorial-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.utils.toArray('.collection-card-img-wrap').forEach(el => {
        gsap.fromTo(el,{scale:.92},{scale:1,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'top 18%',scrub:1}});
      });
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const timeline = gsap.timeline({scrollTrigger:{trigger:'.fabric-chapter',start:'top top',end:'+=100%',pin:'.fabric-stage',scrub:1,anticipatePin:1,onUpdate:s=>{clothProgress=s.progress;}}});
        timeline.fromTo('.fabric-heading',{y:35,opacity:1},{y:-20,opacity:1},0)
          .fromTo('.fabric-copy',{y:65,opacity:1},{y:0,opacity:1},.1)
          .to('.fabric-progress span',{scaleX:1,ease:'none'},0);
      });
      mm.add('(max-width: 900px)', () => {
        gsap.from('.fabric-copy',{y:30,opacity:.3,scrollTrigger:{trigger:'.fabric-copy',start:'top 95%',end:'top 65%',scrub:1}});
      });
    });
    window.ScrollTrigger.refresh();
  }
  mountMotion();
  toggle.addEventListener('click', () => {
    paused = !paused;
    if (paused) { finishIntro?.(); gsap?.killTweensOf('.hero-enter,.editorial-hero h1 .line > span,.hero-photo,.hero-mini'); }
    updateToggle();
    try { localStorage.setItem('saisa-motion-paused',String(paused ? 'yes' : 'no')); } catch (_) {}
    mountMotion();
    renderCloth(0);
  });
  reduced.addEventListener('change', () => { paused=reduced.matches;finishIntro?.();updateToggle();mountMotion();renderCloth(0); });
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) ribbonTween?.pause(); else if(!paused) ribbonTween?.resume(); });
  const looks = document.getElementById('looks-track');
  ['prev','next'].forEach(direction => document.getElementById(`looks-${direction}`)?.addEventListener('click',()=>looks.scrollBy({left:(direction==='next'?1:-1)*looks.clientWidth*.75,behavior:paused?'instant':'smooth'})));
  document.querySelectorAll('.reel-card').forEach(card=>{card.tabIndex=0;card.setAttribute('role','link');card.setAttribute('aria-label',card.querySelector('.reel-product-tag').textContent);card.addEventListener('keydown',e=>{if(e.key==='Enter')card.click();});});
  document.querySelectorAll('.real-reel-link').forEach(link=>link.addEventListener('click',e=>e.stopPropagation()));

  // Real perspective-projected textile mesh, shaded per face. No video or WebGL dependency.
  const canvas = document.getElementById('fabric-canvas');
  const ctx = canvas?.getContext('2d');
  let width=0,height=0,visible=false,raf=0,time=0,last=0;
  function resizeCloth() {
    if(!canvas || !ctx)return;
    const rect=canvas.getBoundingClientRect(); width=rect.width;height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);renderCloth(time);
  }
  function renderCloth(t) {
    if(!ctx || !width)return;
    ctx.clearRect(0,0,width,height);
    const columns=46,rows=28;
    const size=Math.min(width*.36,height*.52);
    const angle=-.43+clothProgress*.65;
    const points=[];
    for(let y=0;y<=rows;y++){
      points[y]=[];
      for(let x=0;x<=columns;x++){
        const u=x/columns*2-1,v=y/rows*2-1;
        let px=u*size*.61,py=v*size*.32;
        let pz=Math.sin(u*4.2+v*1.7+t*.65)*size*.13+Math.cos(v*3.1-t*.4)*size*.1;
        py+=Math.sin(u*2.8+t*.3)*size*.09;
        const rx=px*Math.cos(angle)-py*Math.sin(angle),ry=px*Math.sin(angle)+py*Math.cos(angle);
        const z=pz+v*size*.2, perspective=1000/(1000-z);
        points[y][x]={x:width*.53+rx*perspective,y:height*.5+ry*perspective,z};
      }
    }
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      const a=points[y][x],b=points[y][x+1],c=points[y+1][x+1],d=points[y+1][x];
      const shade=Math.max(26,Math.min(82,60+(b.z-a.z)*1.25+(d.z-a.z)*.75));
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();
      ctx.fillStyle=`hsl(72 19% ${shade}%)`;ctx.fill();ctx.strokeStyle=`hsla(70,22%,${shade+10}%,.35)`;ctx.lineWidth=.5;ctx.stroke();
      // The crosshatch is geometry-locked so it folds with the textile.
      ctx.beginPath();ctx.moveTo((a.x+b.x)/2,(a.y+b.y)/2);ctx.lineTo((d.x+c.x)/2,(d.y+c.y)/2);ctx.strokeStyle=`hsla(70,20%,${shade-17}%,.25)`;ctx.stroke();
    }
  }
  function frame(stamp){raf=0;if(!visible||document.hidden)return;if(!paused&&stamp-last>32){time+=.032;renderCloth(time);last=stamp;}if(!paused)raf=requestAnimationFrame(frame);}
  function startCloth(){if(visible&&!paused&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  if(ctx){
    new ResizeObserver(resizeCloth).observe(canvas);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)startCloth();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(canvas);
    toggle.addEventListener('click',startCloth);reduced.addEventListener('change',startCloth);document.addEventListener('visibilitychange',startCloth);
  }
  window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});
})();
