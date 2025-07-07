const DEPLOYMENT_STEPS = [
  {
    id: 'prepare',
    label: 'Preparing deployment',
    status: 'pending',
  },
  {
    id: 'external',
    label: 'Sending external message',
    status: 'pending',
  },
  {
    id: 'deploy',
    label: 'Deploying Jetton Minter',
    status: 'pending',
  },
  {
    id: 'mint',
    label: 'Minting initial supply',
    status: 'pending',
  },
] as const

type StepId = (typeof DEPLOYMENT_STEPS)[number]['id']

export { DEPLOYMENT_STEPS }
export type { StepId }
