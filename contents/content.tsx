import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import {
  debugFillLocalStorage,
  loadLocalStorageAssociatedWithCurrentVideo,
  deleteStorage,
} from "~lib/storage"
import type { LocalStorageItem, PortionSettings } from "~types/types"

// Manage URL

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

const validatePortion = (portion: PortionSettings) => {
  return (
    portion.startTime && portion.endTime && portion.startTime < portion.endTime
  )
}

const DisplayStorageItems = ({ items }: { items: PortionSettings[] }) => {
  return (
    <div className="overflow-y-auto">
      {items.map((item) => (
        <div className="flex gap-2">
          <div>{item.portionTitle}</div>
          <div>{item.startTime}</div>
          <div>{item.endTime}</div>
        </div>
      ))}
    </div>
  )
}

const LooperUI = () => {
  const [currentLoop, setCurrentLoop] = useState(0)
  const [isLooping, setIsLooping] = useState(false)
  const [items, setItems] = useState<PortionSettings[]>([])
  const isTransitioning = useRef(false)

  const refreshItems = () => {
    setItems(loadLocalStorageAssociatedWithCurrentVideo())
  }

  useEffect(() => {
    // Initial load
    refreshItems()

    // Listen for storage changes
    const handleStorageChange = () => {
      refreshItems()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Create a local storage object to store the portion settings

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

    const handleTimeUpdate = () => {
      if (isTransitioning.current) return

      if (video.currentTime >= portion.endTime) {
        isTransitioning.current = true
        video.pause()

        setTimeout(() => {
          setCurrentLoop((prevLoop) => {
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
    // setCurrentLoop(0)
    // setIsLooping(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="m-8 bg-red-500 w-[250px] h-[250px] flex flex-col">
      <div>
        <form
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
          className="flex flex-col gap-2">
          <button type="submit" className="">Add Portion</button>
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
      </div>
      <div>
        <p>Current Loop: {currentLoop}</p>
        <p>Status: {isLooping ? "Looping" : "Stopped"}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <DisplayStorageItems items={items} />
      </div>

      <div className="flex gap-2">
        <button onClick={() => {
          debugFillLocalStorage()
          refreshItems()
        }}>FillStorage</button>
        <button onClick={() => {
          deleteStorage()
          refreshItems()
        }}>Delete Storage</button>
      </div>
    </div>
  )
}

export default LooperUI
