import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useState, useRef } from "react"

// https://www.youtube.com/watch?v=1iLNVa95LxQ&t=375s

// id="contentWrapper"
// top-level-buttons-computed

export const config: PlasmoCSConfig = {
  matches: ["*://www.youtube.com/watch?v=*"],
  all_frames: true
}

// This tells Plasmo where to position the overlay
export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector("body")

// This injects our styles
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export type PortionSettings = {
  portionTitle: string
  startTime: number
  endTime: number
  loops: number
}

const validatePortion = (portion: PortionSettings) => {
  return (
    portion.startTime && portion.endTime && portion.startTime < portion.endTime
  )
}

const LooperUI = () => {
  const [currentLoop, setCurrentLoop] = useState(0)
  const [isLooping, setIsLooping] = useState(false)
  const isTransitioning = useRef(false)

  const [portion, setPortion] = useState<PortionSettings>({
    portionTitle: "",
    startTime: null,
    endTime: null,
    loops: 0
  })

  const startVideoLoop = () => {
    const video = document.querySelector("video") as HTMLVideoElement
    if (!video || !validatePortion(portion)) return

    const delay = 1000 // 1 second delay between loops
    console.log("Starting loop")
    
    video.currentTime = portion.startTime
    setCurrentLoop(prev => prev + 1)

    const handleTimeUpdate = () => {
      if (isTransitioning.current) return

      if (video.currentTime >= portion.endTime) {
        isTransitioning.current = true
        video.pause()
        
        setTimeout(() => {
          // Get the latest loop count
          setCurrentLoop(prevLoop => {
            if (prevLoop < portion.loops) {
              video.currentTime = portion.startTime
              video.play()
              return prevLoop + 1
            } else {
              setIsLooping(false)
              return prevLoop
            }
          })
          isTransitioning.current = false
        }, delay)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.play()

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }

  useEffect(() => {
    if (!isLooping) return
    return startVideoLoop()
  }, [isLooping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentLoop(0)
    setIsLooping(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="m-8 bg-red-500 w-[250px] h-[250px]">
      <form onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
        <button type="submit">Start Looping</button>
        <input
          placeholder="Portion Title"
          type="string"
          value={portion.portionTitle}
          onChange={(e) =>
            setPortion({ ...portion, portionTitle: e.target.value })
          }
        />
        <input
          placeholder="Start Time"
          type="number"
          value={portion.startTime}
          onChange={(e) =>
            setPortion({ ...portion, startTime: Number(e.target.value) })
          }
        />
        <input
          placeholder="End Time"
          type="number"
          value={portion.endTime}
          onChange={(e) =>
            setPortion({ ...portion, endTime: Number(e.target.value) })
          }
        />
        <input
          placeholder="Loops"
          type="number"
          value={portion.loops}
          onChange={(e) =>
            setPortion({ ...portion, loops: Number(e.target.value) })
          }
        />
      </form>
      <div>
        <p>Current Loop: {currentLoop}</p>
        <p>Status: {isLooping ? "Looping" : "Stopped"}</p>
      </div>
    </div>
  )
}

export default LooperUI
