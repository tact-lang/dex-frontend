import { Address, TonClient } from '@ton/ton'
import { Factory } from './wrappers/DEX_Factory'
import { TonVault } from './wrappers/DEX_TonVault'
import { JettonVault } from './wrappers/DEX_JettonVault'
import { AmmPool } from './wrappers/DEX_AmmPool'
import { toaster } from '@/components/ui/toaster'

const DEX_FACTORY_ADDRESS = Address.parse('EQDR9j1SuiGtbSi7NZNgNwlDPIWZFEN5BLMz6AOd-IpGuslM')

const TON_VAULT_ADDRESS = Address.parse('EQDTsG5OoAbrtTRpYMHlmqDXwI9mj3Iv-wj-NNrNf0BDG-zD')

export const getFactory = async (ton: TonClient) => {
  try {
    const factoryState = await ton.provider(DEX_FACTORY_ADDRESS).getState()

    if (factoryState.state.type === 'uninit') {
      throw new Error('Factory contract is not initialized')
    }

    const factory = ton.open(Factory.fromAddress(DEX_FACTORY_ADDRESS))

    return factory
  } catch (_) {
    toaster.create({
      title: 'Error',
      description: 'Failed to get DEX factory',
      type: 'error',
    })
    throw new Error('Failed to get DEX factory')
  }
}

export const getTonVault = async (ton: TonClient) => {
  try {
    const vaultState = await ton.provider(TON_VAULT_ADDRESS).getState()

    if (vaultState.state.type === 'uninit') {
      throw new Error('TON Vault contract is not initialized')
    }

    const tonVault = ton.open(TonVault.fromAddress(TON_VAULT_ADDRESS))
    return tonVault
  } catch (_) {
    toaster.create({
      title: 'Error',
      description: 'Failed to get TON Vault',
      type: 'error',
    })
    throw new Error('Failed to get TON Vault address')
  }
}

export const getJettonVaultFromAddress = async (ton: TonClient, jettonVaultAddress: Address) => {
  try {
    const vaultState = await ton.provider(jettonVaultAddress).getState()

    if (vaultState.state.type === 'uninit') {
      throw new Error('Jetton Vault contract is not initialized')
    }

    const jettonVault = ton.open(JettonVault.fromAddress(jettonVaultAddress))
    return jettonVault
  } catch (e) {
    toaster.create({
      title: 'Error',
      description: 'Failed to get Jetton Vault',
      type: 'error',
    })
    throw new Error('Failed to get Jetton Vault address')
  }
}

export const getAmmPoolFromAddress = async (ton: TonClient, ammPoolAddress: Address) => {
  try {
    const ammState = await ton.provider(ammPoolAddress).getState()

    if (ammState.state.type === 'uninit') {
      throw new Error('Jetton Vault contract is not initialized')
    }

    const ammPool = ton.open(AmmPool.fromAddress(ammPoolAddress))
    return ammPool
  } catch (_) {
    toaster.create({
      title: 'Error',
      description: 'AMM Pool for this pair of assets is not initialized',
      type: 'error',
    })
    throw new Error('Failed to get Jetton Vault address')
  }
}
