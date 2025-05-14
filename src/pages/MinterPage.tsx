import { FC } from 'react'
import { MinterForm } from '@/components/MinterForm'

const MinterPage: FC = () => {
  return (
    <div>
      <h1>Mint Tokens</h1>
      <MinterForm />
    </div>
  )
}

export { MinterPage }
