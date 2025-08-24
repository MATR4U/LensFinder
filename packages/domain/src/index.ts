export type Budget = {
  target: number
  isFlexible: boolean
}

export type Priorities = {
  portability: number
  lowLight: number
  zoom: number
}

export type RecommendationRequest = {
  lensMount: string
  budget: Budget
  useCases: string[]
  priorities: Priorities
}

export type Lens = {
  id: string
  name: string
  brand: string
  lensMount: string
  price: number
  weight: number
  minFocalLength: number
  maxFocalLength: number
  maxAperture: number
  isWeatherSealed: boolean
  hasImageStabilization: boolean
  isMacro: boolean
  imageUrl?: string | null
}

export type ScoredLens = Lens & {
  overallScore: number
  portabilityScore: number
  lowLightScore: number
  zoomScore: number
  valueScore: number
  tags?: string[]
}

export type RecommendationResponse = ScoredLens[]
