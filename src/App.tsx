import { FC } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TonConnectButton } from '@tonconnect/ui-react'
import { Box, Container, Flex } from '@chakra-ui/react'
import Swap from './components/Swap'
import './styles/App.css'
import './styles/JettonMinter.css'

export const App: FC = () => {
  return (
    <Router basename='/dex-frontend'>
      <Box
        className='app'
        minH='100vh'
        data-testid='app'
      >
        <Box
          as='nav'
          className='app-nav'
          data-testid='app-nav'
        >
          <Container maxW='container.xl'>
            <Flex
              justify='space-between'
              align='center'
              className='nav-content'
            >
              <Box className='nav-brand'>
                <Box
                  className='nav-logo'
                  data-testid='nav-logo'
                >
                  🦖 T-Dex
                </Box>
              </Box>
              <Box className='nav-links'>
                <TonConnectButton />
              </Box>
            </Flex>
          </Container>
        </Box>
        <Container
          maxW={{ base: 'full', md: 'lg' }}
          px={{ base: 0, md: 8 }}
          py={12}
          data-testid='main-container'
        >
          <Routes>
            <Route
              path='/'
              element={<Swap />}
            />
          </Routes>
        </Container>
      </Box>
    </Router>
  )
}
