"use client"

import { useEffect } from "react"
import Lenis from "lenis"

let activeLenis: Lenis | null = null

/**
 * Glide to an in-page anchor from code — the drawer's section links, which
 * cannot use native anchor navigation while body scroll is locked. Pushes the
 * hash so the link stays shareable, then scrolls: through Lenis when it is
 * running (it reads `scroll-margin-top`, so the sticky toolbar is cleared),
 * or natively when reduced motion left Lenis unmounted.
 */
export const glideToAnchor = (id: string): void => {
  const target = document.getElementById(id)
  if (!target) return
  window.history.pushState(null, "", `#${id}`)
  if (activeLenis) activeLenis.scrollTo(target)
  else target.scrollIntoView()
}

/**
 * Smooth scrolling, mounted once in the root layout. Lenis owns all scrolling,
 * so no CSS `scroll-behavior` may compete with it: the two fight over every
 * programmatic scroll and the page stutters.
 *
 * Four rules, because smooth scroll is the easiest thing in a UI to get wrong:
 * - skipped entirely for anyone who asked for reduced motion, since forced
 *   scrolling overrides a real accessibility setting
 * - `syncTouch` stays off, because hijacking touch scrolling breaks momentum
 *   on a phone and the drawer relies on native scroll
 * - `anchors` stays on, so in-page jumps (the skip link, the section rows)
 *   glide through Lenis instead of fighting it
 * - its own frame loop, owned and destroyed here, so nothing else has to stay
 *   in sync with it
 */
export const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    })
    activeLenis = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      activeLenis = null
      lenis.destroy()
    }
  }, [])

  return null
}
