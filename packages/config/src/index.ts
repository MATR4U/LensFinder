export type ServiceConfig = {
  recommenderUrl: string
}

export function readServiceConfig(): ServiceConfig {
  const recommenderUrl = process.env.RECOMMENDER_URL || 'http://localhost:3100'
  return { recommenderUrl }
}
