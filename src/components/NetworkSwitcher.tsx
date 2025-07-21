import { FC } from 'react'
import './NetworkSwitcher.css'

export type Network = 'testnet' | 'mainnet'

interface NetworkSwitcherProps {
  network: Network
  onChange: (network: Network) => void
}

export const NetworkSwitcher: FC<NetworkSwitcherProps> = ({ network, onChange }) => {
  return (
    <div className='network-switcher' data-testid="network-switcher">
      <button
        className={`network-button ${network === 'testnet' ? 'active' : ''}`}
        onClick={() => onChange('testnet')}
        data-testid="network-testnet-button"
      >
        Testnet
      </button>
      <button
        className={`network-button ${network === 'mainnet' ? 'active' : ''}`}
        onClick={() => onChange('mainnet')}
        data-testid="network-mainnet-button"
      >
        Mainnet
      </button>
    </div>
  )
}
