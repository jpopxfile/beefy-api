'use strict';

const axios = require('axios');
const { compound } = require('../../utils/compound');
const getFryApys = require('./fry/getFryApys');
const getCakeApys = require('./pancake/getCakeApys');
const getCakeLpApys = require('./pancake/getCakeLpApys');
const getBaseCakeApy = require('./pancake/getBaseCakeApy');

const TIMEOUT = 5 * 60 * 1000;

async function apy(ctx) {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);

    const resSimple = await axios.get(process.env.FORTUBE_REQ_TOKENS);
    const resExtended = await axios.get(process.env.FORTUBE_REQ_MARKETS, {
      headers: {
        authorization: process.env.FORTUBE_API_TOKEN,
      },
    });

    const dataSimple = resSimple.data;
    const dataExtended = resExtended.data.data;

    let apys = {};

    Object.values(dataSimple).map(item => {
      const symbol = item.symbol.toLowerCase();
      const apy = compound(parseFloat(item.estimated_ar), process.env.FORTUBE_HPY, 1, 0.95);
      apys[`fortube-${symbol}`] = apy;
    });

    dataExtended.map(item => {
      apys[`fortube-${item.token_symbol.toLowerCase()}`] += parseFloat(item.deposit_interest_rate);
    });

    console.log('BEFORE:', Date.now());

    const apy = {};
    const values = await Promise.all([
      getFryApys(), 
      getBaseCakeApy(), 
      getCakeLpApys(), 
      getCakeApys()
    ]);
  
    apy.fry = values[0];
    apy.cake = values[1];
    apy.cakeLp = values[2];
    apy.syrup = values[3];
  
    console.log('AFTER:', Date.now());

    // Compound
    apys['fry-burger-v2'] = compound(apy.fry.burger, process.env.FRY_HPY, 1, 0.95);
    
    apys['cake-cake'] = compound(apy.cake, process.env.CAKE_HPY, 1, 0.94);

    apys['cake-cake-bnb'] = compound(apy.cakeLp['cake-cake-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-busd-bnb'] = compound(apy.cakeLp['cake-busd-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-usdt-busd'] = compound(apy.cakeLp['cake-usdt-busd'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-btcb-bnb'] = compound(apy.cakeLp['cake-btcb-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    
    apys['cake-hard'] = compound(apy.syrup['cake-hard'], process.env.CAKE_HPY, 1, 0.94);    
    apys['cake-broobee'] = compound(apy.syrup['cake-broobee'], process.env.CAKE_HPY, 1, 0.94);
    apys['cake-stax'] = compound(apy.syrup['cake-stax'], process.env.CAKE_HPY, 1, 0.94);

    // FIXME: deprecated pools
    apys['cake-syrup-ctk'] = 0;
    apys['cake-syrup-twt'] = 0;
    apys['cake-syrup-inj'] = 0;
    apys['thugs-drugs-guns'] = 0;

    ctx.status = 200;
    ctx.body = apys;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = { apy };
