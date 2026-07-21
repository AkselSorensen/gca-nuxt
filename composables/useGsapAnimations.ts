export const useGsapAnimations = () => {
  let gsap: any = null
  let ScrollTrigger: any = null

  onMounted(async () => {
    const module = await import('gsap')
    gsap = module.default
    const st = await import('gsap/ScrollTrigger')
    ScrollTrigger = st.default
    gsap.registerPlugin(ScrollTrigger)

    gsap.defaults({ ease: 'power3.out', duration: 0.7 })

    // Reactive: watch for animation triggers
    useAnimationObserver()
  })

  function useAnimationObserver() {
    const observer = new MutationObserver(() => {
      if (gsap) animateVisible()
    })
    onMounted(() => {
      observer.observe(document.body, { childList: true, subtree: true })
      setTimeout(() => observer.disconnect(), 5000)
    })
    onUnmounted(() => observer.disconnect())
  }

  function animateVisible() {
    if (!gsap || !ScrollTrigger) return

    // Entrance animations - stagger cards
    gsap.fromTo('.animate-in', 
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6,
        scrollTrigger: { trigger: '.animate-in', start: 'top 90%', toggleActions: 'play none none none' }
      }
    )

    // Category cards staggered
    gsap.fromTo('.category-card', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.06, duration: 0.5,
        scrollTrigger: { trigger: '.categories-grid', start: 'top 88%', toggleActions: 'play none none none' }
      }
    )

    // Hero entrance
    gsap.fromTo('.hero-content > *', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.1 }
    )
    gsap.fromTo('.hero-visual > *', 
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.12, duration: 0.5, delay: 0.3 }
    )

    // Section headers
    gsap.fromTo('.section-header', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5,
        scrollTrigger: { trigger: '.section-header', start: 'top 92%', toggleActions: 'play none none none' }
      }
    )
  }

  // Hover effect for product cards
  function initCardHover(cardRef: HTMLElement) {
    if (!gsap) return
    cardRef.addEventListener('mouseenter', () => {
      gsap.to(cardRef.querySelector('.card-media img'), { scale: 1.05, duration: 0.4, ease: 'power2.out' })
    })
    cardRef.addEventListener('mouseleave', () => {
      gsap.to(cardRef.querySelector('.card-media img'), { scale: 1, duration: 0.4, ease: 'power2.out' })
    })
  }

  return { animateVisible, initCardHover }
}
