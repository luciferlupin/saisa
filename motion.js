/* Saisa editorial motion. Shopping remains owned by app.js. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.getElementById('brand-intro');
  const gsap = window.gsap;
  let paused = false;
  let seenIntro = false;
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

  revealHero();

  // =========================================================================
  // GUARANTEED REAL-TIME SCROLL MOTION ENGINE FOR HEADINGS & SUBHEADINGS
  // =========================================================================
  function initTextScrollMotion() {
    const headingSelectors = [
      '.tres-categories-heading',
      '.ombre-collection-heading',
      '.staples-title',
      '.limited-edition-heading',
      '.saisa-reels-title',
      '.influencer-title',
      '.worn-reviewed-title',
      '.section-title',
      '.footer-newsletter-title',
      '.tres-trust-title'
    ];

    const subSelectors = [
      '.saisa-reels-sub',
      '.influencer-subtitle',
      '.section-subtitle',
      '.staples-desc',
      '.footer-newsletter-sub'
    ];

    // Light Start: RGB(228, 204, 198) -> #E4CCC6 (Soft Light Champagne Rose)
    // Dark End:   RGB(42, 13, 15)     -> #2A0D0F (Rich Deep Regal Wine)
    const headStartRGB = [228, 204, 198];
    const headEndRGB   = [42, 13, 15];

    // Subtitle Start: RGB(218, 192, 184) -> #DAC0B8
    // Subtitle End:   RGB(99, 59, 56)    -> #633B38
    const subStartRGB  = [218, 192, 184];
    const subEndRGB    = [99, 59, 56];

    let ticking = false;

    function renderTextMotion() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const headEls = document.querySelectorAll(headingSelectors.join(','));
      const subEls  = document.querySelectorAll(subSelectors.join(','));

      headEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Starts entering at 96% viewport height, completes transition by 48% viewport height
        const startY = vh * 0.96;
        const endY   = vh * 0.48;
        
        let p = (startY - rect.top) / (startY - endY);
        if (p < 0) p = 0;
        if (p > 1) p = 1;

        // Smooth ease-out quad curve
        const ease = 1 - (1 - p) * (1 - p);

        const r = Math.round(headStartRGB[0] + (headEndRGB[0] - headStartRGB[0]) * ease);
        const g = Math.round(headStartRGB[1] + (headEndRGB[1] - headStartRGB[1]) * ease);
        const b = Math.round(headStartRGB[2] + (headEndRGB[2] - headStartRGB[2]) * ease);
        const opacity = 0.35 + 0.65 * ease;
        const translateY = 24 * (1 - ease);

        el.style.color = `rgb(${r}, ${g}, ${b})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translateY(${translateY.toFixed(1)}px)`;
      });

      subEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const startY = vh * 0.95;
        const endY   = vh * 0.52;
        
        let p = (startY - rect.top) / (startY - endY);
        if (p < 0) p = 0;
        if (p > 1) p = 1;

        const ease = 1 - (1 - p) * (1 - p);
        const r = Math.round(subStartRGB[0] + (subEndRGB[0] - subStartRGB[0]) * ease);
        const g = Math.round(subStartRGB[1] + (subEndRGB[1] - subStartRGB[1]) * ease);
        const b = Math.round(subStartRGB[2] + (subEndRGB[2] - subStartRGB[2]) * ease);
        const opacity = 0.4 + 0.6 * ease;
        const translateY = 14 * (1 - ease);

        el.style.color = `rgb(${r}, ${g}, ${b})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translateY(${translateY.toFixed(1)}px)`;
      });

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(renderTextMotion);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    renderTextMotion();
    
    // Also re-run after images and DOM content load
    window.addEventListener('load', renderTextMotion);
    setTimeout(renderTextMotion, 300);
    setTimeout(renderTextMotion, 1000);
  }

  // Initialize immediately
  initTextScrollMotion();

  function mountMotion() {
    context?.revert();
    if (!gsap || !window.ScrollTrigger || paused) return;
    gsap.registerPlugin(window.ScrollTrigger);
    context = gsap.context(() => {
      ribbonTween = gsap.to('.ribbon-track',{xPercent:-50,duration:34,repeat:-1,ease:'none'});

      // =========================================================================
      // SEAMLESS SECTION-TO-SECTION FLOW TRANSITIONS & ORGANIC PARALLAX
      // =========================================================================
      const mainSections = [
        '.tres-categories-section',
        '.ombre-collection-section',
        '.staples-showcase-section',
        '.limited-edition-section',
        '.saisa-reels-section',
        '.influencer-section',
        '.worn-reviewed-section',
        '.tres-trust-section'
      ];
      
      mainSections.forEach((secSelector) => {
        gsap.utils.toArray(secSelector).forEach((sec) => {
          gsap.fromTo(sec,
            { y: 32, opacity: 0.92 },
            {
              y: 0,
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 98%',
                end: 'top 60%',
                scrub: 0.5
              }
            }
          );
        });
      });

      // Organic Card Cascading Parallax within Grids (Odd vs Even floating rhythm)
      const gridSelectors = [
        '.tres-categories-grid > *',
        '.ombre-grid > *',
        '.limited-grid > *',
        '.saisa-reels-grid > *',
        '.influencer-grid > *'
      ];
      gridSelectors.forEach((selector) => {
        gsap.utils.toArray(selector).forEach((card, idx) => {
          const isEven = idx % 2 === 0;
          gsap.fromTo(card,
            { yPercent: isEven ? 5 : -3 },
            {
              yPercent: isEven ? -5 : 3,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
              }
            }
          );
        });
      });

      // =========================================================================
      // 2D LOTUS BACKGROUND WATERMARK PARALLAX DRIFT
      // =========================================================================
      gsap.utils.toArray('.bg-lotus-watermark').forEach((lotus) => {
        const isLeft = lotus.classList.contains('left');
        const isCenter = lotus.classList.contains('center');
        gsap.fromTo(lotus, 
          { 
            yPercent: isCenter ? 8 : (isLeft ? 12 : -12),
            rotation: isCenter ? 0 : (isLeft ? -12 : 12)
          },
          {
            yPercent: isCenter ? -8 : (isLeft ? -12 : 12),
            rotation: isCenter ? 0 : (isLeft ? -4 : 4),
            ease: 'none',
            scrollTrigger: {
              trigger: lotus.parentElement || lotus,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.6
            }
          }
        );
      });

      gsap.to('.hero-photo img',{yPercent:9,scale:1.07,ease:'none',scrollTrigger:{trigger:'.editorial-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-mini',{y:-65,rotation:2,ease:'none',scrollTrigger:{trigger:'.editorial-hero',start:'top top',end:'bottom top',scrub:1}});
      gsap.to('.hero-copy .eyebrow',{letterSpacing:'.28em',color:'#CAA058',ease:'none',scrollTrigger:{trigger:'.editorial-hero',start:'top top',end:'bottom top',scrub:1}});
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
  reduced.addEventListener('change', () => { paused=reduced.matches;finishIntro?.();mountMotion();renderCloth(0); });
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
      ctx.fillStyle=`hsl(14 32% ${shade}%)`;ctx.fill();ctx.strokeStyle=`hsla(38,48%,${shade+10}%,.35)`;ctx.lineWidth=.5;ctx.stroke();
      // The crosshatch is geometry-locked so it folds with the textile.
      ctx.beginPath();ctx.moveTo((a.x+b.x)/2,(a.y+b.y)/2);ctx.lineTo((d.x+c.x)/2,(d.y+c.y)/2);ctx.strokeStyle=`hsla(14,28%,${shade-15}%,.25)`;ctx.stroke();
    }
  }
  function frame(stamp){raf=0;if(!visible||document.hidden)return;if(!paused&&stamp-last>32){time+=.032;renderCloth(time);last=stamp;}if(!paused)raf=requestAnimationFrame(frame);}
  function startCloth(){if(visible&&!paused&&!document.hidden&&!raf)raf=requestAnimationFrame(frame);}
  if(ctx){
    new ResizeObserver(resizeCloth).observe(canvas);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)startCloth();else{cancelAnimationFrame(raf);raf=0;}},{rootMargin:'100px'}).observe(canvas);
    reduced.addEventListener('change',startCloth);document.addEventListener('visibilitychange',startCloth);
  }
  window.addEventListener('load',()=>window.ScrollTrigger?.refresh(),{once:true});
})();
