import { createSystem, defaultConfig } from '@chakra-ui/react'

export const chakraTheme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: { heading: { value: 'JetBrains Mono' }, body: { value: 'JetBrains Mono' } },
      colors: {},
    },
  },
})
