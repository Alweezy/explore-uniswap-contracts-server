const Web3 = require('web3')
const { factoryABI } = require("./../utils/uniswap-factory-abi")
const { exchangeABI } = require("./../utils/uniswap-echange-abi")

const mainNetFactoryAddress = process.env.MAIN_NET_CONTRACT_ADDRESS
const mainNetGateWayUrl = process.env.ALCHEMY_GATEWAY_URL
const mainNetDaiTokenAddress = process.env.MAINNET_DAI_TOKEN_ADDRESS

const provider = new Web3.providers.HttpProvider(mainNetGateWayUrl)
const web3 = new Web3(provider);
const factoryContract = new web3.eth.Contract(factoryABI, mainNetFactoryAddress)

const fetchAllTransactions = async(tokenAddress) => {
  try {
    // Get the exchange address associated with ERC 20 token
    exchangeAddress = await factoryContract.methods.getExchange(mainNetDaiTokenAddress).call();
    const exchangeContract = new web3.eth.Contract(exchangeABI, exchangeAddress)
    console.log('fetching events ...')
    const events = await exchangeContract.getPastEvents('allEvents',{
    fromBlock: 0x44aa20,
    toBlock: 0x8a8c5d
    })
  const knownEventTokens = exchangeContract.options.jsonInterface.filter((token) => {
    return token.type === 'event';
  });
  const promises = events.map(history => {
    console.log('history.returnValues', history.returnValues)
    const eventType = history.event
    let ethValue = 0
    switch(eventType) {
      case 'TokenPurchase':
        history.returnValues.eth_sold
        break
      case 'AddLiquidity':
        ethValue = history.returnValues.eth_amount
        break
      case 'EthPurchase':
        history.returnValues.eth_bought
        break
      case 'Approval':
        break
      default:
        break
    }
    return {
      event: history.event, 
      trxnHash: history.transactionHash, 
      blockNo: history.blockNumber, 
      toAddress: history.address,
      ethValue: ethValue
    }
  })
  const data = await Promise.all(promises)
  return data
  } catch (error) {
    throw(error)
  }
}

module.exports = {
  fetchAllTransactions
}