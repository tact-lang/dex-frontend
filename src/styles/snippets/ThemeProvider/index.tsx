'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from '../color-mode'
import { chakraTheme } from './theme'

export function ThemeProvider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={chakraTheme}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
