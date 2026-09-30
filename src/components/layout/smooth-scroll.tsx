"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Smooth scrolling. Mounted once in the root layout.
 *
 * Three rules, because smooth scroll is the easiest thing in a UI to get wrong:
 * - skipped entirely for anyone who asked for reduced motion, since forced
 *   scrolling overrides a real accessibility setting
 * - `syncTouch` stays off, because hijacking touch scrolling breaks momentum
 *   on a phone and the drawer relies on native scroll
 * - a CSS transition on the html element would fight Lenis, so we drive the
 *   whole thing from JS and let it own the frame loop
 */
export const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
