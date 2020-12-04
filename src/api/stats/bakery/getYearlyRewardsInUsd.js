const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const IBakeryMaster = require('../../../abis/IBakeryMaster.json');
const { getPrice } = require('../../../utils/getPrice');

const web3 = new Web3(process.env.BSC_RPC);

const oldAllocPoints = {
  '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5': 7,
  '0xc2Eed0F5a0dc28cfa895084bC0a9B8B8279aE492': 12,
  '0x6E218EA042BeF40a8baF706b00d0f0A7b4fCE50a': 8
}

const oldTotalAlloc = 320;

const getYearlyRewardsInUsd = async (bakeryMaster, asset) => {
  const currentBlock = await web3.eth.getBlockNumber();
  const bakeryMasterContract = new web3.eth.Contract(IBakeryMaster, bakeryMaster);

  const blockRewards = new BigNumber(
    await bakeryMasterContract.methods.getTotalRewardInfo(currentBlock, currentBlock + 1).call()
  );

  const totalAllocPoint = new BigNumber(
    // await bakeryMasterContract.methods.totalAllocPoint().call()
    320
  );

  // let { allocPoint } = await bakeryMasterContract.methods.poolInfoMap(asset).call();
  // allocPoint = new BigNumber(allocPoint);

  const allocPoint = new BigNumber(oldAllocPoints[asset]);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bakePrice = await getPrice('pancake', 'BAKE');
  const yearlyRewardsInUsd = yearlyRewards.times(bakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getYearlyRewardsInUsd;
