import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetOverlayAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import { validatePortion } from "~lib/form"
import {
  debugFillLocalStorage,
  deleteStorage,
  loadLocalStorageAssociatedWithCurrentVideo
} from "~lib/storage"
import type { LocalStorageItem, PortionSettings } from "~types/types"

import { CreationForm } from "./form"

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

const DisplayStorageItems = ({
  items,
  setPortion,
  currentPortion
}: {
  items: PortionSettings[]
  setPortion: (portion: LocalStorageItem) => void
  currentPortion: LocalStorageItem | null
}) => {
  return (
    <div className="overflow-y-auto">
      {items.map((item: LocalStorageItem) => (
        <div
          key={item.id}
          className={`flex hover:bg-white cursor-pointer p-2 ${
            currentPortion?.id === item.id
              ? "bg-white" 
              : ""
          }`}
          onClick={() => setPortion(item)}>
          <div className="flex-1">{item.portionTitle}</div>
          <div className="ml-2">{item.startTime}s</div>
          <div className="ml-2">{item.endTime}s</div>
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
  const [portion, setPortion] = useState<LocalStorageItem | null>(null)

  const refreshItems = () => {
    console.log("Refreshing items")
    const loadedItems = loadLocalStorageAssociatedWithCurrentVideo()
    console.log("Loaded items:", loadedItems)
    setItems(loadedItems)
  }

  useEffect(() => {
    // Initial load
    refreshItems()

    // Listen for storage changes
    const handleStorageChange = () => {
      console.log("Storage changed, refreshing items")
      refreshItems()
    }

    window.addEventListener("storage", handleStorageChange)

    // Handle portion changes
    if (portion) {
      setIsLooping(true)
      setCurrentLoop(0)
      const cleanup = startVideoLoop()
      return () => {
        window.removeEventListener("storage", handleStorageChange)
        cleanup?.()
        setIsLooping(false)
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [portion])

  const startVideoLoop = () => {
    const video = document.querySelector("video") as HTMLVideoElement
    if (!video) return

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

  // useEffect(() => {
  //   if (!isLooping) return
  //   return startVideoLoop()
  // }, [isLooping])

  return (
    <div className="m-8 bg-red-500 w-[250px] h-[250px] flex flex-col">
      <div>
        <CreationForm onSubmit={refreshItems} />
      </div>
      <div>
        <p>Current Loop: {currentLoop}</p>
        <p>Status: {isLooping ? "Looping" : "Stopped"}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <DisplayStorageItems items={items} setPortion={setPortion} currentPortion={portion} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log("Debug fill storage clicked")
            debugFillLocalStorage()
            refreshItems()
          }}>
          FillStorage
        </button>
        <button
          onClick={() => {
            console.log("Delete storage clicked")
            deleteStorage()
            refreshItems()
          }}>
          Delete Storage
        </button>
      </div>
    </div>
  )
}

export default LooperUI
