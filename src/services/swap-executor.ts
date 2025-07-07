import { TonConnectUI } from '@tonconnect/ui-react'
import { Address, fromNano, toNano, beginCell } from '@ton/ton'
import { SwapStepId, SwapStepStatus } from '../constants/swapSteps'
import { getTonClient } from './client'
import { getFactory, getJettonVaultFromAddress, getAmmPoolFromAddress } from './dex-factory'
import { JettonMinter } from './wrappers/Jetton_JettonMinter'
import {
  JettonWalletFeatureRich,
  storeJettonTransfer,
} from './wrappers/FeatureRich_JettonWalletFeatureRich'
import { createJettonVaultSwapRequest } from './dex-utils'
import { getLastTxLt, waitForNewLastTx, waitForSeqno } from './utils'

export type UpdateStepStatus = (stepId: SwapStepId, status: SwapStepStatus) => void
export type SetCurrentStep = (stepId: SwapStepId) => void

export type Token = {
  type: 'ton' | 'jetton'
  symbol: string
  name: string
  logo: string
  balance: bigint
  address?: string
  vaultAddress?: string
}

export async function executeSwapWithProgress(
  tonConnectUI: TonConnectUI,
  fromToken: Token,
  toToken: Token,
  amount: string,
  slippage: number,
  swapType: 'exactIn' | 'exactOut',
  updateStepStatus: UpdateStepStatus,
  setCurrentStep: SetCurrentStep,
) {
  try {
    // Step 1: Prepare
    setCurrentStep('prepare')
    updateStepStatus('prepare', 'loading')

    const tonClient = getTonClient('testnet')
    const factory = await getFactory(tonClient)

    const jettonVault = await getJettonVaultFromAddress(
      tonClient,
      Address.parse(fromToken.vaultAddress!),
    )
    const vaultFrom = jettonVault
    const vaultTo = await getJettonVaultFromAddress(tonClient, Address.parse(toToken.vaultAddress!))

    if (!vaultFrom || !vaultTo) {
      updateStepStatus('prepare', 'error')
      throw new Error('Failed to get pools for tokens')
    }

    const ammPoolAddress = await factory.getAmmPoolAddr(vaultFrom.address, vaultTo.address)
    const ammPool = await getAmmPoolFromAddress(tonClient, ammPoolAddress)

    const userWalletAddress = tonConnectUI.account?.address
    if (!userWalletAddress) {
      updateStepStatus('prepare', 'error')
      throw new Error('User wallet not connected')
    }

    const userAddress = Address.parse(userWalletAddress)

    if (fromToken.type === 'ton') {
      updateStepStatus('prepare', 'error')
      throw new Error('TON swaps not implemented yet')
    }

    const jettonMaster = tonClient.open(JettonMinter.fromAddress(Address.parse(fromToken.address!)))
    const userJettonWalletAddress = await jettonMaster.getGetWalletAddress(userAddress)
    const userJettonWallet = tonClient.open(
      JettonWalletFeatureRich.fromAddress(userJettonWalletAddress),
    )

    let amountIn: bigint
    let minAmountOut: bigint
    let swapPayloadCell

    if (swapType === 'exactIn') {
      amountIn = toNano(amount)
      const amountOut = await ammPool.getExpectedOut(vaultFrom.address, amountIn)
      minAmountOut = (amountOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n
      swapPayloadCell = createJettonVaultSwapRequest(ammPool.address, false, minAmountOut)
    } else {
      const amountOut = toNano(amount)
      amountIn = await ammPool.getNeededInToGetX(vaultTo.address, amountOut)
      const maxAmountIn = (amountIn * BigInt(Math.floor((100 + slippage) * 100))) / 10000n
      amountIn = maxAmountIn
      swapPayloadCell = createJettonVaultSwapRequest(ammPool.address, true, amountOut)
    }

    const transferMsg = beginCell()
      .store(
        storeJettonTransfer({
          $$type: 'JettonTransfer',
          amount: amountIn,
          customPayload: null,
          destination: vaultFrom.address,
          forwardPayload: swapPayloadCell.beginParse(),
          responseDestination: userAddress,
          forwardTonAmount: toNano(0.5),
          queryId: 0n,
        }),
      )
      .endCell()

    const vaultFromLastLt = await getLastTxLt(vaultFrom.address, tonClient)
    const vaultToLastLt = await getLastTxLt(vaultTo.address, tonClient)
    const userJettonWalletLastLt = await getLastTxLt(userJettonWallet.address, tonClient)

    updateStepStatus('prepare', 'success')
    setCurrentStep('confirm')
    updateStepStatus('confirm', 'loading')
    await tonConnectUI.sendTransaction({
      messages: [
        {
          payload: transferMsg.toBoc().toString('base64'),
          address: userJettonWallet.address.toString(),
          amount: toNano(1).toString(),
        },
      ],
      validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
    })

    await waitForNewLastTx(userJettonWallet.address, tonClient, userJettonWalletLastLt)
    updateStepStatus('confirm', 'success')

    // Step 3: Confirm
    setCurrentStep('execute-asset-send')
    updateStepStatus('execute-asset-send', 'loading')

    await waitForNewLastTx(vaultFrom.address, tonClient, vaultFromLastLt)

    updateStepStatus('execute-asset-send', 'success')
    setCurrentStep('execute-asset-payout')
    updateStepStatus('execute-asset-payout', 'loading')

    // Step 4: Execute asset payout
    await waitForNewLastTx(vaultTo.address, tonClient, vaultToLastLt)
    updateStepStatus('execute-asset-payout', 'success')
  } catch (error) {
    console.error('Swap failed:', error)
    updateStepStatus('confirm', 'error')
    throw error
  }
}
