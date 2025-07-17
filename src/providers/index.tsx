import { FC, PropsWithChildren } from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { Toaster } from '@/components/ui/toaster'
import { Provider } from '@/components/ui/provider'

// This manifest is used by @tonconnect/ui-react to connect to TON wallet
const manifestUrl = 'https://raw.githubusercontent.com/ton-blockchain/minter/main/public/tonconnect-manifest.json'

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Provider>
        {children}
        <Toaster />
      </Provider>
    </TonConnectUIProvider>
  )
}
