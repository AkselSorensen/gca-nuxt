export function initGsap() {
  let gsap: any = null
  let ScrollTrigger: any = null

  async function load() {
    if (typeof window === 'undefined') return
    const mod = await import('gsap')
    gsap = mod.default
    const st = await import('gsap/ScrollTrigger')
    ScrollTrigger = st.default
    gsap.registerPlugin(ScrollTrigger)
    gsap.defaults({ ease: 'power3.out', duration: 0.6 })
    return { gsap, ScrollTrigger }
  }

  return { load }
}

export function pageEntrance(gsap: any, container: HTMLElement) {
  if (!gsap || !container) return

  // Animate children with stagger
  const children = container.querySelectorAll('.anim-up, .anim-card, .anim-fade')
  if (children.length) {
    gsap.fromTo(children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.5, clearProps: 'transform' }
    )
  }

  // Slide in from left
  const slideLeft = container.querySelectorAll('.anim-left')
  if (slideLeft.length) {
    gsap.fromTo(slideLeft,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.05, duration: 0.4 }
    )
  }

  // Slide in from right
  const slideRight = container.querySelectorAll('.anim-right')
  if (slideRight.length) {
    gsap.fromTo(slideRight,
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.05, duration: 0.4 }
    )
  }

  // Scale in
  const scaleIn = container.querySelectorAll('.anim-scale')
  if (scaleIn.length) {
    gsap.fromTo(scaleIn,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'back.out(1.3)' }
    )
  }

  // ScrollTrigger sections
  const sections = container.querySelectorAll('.anim-scroll')
  if (sections.length) {
    sections.forEach((el: HTMLElement) => {
      const inner = el.querySelectorAll('.anim-up, .anim-card, .anim-fade')
      gsap.fromTo(inner.length ? inner : el,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.04, duration: 0.5,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        }
      )
    })
  }
}
