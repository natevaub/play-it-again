export type PortionSettings = {
    portionTitle: string
    startTime: number
    endTime: number
    loops: number
}

export type LocalStorageItem = PortionSettings & {
    id: string
}
