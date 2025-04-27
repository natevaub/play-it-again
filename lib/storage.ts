import { timeStamp } from "console"

import type { LocalStorageItem, PortionSettings } from "~types/types"

export const debugFillLocalStorage = () => {
  // Generate 5 random portion settings for testing
  const generateRandomTime = () => {
    // Random time between 0 and 600 seconds (10 minutes)
    return Math.floor(Math.random() * 600)
  }

  const generateRandomPortion = (): PortionSettings => {
    const start = generateRandomTime()
    const end = start + Math.floor(Math.random() * 60) + 30 // 30-90 seconds after start

    return {
      portionTitle: `Test Portion ${Math.floor(Math.random() * 1000)}`,
      startTime: start,
      endTime: end,
      loops: Math.floor(Math.random() * 5) + 1 // 1-5 loops
    }
  }

  // Generate and store 5 random portions
  for (let i = 0; i < 5; i++) {
    const portion = generateRandomPortion()
    createLocalStorageItem(portion)
  }
}

export const loadLocalStorageAssociatedWithCurrentVideo = () => {
  // Get the current location
  const currentLocationCode = window.location.href.split("=")[1]

  // Load the existing local items that match the current video ID
  let itemsRelatedToLocation: PortionSettings[] = []

  // Iterate through localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    // Check if key matches our pattern and video ID
    if (key?.startsWith(`play-it-again-${currentLocationCode}`)) {
      try {
        const item = JSON.parse(localStorage.getItem(key))
        itemsRelatedToLocation.push(item)
      } catch (e) {
        console.error("Error parsing localStorage item:", e)
      }
    }
  }

  console.log("Items related:", itemsRelatedToLocation)

  return itemsRelatedToLocation
}

export const isExistingItem = () => {}

export const createLocalStorageItem = (portionSettings: PortionSettings) => {
  // Check isExistingItem

  const currentLocation = window.location
  const videoId = `${currentLocation.href.split("=")[1]}-${portionSettings.startTime}:${portionSettings.endTime}`

  const newItem: LocalStorageItem = {
    ...portionSettings,
    id: videoId
  }

  console.log(newItem)

  localStorage.setItem(
    `play-it-again-${currentLocation.href.split("=")[1]}-${portionSettings.startTime}:${portionSettings.endTime}`,
    JSON.stringify(newItem)
  )
}

export const deleteStorage = () : void => {
  const currentLocationCode = window.location.href.split("=")[1]
  const keysToDelete: string[] = []

  // First collect all keys to delete
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(`play-it-again-${currentLocationCode}`)) {
      keysToDelete.push(key)
    }
  }

  // Then delete them
  keysToDelete.forEach(key => {
    localStorage.removeItem(key)
  })
}
