import { useEffect, useState } from "react"

import type { PortionSettings } from "~types/types"

export const CreationForm = () => {
  const [portion, setPortion] = useState<PortionSettings>({
    portionTitle: "",
    startTime: null,
    endTime: null,
    loops: 0
  })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // setCurrentLoop(0)
    // setIsLooping(true)
  }

  return (
    <form
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2">
      <button type="submit" className="">
        Add Portion
      </button>
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
  )
}
