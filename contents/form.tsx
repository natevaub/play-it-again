import { useEffect, useState } from "react"

import type { PortionSettings } from "~types/types"
import { createLocalStorageItem } from "~lib/storage"
import { validatePortion } from "~lib/form"

// This is a commit farming message

interface CreationFormProps {
  onSubmit?: () => void
}

export const CreationForm = ({ onSubmit }: CreationFormProps) => {
  console.log("CreationForm component mounted")
  
  const [portion, setPortion] = useState<PortionSettings>({
    portionTitle: "",
    startTime: 0,
    endTime: 0,
    loops: 0
  })

  // Add useEffect to log changes
  useEffect(() => {
    console.log("Form state changed:", portion)
  }, [portion])

  const [error, setError] = useState<string>("")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with:", portion)
    
    if (!validatePortion(portion)) {
      console.log("Validation failed")
      setError("Invalid portion settings. Start time must be less than end time.")
      return
    }

    try {
      console.log("Attempting to create localStorage item")
      createLocalStorageItem(portion)
      setError("")
      // Reset form
      setPortion({
        portionTitle: "",
        startTime: 0,
        endTime: 0,
        loops: 0
      })
      console.log("Form reset and onSubmit callback called")
      // Call the onSubmit callback if provided
      onSubmit?.()
    } catch (err) {
      console.error("Error creating item:", err)
      setError("Failed to save portion. Please try again.")
    }
  }

  const handleChange = (field: keyof PortionSettings, value: string | number) => {
    console.log(`Field ${field} changed to:`, value)
    setPortion(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <input
        placeholder="Portion Title"
        type="string"
        value={portion.portionTitle}
        onChange={(e) => handleChange('portionTitle', e.target.value)}
        className="p-2 border rounded"
      />
      <input
        placeholder="Start Time (seconds)"
        type="number"
        value={portion.startTime}
        onChange={(e) => handleChange('startTime', Number(e.target.value))}
        className="p-2 border rounded"
      />
      <input
        placeholder="End Time (seconds)"
        type="number"
        value={portion.endTime}
        onChange={(e) => handleChange('endTime', Number(e.target.value))}
        className="p-2 border rounded"
      />
      <input
        placeholder="Number of Loops"
        type="number"
        value={portion.loops}
        onChange={(e) => handleChange('loops', Number(e.target.value))}
        className="p-2 border rounded"
      />
      <button 
        type="submit" 
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Add Portion
      </button>
    </form>
  )
}
