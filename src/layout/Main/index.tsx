import { Flex } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'

type TMainProps = PropsWithChildren

const Main: FC<TMainProps> = ({ children }) => {
  return (
    <Flex
      flex={1}
      as={'main'}
      data-testid="main"
    >
      {children}
    </Flex>
  )
}

export { Main }
