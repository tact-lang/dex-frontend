import React, { useState, useEffect } from 'react'
import {
  Dialog,
  Input,
  Stack,
  Box,
  Flex,
  Text,
  Image,
  Button,
  Badge,
  Separator,
} from '@chakra-ui/react'
import { useColorModeValue } from './ui/color-mode'
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { useNetwork } from '../contexts/NetworkContext'
// Removed SearchIcon import as @chakra-ui/icons is not installed
import { Token, onJettonAddressInput } from '../services/dex'
import TonLogo from '../assets/ton-logo.svg'
import JettonLogo from '../assets/jetton-logo.svg'

type Props = {
  isOpen: boolean
  onClose: () => void
  tokens: Token[]
  onSelect: (token: Token) => void
  setJettonAddressStatus?: (status: 'error' | 'success' | undefined) => void
  setVaultAddress?: (vault: string) => void
  selectedToken?: Token // Token that is already selected in the opposite field
}

// Popular tokens for quick selection
const POPULAR_TOKENS = [{ symbol: 'TON', name: 'TON', logo: TonLogo }]

export default function TokenSelectorModal({
  isOpen,
  onClose,
  tokens,
  onSelect,
  setJettonAddressStatus,
  setVaultAddress,
  selectedToken,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchedTokens, setSearchedTokens] = useState<Token[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const userAddress = useTonAddress()
  const [tonConnectUI] = useTonConnectUI()
  const { network } = useNetwork()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchedTokens([])
      setIsSearching(false)
    }
  }, [isOpen])

  const isContractAddress = (query: string): boolean => {
    const addressPattern = /^(EQ|UQ|kQ|0:)[A-Za-z0-9_-]{46,48}$/
    return addressPattern.test(query.trim())
  }

  useEffect(() => {
    if (!searchQuery.trim() || !isContractAddress(searchQuery) || !tonConnectUI) {
      setSearchedTokens([])
      setIsSearching(false)
      return
    }

    const searchToken = async () => {
      setIsSearching(true)
      try {
        const foundToken = await new Promise<Token>((resolve, reject) => {
          onJettonAddressInput({
            address: searchQuery.trim(),
            tonConnectUI,
            network,
            setVaultAddress,
            onSelect: resolve,
          }).catch(reject)
        })

        const isDuplicate = tokens.some((token) => {
          if (foundToken.type === 'jetton' && token.type === 'jetton') {
            return token.address === foundToken.address
          }
          if (foundToken.type === 'ton' && token.type === 'ton') {
            return true
          }
          return false
        })

        if (!isDuplicate) {
          setSearchedTokens([foundToken])
        } else {
          setSearchedTokens([])
        }
      } catch (error) {
        console.error('Error searching for token:', error)
        setSearchedTokens([])
        if (setJettonAddressStatus) {
          setJettonAddressStatus('error')
        }
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(searchToken, 500) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [searchQuery, tonConnectUI, network, tokens, setVaultAddress, setJettonAddressStatus])

  // Filter tokens by search query
  const filteredTokens = tokens.filter((token) => {
    if (!searchQuery) return true

    // If searching by contract address, don't show main tokens
    if (isContractAddress(searchQuery)) return false

    const query = searchQuery.toLowerCase()
    const name = token.name?.toLowerCase() || ''
    const symbol = token.symbol?.toLowerCase() || ''
    const address = token.type === 'jetton' ? token.address?.toLowerCase() || '' : ''

    return name.includes(query) || symbol.includes(query) || address.includes(query)
  })

  const allDisplayTokens = isContractAddress(searchQuery) ? searchedTokens : filteredTokens

  const handleTokenSelect = (token: Token) => {
    onSelect(token)
    onClose()
  }

  // Check if token is already selected in the opposite field
  const isTokenDisabled = (token: Token) => {
    if (!selectedToken) return false

    // For TON tokens, compare by type
    if (token.type === 'ton' && selectedToken.type === 'ton') {
      return true
    }

    // For jetton tokens, compare by address
    if (token.type === 'jetton' && selectedToken.type === 'jetton') {
      return token.address === selectedToken.address
    }

    return false
  }

  const getLogoSrc = (token: Token) => {
    if (token.logo) return token.logo
    if (token.type === 'ton') return TonLogo
    return JettonLogo
  }

  const formatBalance = (balance: bigint) => {
    if (balance === 0n) return '0'
    const balanceStr = (Number(balance) / 1e9).toString()
    const num = parseFloat(balanceStr)
    if (num < 0.0001) return '<0.0001'
    return num.toFixed(4)
  }

  const truncateAddress = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : addr

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size='md'
      placement='center'
    >
      <Dialog.Backdrop />
      <Dialog.Positioner backdropFilter={'blur(4px)'}>
        <Dialog.Content
          bg={bgColor}
          maxH='80vh'
          data-testid='token-selector-modal'
        >
          <Dialog.Header pb={2}>
            <Dialog.Title
              fontSize='xl'
              fontWeight='bold'
            >
              Select token
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.CloseTrigger />

          <Dialog.Body pb={6}>
            <Stack gap={4}>
              {/* Search */}
              <Box position='relative'>
                <Input
                  placeholder='Search token or address'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                  pl={10}
                  data-testid='token-search-input'
                />
                <Box
                  position='absolute'
                  left={3}
                  top='50%'
                  transform='translateY(-50%)'
                  pointerEvents='none'
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      fill='none'
                    />
                  </svg>
                </Box>
              </Box>

              {/* Popular */}
              {!isContractAddress(searchQuery) && (
                <Box>
                  <Flex
                    gap={2}
                    flexWrap='wrap'
                  >
                    {POPULAR_TOKENS.map((token) => {
                      const foundToken = tokens.find((t) => t.symbol === token.symbol)
                      const isDisabled = foundToken ? isTokenDisabled(foundToken) : false

                      return (
                        <Box
                          key={token.symbol}
                          as='button'
                          onClick={() => {
                            if (foundToken && !isDisabled) handleTokenSelect(foundToken)
                          }}
                          bg={
                            isDisabled
                              ? useColorModeValue('gray.50', 'gray.800')
                              : useColorModeValue('gray.100', 'gray.700')
                          }
                          _hover={
                            !isDisabled ? { bg: useColorModeValue('gray.200', 'gray.600') } : {}
                          }
                          borderRadius='full'
                          px={3}
                          py={2}
                          cursor={isDisabled ? 'not-allowed' : 'pointer'}
                          transition='all 0.2s'
                          border='1px solid'
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          opacity={isDisabled ? 0.5 : 1}
                        >
                          <Flex
                            align='center'
                            gap={2}
                          >
                            <Image
                              src={token.logo}
                              alt={token.name}
                              boxSize='20px'
                              borderRadius='full'
                            />
                            <Text
                              fontSize='sm'
                              fontWeight='medium'
                            >
                              {token.symbol}
                            </Text>
                          </Flex>
                        </Box>
                      )
                    })}
                  </Flex>
                </Box>
              )}

              <Separator />

              <Box>
                <Flex
                  align='center'
                  gap={2}
                  mb={3}
                >
                  <Text
                    fontSize='sm'
                    color='gray.500'
                    fontWeight='medium'
                  >
                    {isContractAddress(searchQuery)
                      ? 'SEARCH BY ADDRESS'
                      : userAddress
                        ? 'MY TOKENS'
                        : 'ALL TOKENS'}
                  </Text>
                </Flex>

                <Stack
                  gap={1}
                  maxH='300px'
                  overflowY='auto'
                >
                  {isSearching && isContractAddress(searchQuery) && (
                    <Flex
                      align='center'
                      justify='center'
                      p={4}
                    >
                      <Text color='gray.500'>Searching for token by address...</Text>
                    </Flex>
                  )}

                  {!isSearching &&
                    isContractAddress(searchQuery) &&
                    searchedTokens.length === 0 && (
                      <Flex
                        align='center'
                        justify='center'
                        p={4}
                      >
                        <Text color='gray.500'>Token not found or already in the list</Text>
                      </Flex>
                    )}

                  {!isSearching &&
                    !isContractAddress(searchQuery) &&
                    allDisplayTokens.length === 0 && (
                      <Flex
                        align='center'
                        justify='center'
                        p={4}
                      >
                        <Text color='gray.500'>No tokens found</Text>
                      </Flex>
                    )}

                  {!isSearching &&
                    allDisplayTokens.map((token, index) => {
                      const isDisabled = isTokenDisabled(token)

                      return (
                        <Flex
                          key={`${token.type}-${token.symbol}-${index}`}
                          align='center'
                          p={3}
                          borderRadius='md'
                          cursor={isDisabled ? 'not-allowed' : 'pointer'}
                          _hover={!isDisabled ? { bg: hoverBg } : {}}
                          onClick={() => !isDisabled && handleTokenSelect(token)}
                          border='1px solid'
                          borderColor='transparent'
                          _focus={!isDisabled ? { borderColor: 'blue.500' } : {}}
                          opacity={isDisabled ? 0.5 : 1}
                          bg={isDisabled ? useColorModeValue('gray.50', 'gray.800') : 'transparent'}
                          data-testid={`token-item-${token.symbol}`}
                        >
                          <Image
                            src={getLogoSrc(token)}
                            w={10}
                            h={10}
                            borderRadius='full'
                            mr={3}
                          />

                          <Box flex={1}>
                            <Flex
                              align='center'
                              gap={2}
                            >
                              <Text fontWeight='bold'>{token.name}</Text>
                              {searchedTokens.includes(token) && (
                                <Badge
                                  size='sm'
                                  colorScheme='green'
                                >
                                  Found
                                </Badge>
                              )}
                            </Flex>
                            <Text
                              fontSize='sm'
                              color='gray.500'
                            >
                              {token.type === 'jetton' && token.address
                                ? truncateAddress(token.address)
                                : token.symbol}
                            </Text>
                          </Box>

                          <Box textAlign='right'>
                            <Text fontWeight='bold'>{formatBalance(token.balance)}</Text>
                            <Text
                              fontSize='sm'
                              color='gray.500'
                            >
                              $0.64
                            </Text>
                          </Box>
                        </Flex>
                      )
                    })}
                </Stack>
              </Box>
            </Stack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
