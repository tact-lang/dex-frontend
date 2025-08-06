import React, { useState, useEffect, useCallback } from 'react'
import { useTonConnectUI, useTonAddress, useTonConnectModal } from '@tonconnect/ui-react'
import { useNetwork } from '../contexts/NetworkContext'
import {
  onBalanceInput,
  Token,
  fetchTonBalance,
  handleFromSwapAction,
  handleToSwapAction,
  getExchangeRate,
  onJettonAddressInput,
} from '../services/dex'
import { executeSwapWithProgress } from '../services/swap-executor'
import { SWAP_STEPS, SwapStepId, SwapStepStatus } from '../constants/swapSteps'
import TokenSelectorModal from './TokenSelectorModal'
import SwapProgress from './SwapProgress'
import SlippageSettingsDialog from './SlippageSettingsDialog'
import { SwapSection } from './SwapSection'
import TonLogo from '../assets/ton-logo.svg'
import { fromNano } from '@ton/core'
import {
  Card,
  Button,
  Box,
  Stack,
  Flex,
  Text,
  Input,
  IconButton,
  Link,
  Image,
  useDisclosure,
  InputGroup,
  DataList,
  Group,
  Dialog,
  Portal,
  CloseButton,
  HStack,
} from '@chakra-ui/react'
import { useColorModeValue } from './ui/color-mode'

const TactTokenA: Token = {
  type: 'jetton',
  address: 'kQBCzXhQNxS727KxwsHld8aVNoFpSka0Xzr3GUBOxC_l2gQM',
  balance: 0n,
  name: 'TactTokenA',
  logo: 'https://raw.githubusercontent.com/tact-lang/tact/refs/heads/main/docs/public/logomark-light.png',
  symbol: 'A',
  vaultAddress: 'EQBBWii_pqdQWcWQ9pWPC7lt1qoNngdZ9TuUMgT81TFgQpi1',
}

const mockTokens: Token[] = [
  { type: 'ton', symbol: 'TON', name: 'TON', logo: TonLogo, balance: 10000000000n },
  TactTokenA,
]

export default function Swap() {
  const [fromToken, setFromToken] = useState<Token>(mockTokens[0]!)
  const [toToken, setToToken] = useState<Token | undefined>(mockTokens[1])
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [exchangeRates, setExchangeRates] = useState({ directRate: '1', reverseRate: '1' })
  const [debouncedFromAmount, setDebouncedFromAmount] = useState('')
  const [debouncedToAmount, setDebouncedToAmount] = useState('')
  const [lastChangedField, setLastChangedField] = useState<'from' | 'to' | null>(null)

  const [tonConnectUI] = useTonConnectUI()
  const userAddress = useTonAddress()
  const { open } = useTonConnectModal()
  const { network } = useNetwork()

  const [jettonAddressStatusFrom, setJettonAddressStatusFrom] = useState<
    'error' | 'success' | undefined
  >()
  const [jettonAddressStatusTo, setJettonAddressStatusTo] = useState<
    'error' | 'success' | undefined
  >()
  const [vaultAddressFrom, setVaultAddressFrom] = useState<string | undefined>()
  const [vaultAddressTo, setVaultAddressTo] = useState<string | undefined>()
  const [tonBalance, setTonBalance] = useState<string>('0')
  const [slippage, setSlippage] = useState<number>(1)
  const [customSlippage, setCustomSlippage] = useState<string>('1')

  // Dialog states
  const {
    open: isFromTokenDialogOpen,
    onOpen: onFromTokenDialogOpen,
    onClose: onFromTokenDialogClose,
  } = useDisclosure()
  const {
    open: isToTokenDialogOpen,
    onOpen: onToTokenDialogOpen,
    onClose: onToTokenDialogClose,
  } = useDisclosure()
  const {
    open: isSettingsDialogOpen,
    onOpen: onSettingsDialogOpen,
    onClose: onSettingsDialogClose,
  } = useDisclosure()

  // Swap progress dialog state
  const [isSwapProgressOpen, setIsSwapProgressOpen] = useState(false)
  const [currentSwapStep, setCurrentSwapStep] = useState<SwapStepId>('prepare')
  const [swapStepStatuses, setSwapStepStatuses] = useState<Record<SwapStepId, SwapStepStatus>>(
    SWAP_STEPS.reduce(
      (acc, step) => ({ ...acc, [step.id]: 'pending' }),
      {} as Record<SwapStepId, SwapStepStatus>,
    ),
  )

  useEffect(() => {
    if (!userAddress || !tonConnectUI) return
    if (fromToken.type === 'ton' || (toToken && toToken.type === 'ton')) {
      fetchTonBalance({ tonConnectUI, network, setBalance: setTonBalance })
    }
  }, [userAddress, tonConnectUI, fromToken, toToken, network])

  useEffect(() => {
    if (!tonConnectUI || !toToken) return

    const isFromTokenValid =
      fromToken.type === 'ton' ||
      (fromToken.type === 'jetton' && fromToken.address && fromToken.address.trim() !== '')
    const isToTokenValid =
      toToken.type === 'ton' ||
      (toToken.type === 'jetton' && toToken.address && toToken.address.trim() !== '')

    if (!isFromTokenValid || !isToTokenValid) {
      setExchangeRates({ directRate: '1', reverseRate: '1' })
      return
    }

    const updateExchangeRate = async () => {
      const rates = await getExchangeRate({
        tonConnectUI,
        network,
        fromToken,
        toToken,
      })
      setExchangeRates(rates)
    }

    updateExchangeRate()
  }, [fromToken, toToken, tonConnectUI, network])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFromAmount(fromAmount)
    }, 150)

    return () => clearTimeout(timer)
  }, [fromAmount])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedToAmount(toAmount)
    }, 150)

    return () => clearTimeout(timer)
  }, [toAmount])

  useEffect(() => {
    if (!debouncedFromAmount || !toToken || lastChangedField !== 'from') return

    const updateToAmount = async () => {
      await onBalanceInput({
        amount: debouncedFromAmount,
        tonConnectUI,
        network,
        fromToken,
        toToken,
        swapType: 'exactIn',
        setToAmount,
        slippage,
      })
    }

    updateToAmount()
  }, [debouncedFromAmount, toToken, tonConnectUI, network, fromToken, lastChangedField, slippage])

  useEffect(() => {
    if (!debouncedToAmount || !toToken || lastChangedField !== 'to') return

    const updateFromAmount = async () => {
      await onBalanceInput({
        amount: debouncedToAmount,
        tonConnectUI,
        network,
        fromToken,
        toToken,
        swapType: 'exactOut',
        setFromAmount,
        slippage,
      })
    }

    updateFromAmount()
  }, [debouncedToAmount, toToken, tonConnectUI, network, fromToken, lastChangedField, slippage])

  const handleSwapDirection = () => {
    if (!toToken || !fromToken) return

    const tempFromToken = fromToken
    const tempToToken = toToken
    const tempFromAmount = fromAmount
    const tempToAmount = toAmount
    const tempVaultAddressFrom = vaultAddressFrom
    const tempVaultAddressTo = vaultAddressTo
    const tempJettonAddressStatusFrom = jettonAddressStatusFrom
    const tempJettonAddressStatusTo = jettonAddressStatusTo

    setFromToken(tempToToken)
    setToToken(tempFromToken)
    setFromAmount(tempToAmount)
    setToAmount(tempFromAmount)

    if (tempToToken.type === 'jetton') {
      setVaultAddressFrom(tempToToken.vaultAddress)
      setJettonAddressStatusFrom(tempJettonAddressStatusTo)
    } else {
      setVaultAddressFrom(undefined)
      setJettonAddressStatusFrom('success')
    }

    if (tempFromToken.type === 'jetton') {
      setVaultAddressTo(tempFromToken.vaultAddress)
      setJettonAddressStatusTo(tempJettonAddressStatusFrom)
    } else {
      setVaultAddressTo(undefined)
      setJettonAddressStatusTo('success')
    }

    setLastChangedField(null)
  }

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    const numericRegex = /^[0-9]*[.,]?[0-9]*$/
    if (inputValue !== '' && !numericRegex.test(inputValue)) {
      return
    }

    const val = inputValue.replace(/,/, '.')
    setFromAmount(val)
    setLastChangedField('from')
  }

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    const numericRegex = /^[0-9]*[.,]?[0-9]*$/
    if (inputValue !== '' && !numericRegex.test(inputValue)) {
      return
    }

    const val = inputValue.replace(/,/, '.')
    setToAmount(val)
    setLastChangedField('to')
  }

  const setAmountFromBalance = (fraction: number) => {
    if (!userAddress) return

    const balanceString = fromToken.type === 'ton' ? tonBalance : fromNano(fromToken.balance)
    const balance = parseFloat(balanceString.replace(',', '.'))
    if (isNaN(balance)) return

    const amount = balance * fraction
    const amountString = amount.toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 20,
    })
    setFromAmount(amountString)
    setLastChangedField('from')
  }

  const setAmountFromToBalance = (fraction: number) => {
    if (!userAddress || !toToken) return

    const balanceString = toToken.type === 'ton' ? tonBalance : fromNano(toToken.balance)
    const balance = parseFloat(balanceString.replace(',', '.'))
    if (isNaN(balance)) return

    const amount = balance * fraction
    const amountString = amount.toLocaleString('en-US', {
      useGrouping: false,
      maximumFractionDigits: 20,
    })
    setToAmount(amountString)
    setLastChangedField('to')
  }

  const handleFromTokenSelect = (token: Token) => {
    setFromToken(token)
    setFromAmount('')
    setToAmount('')
    setLastChangedField(null)
    // console.log(token)

    if (token.type === 'jetton') {
      setVaultAddressFrom(token.vaultAddress)
    } else {
      setVaultAddressFrom(undefined)
    }
  }

  const handleToTokenSelect = (token: Token) => {
    setToToken(token)
    setFromAmount('')
    setToAmount('')
    setLastChangedField(null)
    // console.log(token)

    if (token.type === 'jetton') {
      setVaultAddressTo(token.vaultAddress)
    } else {
      setVaultAddressTo(undefined)
    }
  }

  // Functions for swap progress management
  const updateStepStatus = useCallback((stepId: SwapStepId, status: SwapStepStatus) => {
    setSwapStepStatuses((prev) => ({ ...prev, [stepId]: status }))
  }, [])

  const setCurrentStep = useCallback((stepId: SwapStepId) => {
    setCurrentSwapStep(stepId)
  }, [])

  const resetSwapProgress = useCallback(() => {
    setSwapStepStatuses(
      SWAP_STEPS.reduce(
        (acc, step) => ({ ...acc, [step.id]: 'pending' }),
        {} as Record<SwapStepId, SwapStepStatus>,
      ),
    )
    setCurrentSwapStep('prepare')
  }, [])

  const handleSwap = async () => {
    if (!toToken) return

    setSwapping(true)
    setIsSwapProgressOpen(true)
    resetSwapProgress()

    try {
      const swapType = lastChangedField === 'to' ? 'exactOut' : 'exactIn'
      const amount = lastChangedField === 'to' ? toAmount : fromAmount

      await executeSwapWithProgress(
        tonConnectUI,
        fromToken,
        toToken,
        amount,
        slippage,
        swapType,
        updateStepStatus,
        setCurrentStep,
      )
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setSwapping(false)
    }
  }

  const handleCloseSwapProgress = () => {
    setIsSwapProgressOpen(false)
    resetSwapProgress()
  }

  const formatBalanceForDisplay = (token: Token) => {
    if (!userAddress) return '0'
    let balanceStr = '0'
    if (token.type === 'ton') {
      balanceStr = tonBalance
    } else {
      if (token.balance === 0n) return '0.0000'
      balanceStr = fromNano(token.balance)
    }
    const balance = parseFloat(balanceStr)
    if (isNaN(balance)) return '0.0000'
    // show more precision for small balances
    return balance.toFixed(balance > 0 && balance < 0.0001 ? 8 : 4)
  }

  const isBalanceClickable = (token: Token) => {
    if (!userAddress) return false
    const balanceStr = formatBalanceForDisplay(token)
    return balanceStr !== '0' && balanceStr !== '0.0000'
  }

  const calculateMinAmountWithSlippage = (amount: string, slippagePercent: number) => {
    if (!amount || amount === '0' || amount === '') return '0'
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return '0'
    const minAmount = numAmount * (1 - slippagePercent / 100)
    return minAmount.toFixed(minAmount > 0 && minAmount < 0.0001 ? 8 : 4)
  }

  const calculateMaxAmountWithSlippage = (amount: string, slippagePercent: number) => {
    if (!amount || amount === '0' || amount === '') return '0'
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return '0'
    const maxAmount = numAmount * (1 + slippagePercent / 100)
    return maxAmount.toFixed(maxAmount > 0 && maxAmount < 0.0001 ? 8 : 4)
  }

  const getTonViewerLink = (token: Token) => {
    if (token.type === 'ton') {
      // For TON we use TON Vault address
      return `https://testnet.tonviewer.com/EQDTsG5OoAbrtTRpYMHlmqDXwI9mj3Iv-wj-NNrNf0BDG-zD`
    } else if (token.type === 'jetton' && token.address) {
      return `https://testnet.tonviewer.com/${token.address}`
    }
    return null
  }

  const getTokenLogoSrc = (token: Token) => {
    if (token.logo) return token.logo
    if (token.type === 'ton') return TonLogo
    return 'https://raw.githubusercontent.com/tact-lang/tact/refs/heads/main/docs/public/logomark-light.svg'
  }

  const { directRate, reverseRate } = exchangeRates

  const handleQuickTest = async () => {
    try {
      // Clear state
      setFromAmount('')
      setToAmount('')
      setLastChangedField(null)

      // Load first token
      await onJettonAddressInput({
        address: 'kQBCzXhQNxS727KxwsHld8aVNoFpSka0Xzr3GUBOxC_l2gQM',
        tonConnectUI,
        network,
        setVaultAddress: setVaultAddressFrom,
        onSelect: handleFromTokenSelect,
      })

      // Load second token
      await onJettonAddressInput({
        address: 'kQDO8Rt30nYL8RbXOWWMCqY3E4o-mN-tum0MTlABiFTDtz2p',
        tonConnectUI,
        network,
        setVaultAddress: setVaultAddressTo,
        onSelect: handleToTokenSelect,
      })

      setJettonAddressStatusFrom('success')
      setJettonAddressStatusTo('success')
    } catch (error) {
      console.error('Error in quick test:', error)
      setJettonAddressStatusFrom('error')
      setJettonAddressStatusTo('error')
    }
  }

  return (
    <Card.Root
      variant='subtle'
      p={6}
      data-testid='swap-card'
    >
      <Flex
        justify='space-between'
        align='center'
        mb={6}
      >
        <Card.Header p={0}>
          <Text
            fontSize='xl'
            fontWeight='bold'
          >
            Swap
          </Text>
        </Card.Header>
        <Flex gap={2}>
          <IconButton
            aria-label='Settings'
            onClick={onSettingsDialogOpen}
            variant='ghost'
            size='sm'
            border='none'
            _focus={{ border: 'none', boxShadow: 'none' }}
            _focusVisible={{ border: 'none', boxShadow: 'none' }}
            data-testid='settings-button'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </IconButton>
          <Button
            onClick={handleQuickTest}
            colorScheme='blue'
            size='sm'
            display='none'
          >
            Quick Test
          </Button>
        </Flex>
      </Flex>

      <Stack
        gap={4}
        align='stretch'
      >
        <SwapSection
          title='You send'
          token={fromToken}
          amount={fromAmount}
          onAmountChange={(value) =>
            handleFromAmountChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)
          }
          onTokenSelect={onFromTokenDialogOpen}
          balance={formatBalanceForDisplay(fromToken)}
          isBalanceClickable={isBalanceClickable(fromToken)}
          onBalanceClick={() => setAmountFromBalance(1)}
          getTokenLogoSrc={getTokenLogoSrc}
          slippageInfo={
            lastChangedField === 'to' && toAmount && toToken
              ? `Max amount to pay: ${calculateMaxAmountWithSlippage(fromAmount, slippage)} ${fromToken.symbol}`
              : undefined
          }
        />

        <Flex justify='center'>
          <IconButton
            aria-label=''
            onClick={handleSwapDirection}
            // variant="outline"
            size='md'
            borderRadius='full'
            bg='white'
            border='none'
            _hover={{ transform: 'rotate(180deg)' }}
            _focus={{ border: 'none', boxShadow: 'none' }}
            _focusVisible={{ border: 'none', boxShadow: 'none' }}
            transition='all 0.3s ease'
            data-testid='swap-direction-button'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M8 7L12 3M12 3L16 7M12 3V21M16 17L12 21M12 21L8 17'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </IconButton>
        </Flex>

        <SwapSection
          title='You receive'
          token={toToken || null}
          amount={toAmount}
          onAmountChange={(value) =>
            handleToAmountChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)
          }
          onTokenSelect={onToTokenDialogOpen}
          balance={toToken ? formatBalanceForDisplay(toToken) : '-'}
            isBalanceClickable={toToken ? isBalanceClickable(toToken) : false}
            onBalanceClick={() => setAmountFromToBalance(1)}
          getTokenLogoSrc={getTokenLogoSrc}
          placeholder='0'
          slippageInfo={
            lastChangedField === 'from' && toAmount && toToken
              ? `Min amount to receive: ${calculateMinAmountWithSlippage(toAmount, slippage)} ${toToken.symbol}`
              : undefined
          }
        />
      </Stack>
      <Box
        mt={6}
        p={4}
        borderRadius='md'
        data-testid='price-info'
      >
        {toToken ? (
          <DataList.Root orientation='horizontal'>
            <DataList.Item>
              <DataList.ItemLabel>Price</DataList.ItemLabel>
              <DataList.ItemValue>
                1 {fromToken.symbol} = {directRate} {toToken.symbol}
              </DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>Reverse Price</DataList.ItemLabel>
              <DataList.ItemValue>
                1 {toToken.symbol} = {reverseRate} {fromToken.symbol}
              </DataList.ItemValue>
            </DataList.Item>
          </DataList.Root>
        ) : null}
      </Box>

      <Button
        onClick={userAddress ? handleSwap : open}
        disabled={Boolean(swapping || (userAddress && (!toToken || !fromAmount || !toAmount)))}
        loading={swapping}
        loadingText='Swapping...'
        colorPalette='blue'
        size='lg'
        width='full'
        mt={6}
        border='none'
        _focus={{ border: 'none', boxShadow: 'none' }}
        _focusVisible={{ border: 'none', boxShadow: 'none' }}
        data-testid='swap-button'
      >
        {!userAddress
          ? 'Connect Wallet'
          : !toToken
            ? 'Select a token'
            : !fromAmount || !toAmount
              ? 'Enter an amount'
              : 'Swap'}
      </Button>

      <SwapProgress
        isOpen={isSwapProgressOpen}
        onClose={handleCloseSwapProgress}
        currentStep={currentSwapStep}
        stepStatuses={swapStepStatuses}
        fromTokenSymbol={fromToken.symbol}
        toTokenSymbol={toToken?.symbol}
        amount={lastChangedField === 'to' ? toAmount : fromAmount}
        fromAmount={fromAmount}
        toAmount={toAmount}
      />

      {/* Token selection dialogs */}
      <TokenSelectorModal
        isOpen={isFromTokenDialogOpen}
        onClose={onFromTokenDialogClose}
        tokens={mockTokens}
        onSelect={handleFromTokenSelect}
        setJettonAddressStatus={setJettonAddressStatusFrom}
        setVaultAddress={setVaultAddressFrom}
        selectedToken={toToken}
      />

      <TokenSelectorModal
        isOpen={isToTokenDialogOpen}
        onClose={onToTokenDialogClose}
        tokens={mockTokens}
        onSelect={handleToTokenSelect}
        setJettonAddressStatus={setJettonAddressStatusTo}
        setVaultAddress={setVaultAddressTo}
        selectedToken={fromToken}
      />

      {/* Settings Dialog */}
      <SlippageSettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={onSettingsDialogClose}
        slippage={slippage}
        onSlippageChange={setSlippage}
        customSlippage={customSlippage}
        onCustomSlippageChange={setCustomSlippage}
      />
    </Card.Root>
  )
}
