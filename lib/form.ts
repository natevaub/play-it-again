import type { PortionSettings } from "~types/types"


export const validatePortion = (portion: PortionSettings) => {
  return (
    portion.startTime && portion.endTime && portion.startTime < portion.endTime
  )
}