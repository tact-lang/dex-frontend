export interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  description: string
  default?: string
}

export interface JettonMetadata {
  name: string
  symbol: string
  decimals: number
  description?: string
  image?: string
}

export interface JettonFormData extends JettonMetadata {
  [key: string]: string | number | undefined
}
