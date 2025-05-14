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
    >
      <Image
        src={logo}
        height={9}
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
        >
          GitHub
        </Link>
        <Button
          height={9}
          onClick={open}
        >
          Connect wallet
        </Button>
        {/* <TonConnectButton /> */}
      </Flex>
    </Flex>
  )
}

export { Header }
