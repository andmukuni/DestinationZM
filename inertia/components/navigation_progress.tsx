import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

export function NavigationProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const progressRef = useRef(0)
  const trickleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const setProgressValue = (value: number) => {
      const next = Math.min(Math.max(value, 0), 1)
      progressRef.current = next
      setProgress(next)
    }

    const clearTrickle = () => {
      if (trickleTimerRef.current) {
        clearTimeout(trickleTimerRef.current)
        trickleTimerRef.current = null
      }
    }

    const scheduleTrickle = () => {
      clearTrickle()
      trickleTimerRef.current = setTimeout(() => {
        if (progressRef.current > 0 && progressRef.current < 0.9) {
          const amount = Math.random() * 0.1
          setProgressValue(progressRef.current + amount)
        }
        scheduleTrickle()
      }, 200)
    }

    const removeStart = router.on('start', () => {
      setVisible(true)
      setProgressValue(0.08)
      scheduleTrickle()
    })

    const removeProgress = router.on('progress', (event) => {
      const percentage = event.detail.progress?.percentage
      if (percentage != null) {
        setProgressValue(Math.max(percentage / 100, 0.08))
      }
    })

    const removeFinish = router.on('finish', () => {
      clearTrickle()
      setProgressValue(1)
      window.setTimeout(() => {
        setVisible(false)
        setProgressValue(0)
      }, 200)
    })

    return () => {
      clearTrickle()
      removeStart()
      removeProgress()
      removeFinish()
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      className="h-0.5 w-full shrink-0 overflow-hidden bg-orange-100"
      role="progressbar"
      aria-hidden="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
    >
      <div
        className="h-full bg-orange-500 transition-[width,opacity] duration-200 ease-linear"
        style={{
          width: `${progress * 100}%`,
          opacity: progress === 1 ? 0 : 1,
        }}
      />
    </div>
  )
}
