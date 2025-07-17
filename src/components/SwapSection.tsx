import React from 'react';
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Token } from '../services/dex';

interface SwapSectionProps {
  title: string;
  token: Token | null;
  amount: string;
  onAmountChange: (value: string) => void;
  onTokenSelect: () => void;
  balance: string;
  isBalanceClickable?: boolean;
  onBalanceClick?: () => void;
  placeholder?: string;
  slippageInfo?: string;
  getTokenLogoSrc: (token: Token) => string;
}

export const SwapSection: React.FC<SwapSectionProps> = ({
  title,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  balance,
  isBalanceClickable = false,
  onBalanceClick,
  slippageInfo,
}) => {
  const defaultInputStyle = {
    border: "1px solid",
    borderColor: "gray.200",
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 'md',
    borderBottomRightRadius: 'md',
    _focus: { border: "1px solid", borderColor: "gray.200", borderLeftWidth: 0, boxShadow: "none", outline: "none" },
    _focusVisible: { border: "1px solid", borderColor: "gray.200", borderLeftWidth: 0, boxShadow: "none", outline: "none" },
    _hover: { borderColor: "gray.300", borderLeftWidth: 0 },
  };

  const defaultButtonStyle = {
    border: "1px solid",
    borderColor: "gray.200",
    borderRightWidth: 0,
    borderTopLeftRadius: "md",
    borderBottomLeftRadius: "md",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    _focus: { border: "1px solid", borderColor: "gray.200", borderRightWidth: 0, boxShadow: "none" },
    _focusVisible: { border: "1px solid", borderColor: "gray.200", borderRightWidth: 0, boxShadow: "none" },
    _hover: { borderColor: "gray.300", borderRightWidth: 0 },
  };
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight={"medium"} fontSize={16}>{title}</Text>
        <Text fontSize="sm" color="gray.500">
          Balance: {isBalanceClickable ? (
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              onClick={onBalanceClick}
            >
              {balance}
            </Text>
          ) : (
            balance
          )}
        </Text>
      </Flex>
      <Flex align="center">
        <Button
          onClick={onTokenSelect}
          variant="outline"
          h="16"
          p={3}
          justifyContent="flex-start"
          minW="140px"
          {...defaultButtonStyle}
        >
          {token ? (
            <Flex align="center" gap={2}>
              <Image
                src={token.logo}
                w={10}
                h={10}
                borderRadius="full"
              />
              <Box textAlign="left">
                <Text fontWeight="bold" fontSize="sm">{token.symbol}</Text>
                <Text fontSize="xs" color="gray.500">{token.name}</Text>
              </Box>
            </Flex>
          ) : (
            <Text color="gray.500" fontSize="sm">Select token</Text>
          )}
        </Button>
        <Stack gap={2} flex={1} align="stretch">
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0"
            fontSize="2xl"
            h="16"
            textAlign="right"
            {...defaultInputStyle}
          />
        </Stack>
      </Flex>

      <Text 
            fontSize="xs" 
            color="gray.500" 
            textAlign="right"
            visibility={slippageInfo ? "visible" : "hidden"}
            height="16px"
            lineHeight="16px"
          >
            {slippageInfo || ""}
          </Text>
    </Box>
  );
};