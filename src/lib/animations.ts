import { gsap, Power2, Back, Elastic, Expo, Circ } from 'gsap'

const prefersReducedMotion = () => {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const animations = {
  // Dramatic fade + scale + bounce from below
  dramaticEntrance: (element: Element | Element[], duration = 0.8, delay = 0) => {
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1, y: 0, scale: 1 })
      return gsap.timeline()
    }
    return gsap.fromTo(
      element,
      { opacity: 0, y: 60, scale: 0.7, rotationX: -15 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        rotationX: 0,
        duration, 
        delay,
        ease: Elastic.easeOut.config(1, 0.75)
      }
    )
  },

  // Pop in with elastic bounce - very dramatic
  popIn: (element: Element | Element[], duration = 0.6, delay = 0) => {
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1, scale: 1 })
      return gsap.timeline()
    }
    return gsap.fromTo(
      element,
      { opacity: 0, scale: 0, rotation: -180 },
      { 
        opacity: 1, 
        scale: 1, 
        rotation: 0,
        duration, 
        delay,
        ease: Elastic.easeOut.config(1, 0.5)
      }
    )
  },

  // Staggered entrance with dramatic spring
  staggerIn: (elements: Element[], stagger = 0.15) => {
    if (prefersReducedMotion()) {
      gsap.set(elements, { opacity: 1, y: 0, scale: 1 })
      return gsap.timeline()
    }
    return gsap.fromTo(
      elements,
      { opacity: 0, y: 40, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger,
        ease: Back.easeOut.config(2.5)
      }
    )
  },

  // Slide in with overshoot
  slideInLeft: (element: Element | Element[], duration = 0.5) => {
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1, x: 0 })
      return gsap.timeline()
    }
    return gsap.fromTo(
      element,
      { opacity: 0, x: -60 },
      { opacity: 1, x: 0, duration, ease: Back.easeOut.config(2) }
    )
  },

  // Number count with dramatic ease
  countUp: (element: Element, from: number, to: number, duration = 1.5, formatter?: (num: number) => string) => {
    const obj = { value: from }
    return gsap.to(obj, {
      value: to,
      duration,
      ease: Expo.easeOut,
      onUpdate: function() {
        const val = this.targets()[0].value
        element.textContent = formatter ? formatter(Math.round(val)) : Math.round(val).toLocaleString()
      }
    })
  },

  // Dramatic bounce with amplitude
  gentleBounce: (element: Element, repeat = -1) => {
    if (prefersReducedMotion()) {
      return gsap.timeline()
    }
    return gsap.to(element, {
      y: -12,
      rotation: 5,
      duration: 0.8,
      repeat,
      yoyo: true,
      ease: Power2.easeInOut
    })
  },

  // Accordion with spring - improved version
  smoothHeight: (element: Element, open: boolean) => {
    if (prefersReducedMotion()) {
      gsap.set(element, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 })
      return gsap.timeline()
    }
    if (open) {
      gsap.fromTo(
        element,
        { height: 0, opacity: 0 },
        { 
          height: 'auto', 
          opacity: 1,
          duration: 0.4,
          ease: Back.easeOut.config(1.7)
        }
      )
    } else {
      gsap.to(element, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: Power2.easeIn
      })
    }
  },

  // Dramatic ripple with glow
  ripple: (element: Element, x: number, y: number) => {
    const ripple = document.createElement('div')
    ripple.style.cssText = `
      position: absolute;
      background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%;
      pointer-events: none;
      width: 150px;
      height: 150px;
      left: ${x - 75}px;
      top: ${y - 75}px;
      transform: scale(0);
    `
    element.appendChild(ripple)

    return gsap.to(ripple, {
      scale: 5,
      opacity: 0,
      duration: 0.8,
      ease: Expo.easeOut,
      onComplete: () => ripple.remove()
    })
  },

  // Modal spring animation
  modalSpring: (element: Element, open: boolean) => {
    if (open) {
      gsap.fromTo(
        element,
        { opacity: 0, scale: 0.5, y: 100, rotationX: 20 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          rotationX: 0,
          duration: 0.6,
          ease: Elastic.easeOut.config(1, 0.75)
        }
      )
    } else {
      gsap.to(element, {
        opacity: 0,
        scale: 0.5,
        y: 100,
        rotationX: -20,
        duration: 0.3,
        ease: Expo.easeIn
      })
    }
  },

  // Card hover lift effect
  cardLift: (element: Element, hover: boolean) => {
    if (hover) {
      gsap.to(element, {
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: Back.easeOut.config(1.7)
      })
    } else {
      gsap.to(element, {
        y: 0,
        scale: 1,
        boxShadow: '0 1px 3px -1px rgba(0,0,0,0.1)',
        duration: 0.3,
        ease: Power2.easeOut
      })
    }
  },

  // Typing bounce with stagger
  typingBounce: (elements: Element[]) => {
    if (prefersReducedMotion()) {
      return gsap.timeline()
    }
    return gsap.to(elements, {
      scale: 1.8,
      opacity: 0.3,
      duration: 0.3,
      repeat: 3,
      yoyo: true,
      stagger: 0.15,
      ease: Circ.easeInOut
    })
  }
}
