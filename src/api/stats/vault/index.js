const getLastHarvests = require('./getLastHarvests');

async function lastHarvest(ctx) {
  try {
    const lastHarvestTime = await getLastHarvests();

    ctx.status = 200;
    ctx.body = lastHarvestTime;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { lastHarvest };
