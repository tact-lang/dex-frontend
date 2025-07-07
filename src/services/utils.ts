import { Address, TonClient } from '@ton/ton'

async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

const tonSleep = () => sleep(300)

export async function waitForContractDeploy(address: Address, client: TonClient) {
  let isDeployed = false
  let maxTries = 15
  while (!isDeployed && maxTries > 0) {
    maxTries--
    isDeployed = await client.isContractDeployed(address)
    if (isDeployed) return
    await sleep(3000)
  }

  throw new Error('Transaction failed!')
}

const getSeqno = async (walletAddress: Address, client: TonClient) => {
  const stack = await client.runMethod(walletAddress, `seqno`)
  return stack.stack.readBigNumber()
}

export async function waitForSeqno(walletAddress: Address, client: TonClient) {
  const seqnoBefore = await getSeqno(walletAddress, client)

  for (let attempt = 0; attempt < 15; attempt++) {
    await tonSleep()
    const seqnoAfter = await getSeqno(walletAddress, client)
    if (seqnoAfter > seqnoBefore) return
  }
  throw new Error('Timeout waiting for seqno!')
}

export const getLastTxLt = async (walletAddress: Address, client: TonClient) => {
  const lastTx = await client.getContractState(walletAddress)

  return lastTx.lastTransaction!.lt
}

export async function waitForNewLastTx(walletAddress: Address, client: TonClient, lastTx?: string) {
  const lastTxLtBefore =
    typeof lastTx === 'undefined' ? await getLastTxLt(walletAddress, client) : lastTx
  console.log(lastTxLtBefore)

  for (let attempt = 0; attempt < 15; attempt++) {
    await tonSleep()
    const lastTxLtAfter = await getLastTxLt(walletAddress, client)
    if (lastTxLtAfter !== lastTxLtBefore) return
    console.log('new', lastTxLtAfter)
  }
  throw new Error('Timeout waiting for new last transaction!')
}
