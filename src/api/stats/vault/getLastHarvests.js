const { getLastHarvest } = require('../../../utils/getLastHarvest');
const vaultStrats = require('../../../data/vaultStrats.json');

var lastHarvest = [];

const lastHarvests = async () => {
  var promises = []
  vaultStrats.forEach(vs => promises.push(getLastHarvest(vs["vaultAddr"],vs["stratAddr"])));
  lastHarvest = await Promise.all(promises);
  console.log("sssss")
  return lastHarvest;
};


module.exports = lastHarvests;
