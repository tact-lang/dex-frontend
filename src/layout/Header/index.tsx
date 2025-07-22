import { Button, Flex, Image, Link } from '@chakra-ui/react'
import { FC } from 'react'
import logo from '@/assets/logo.png'
import { useTonConnectModal } from '@tonconnect/ui-react'
// import { TonConnectButton } from '@tonconnect/ui-react'

const Header: FC = () => {
  const { open } = useTonConnectModal()

  return (
    <Flex
      as={'header'}
      height={9}
      marginTop={3.5}
      justifyContent={'space-between'}
      alignItems={'center'}
      data-testid='header'
    >
      <Image
        src={logo}
        height={9}
        data-testid='logo'
      />
      <Flex
        gap={9}
        alignItems={'center'}
      >
        <Link
          href={'https://github.com'}
          target={'_blank'}
          textDecoration={'none'}
          fontSize={16}
          transition={'color 0.15s ease-in-out'}
          color={'#99a1ad'}
          _hover={{
            color: '#E1E5EB',
          }}
          _focus={{
            outline: 'none',
          }}
          data-testid='github-link'
        >
          GitHub
        </Link>
        <Button
          height={9}
          onClick={open}
          data-testid='connect-wallet-button'
        >
          Connect wallet
        </Button>
        {/* <TonConnectButton /> */}
      </Flex>
    </Flex>
  )
}

export { Header }
