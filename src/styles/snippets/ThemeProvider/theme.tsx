import { createSystem, defaultConfig } from '@chakra-ui/react'

export const chakraTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: { heading: { value: 'var(--font-sans)' }, body: { value: 'var(--font-sans)' } },
      colors: {},
    },
  },
})
