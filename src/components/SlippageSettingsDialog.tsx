import React from 'react'
import {
  Dialog,
  Portal,
  CloseButton,
  Button,
  Stack,
  Box,
  Text,
  Group,
  Input,
  HStack,
} from '@chakra-ui/react'
import { useColorModeValue } from './ui/color-mode'

interface SlippageSettingsDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog should close */
  onClose: () => void
  /** Current slippage value */
  slippage: number
  /** Callback when slippage changes */
  onSlippageChange: (value: number) => void
  /** Current custom slippage input value */
  customSlippage: string
  /** Callback when custom slippage input changes */
  onCustomSlippageChange: (value: string) => void
}

/**
 * Dialog component for configuring slippage tolerance settings
 */
export default function SlippageSettingsDialog({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
  customSlippage,
  onCustomSlippageChange,
}: SlippageSettingsDialogProps) {
  const bgColor = useColorModeValue('white', 'gray.800')

  const handleCustomSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onCustomSlippageChange(value)
      if (value !== '') {
        const numValue = parseFloat(value)
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
          onSlippageChange(numValue)
        }
      }
    }
  }

  const handleCustomSlippageBlur = () => {
    if (customSlippage === '') {
      onSlippageChange(1)
      onCustomSlippageChange('1')
    } else {
      const numValue = parseFloat(customSlippage)
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
        onSlippageChange(numValue)
      } else {
        // Reset to default if invalid value
        onCustomSlippageChange('1')
        onSlippageChange(1)
      }
    }
  }

  const handlePresetSlippageClick = (preset: number) => {
    onSlippageChange(preset)
    onCustomSlippageChange(preset.toString())
  }

  return (
    <Dialog.Root
      open={isOpen}
      placement="center"
      onOpenChange={({ open }) => !open && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner backdropFilter="blur(4px)">
          <Dialog.Content maxW="md" mx={4} bg={bgColor} data-testid="slippage-settings-dialog">
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={3}>
                    Max Slippage
                  </Text>
                  <Group attached w={'full'}>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      bg="gray.50"
                      px={3}
                      py={2}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRightWidth={0}
                      borderTopLeftRadius="md"
                      borderBottomLeftRadius="md"
                      display="flex"
                      alignItems="center"
                      minW="fit-content"
                    >
                      Slippage
                    </Text>
                    <Input
                      type="text"
                      value={customSlippage}
                      onChange={handleCustomSlippageChange}
                      onBlur={handleCustomSlippageBlur}
                      placeholder={'1'}
                      size="md"
                      flex={1}
                      textAlign="center"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius={0}
                      _focus={{
                        borderColor: 'gray.200',
                        boxShadow: '0 0 0 1px gray.200',
                      }}
                      data-testid="slippage-input"
                    />
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      bg="gray.50"
                      px={3}
                      py={2}
                      border="1px solid"
                      borderColor="gray.200"
                      borderLeftWidth={0}
                      borderTopRightRadius="md"
                      borderBottomRightRadius="md"
                      display="flex"
                      alignItems="center"
                      minW="fit-content"
                    >
                      %
                    </Text>
                  </Group>
                  {/* Preset slippage chips */}
                  <HStack gap={3} mt={3} mb={2} justifyContent="flex-end">
                    {[0.5, 1, 3, 5].map((preset) => {
                      const isSelected = slippage === preset
                      return (
                        <Button
                          key={preset}
                          size="md"
                          variant={isSelected ? 'solid' : 'outline'}
                          colorPalette="gray"
                          bg={isSelected ? 'white' : 'transparent'}
                          color={isSelected ? 'black' : 'white'}
                          borderColor="white"
                          onClick={() => handlePresetSlippageClick(preset)}
                          fontSize="sm"
                          fontWeight="semibold"
                          px={4}
                          py={2}
                          h="auto"
                          minH="36px"
                          borderWidth="2px"
                          _hover={{
                            transform: 'translateY(-1px)',
                            bg: isSelected ? 'whiteAlpha.900' : 'whiteAlpha.200',
                            color: isSelected ? 'black' : 'white',
                          }}
                          transition="all 0.2s"
                          data-testid={`slippage-preset-${preset}`}
                        >
                          {preset}%
                        </Button>
                      )
                    })}
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Your transaction will revert if the price changes unfavorably
                    by more than this percentage.
                  </Text>
                </Box>
              </Stack>
            </Dialog.Body>
            <Dialog.CloseTrigger top="0" insetEnd="-12" asChild>
              <CloseButton bg="bg" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Footer>
              <Button
                onClick={onClose}
                colorPalette="blue"
                border="none"
                _focus={{ border: 'none', boxShadow: 'none' }}
                _focusVisible={{ border: 'none', boxShadow: 'none' }}
                data-testid="slippage-done-button"
              >
                Done
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}