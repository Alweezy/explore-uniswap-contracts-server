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
  // console.log('events fetched ...', events.slice(0, 10))
  // {
  //   address: '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667',
  //   blockHash: '0xd471ba004ff51ab9ed19c56a9ea8fe21071f016008ffcb11bf4d58f0c7756f83',
  //   blockNumber: 8958002,
  //   logIndex: 200,
  //   removed: false,
  //   transactionHash: '0x38f936f036edf9e0dfcf27fc2cff1e0a96da48ee071112242f71b797e6368cd0',
  //   transactionIndex: 57,
  //   id: 'log_ba61e2df',
  //   returnValues: Result {
  //     '0': '0x249de01F2dCdf1B679C4EFd88524Ee93a01A1CDf',
  //     '1': '268443095738089154',
  //     '2': '47273317829376463961',
  //     provider: '0x249de01F2dCdf1B679C4EFd88524Ee93a01A1CDf',
  //     eth_amount: '268443095738089154',
  //     token_amount: '47273317829376463961'
  //   },
  //   event: 'AddLiquidity',
  //   signature: '0x06239653922ac7bea6aa2b19dc486b9361821d37712eb796adfd38d81de278ca',
  //   raw: { data: '0x', topics: [Array] }
  // },
  console.log('transactions --->', events.slice(0, 30))
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