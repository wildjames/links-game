import { useRef, useState, useLayoutEffect, RefObject } from 'react'

interface UseFitTextOptions {
    minPx?: number;
    maxPx?: number;
}

export function useFitText<T extends HTMLElement>(
    { minPx = 10, maxPx = 24 }: UseFitTextOptions = {}
): { ref: RefObject<T>; fontSize: number } {
    const ref = useRef<T>(null)
    const [fontSize, setFontSize] = useState(maxPx)

    useLayoutEffect(() => {
        const node = ref.current
        if (!node || !node.parentElement) return

        const parentWidth = () => node.parentElement!.clientWidth
        const fit = () => {
            let size = maxPx
            node.style.fontSize = `${size}px`
            // shrink until it fits (or hits the min)
            while (node.scrollWidth > parentWidth() && size > minPx) {
                size--
                node.style.fontSize = `${size}px`
            }
            setFontSize(size)
        }

        // initial fit
        fit()

        // observe any resize of the parent container
        const ro = new ResizeObserver(fit)
        ro.observe(node.parentElement)
        return () => ro.disconnect()
    }, [minPx, maxPx])

    return { ref: ref as RefObject<T>, fontSize }
}
