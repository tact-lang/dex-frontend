import { FormField } from '../types/minter'

export const jettonFormSpec: FormField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    description: 'Full token name, can contain spaces',
    default: 'Tact Jetton',
  },
  {
    name: 'symbol',
    label: 'Symbol',
    type: 'text',
    required: true,
    description: 'Currency symbol appearing in balance in user wallets',
    default: 'SYMBOL',
  },
  {
    name: 'decimals',
    label: 'Decimals',
    type: 'number',
    required: true,
    description: 'The decimal precision of your token (9 is TON default)',
    default: '9',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    description: 'Optional sentence explaining about your project',
  },
  {
    name: 'image',
    label: 'Token Image',
    type: 'url',
    required: false,
    description: 'Token logo URL',
  },
]
