const axios = require('axios');
const Web3 = require('web3');
const abi = require('../data/vaultABI.json');

const getLastHarvest = async (vaultAddr,stratAddr) => {
  const response = await axios.get('https://api.bscscan.com/api', {
    params: {
    module: 'account',
    action: 'txlist',
    address: stratAddr,
    sort: 'desc'
    },
  });

  console.log(response.status)

  var data = response.data["result"];
  console.log(stratAddr + ":" + data[0]);
  var lastTimeStamp = data[0]["timeStamp"];
  //var lastTimeStamp = data.filter(d => d["input"] === "0xde5f6268")[0]["timeStamp"];

  var result = {
    "vaultAddr" : vaultAddr,
    "stratAddr" : stratAddr,
    "lastHarvest" : lastTimeStamp
  }

  console.log(result)

  return result;
};


module.exports = {getLastHarvest};

