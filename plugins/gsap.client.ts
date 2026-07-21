export default defineNuxtPlugin(() => {
  return {
    provide: {
      gsap: null as any,
      ScrollTrigger: null as any
    }
  }
})
