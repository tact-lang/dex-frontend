import { Box, Flex } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Main } from './Main'

type TLayoutProps = PropsWithChildren

const Layout: FC<TLayoutProps> = ({ children }) => {
  return (
    <Box backgroundColor={'#0d1014'} data-testid="layout">
      <Flex
        minHeight={'100vh'}
        flexDirection={'column'}
        maxW={'1200px'}
        margin={'auto'}
        data-testid="layout-container"
      >
        <Header />
        <Main>{children}</Main>
        <Footer />
      </Flex>
    </Box>
  )
}

export { Layout }
