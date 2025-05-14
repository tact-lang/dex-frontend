import { FC, PropsWithChildren } from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { ThemeProvider as ChakraUIProvider } from '@/styles/snippets/ThemeProvider'

type TAppProvidersProps = PropsWithChildren

const AppProviders: FC<TAppProvidersProps> = ({ children }) => {
  return (
    <ChakraUIProvider>
      <TonConnectUIProvider manifestUrl='/tonconnect-manifest.json'>
        {children}
      </TonConnectUIProvider>
    </ChakraUIProvider>
  )
}

export { AppProviders }
