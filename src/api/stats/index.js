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
    
    let apys = {};

    console.log('index', 'BEFORE:', Date.now());

    // Fortube
    const [resSimple, resExtended] = await Promise.all([
      axios.get(process.env.FORTUBE_REQ_TOKENS),
      axios.get(process.env.FORTUBE_REQ_MARKETS, { headers: {authorization: process.env.FORTUBE_API_TOKEN}})
    ]);

    Object.values(resSimple.data).map(item => {
      const symbol = item.symbol.toLowerCase();
      const apy = compound(parseFloat(item.estimated_ar), process.env.FORTUBE_HPY, 1, 0.95);
      apys[`fortube-${symbol}`] = apy;
    });

    resExtended.data.data.map(item => {
      apys[`fortube-${item.token_symbol.toLowerCase()}`] += parseFloat(item.deposit_interest_rate);
    });

    console.log('index', 'FORTUBE:', Date.now());

    const [fryApys, cakeApy, cakeLpApy, syrupApy] = await Promise.all([
      getFryApys(), 
      getBaseCakeApy(), 
      getCakeLpApys(), 
      getCakeApys()
    ]);
  
    console.log('index', 'AFTER:', Date.now());

    // Compound
    apys['fry-burger-v2'] = compound(fryApys.burger, process.env.FRY_HPY, 1, 0.95);
    
    apys['cake-cake'] = compound(cakeApy, process.env.CAKE_HPY, 1, 0.94);

    apys['cake-cake-bnb'] = compound(cakeLpApy['cake-cake-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-busd-bnb'] = compound(cakeLpApy['cake-busd-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-usdt-busd'] = compound(cakeLpApy['cake-usdt-busd'], process.env.CAKE_LP_HPY, 1, 0.955);
    apys['cake-btcb-bnb'] = compound(cakeLpApy['cake-btcb-bnb'], process.env.CAKE_LP_HPY, 1, 0.955);
    
    apys['cake-hard'] = compound(syrupApy['cake-hard'], process.env.CAKE_HPY, 1, 0.94);    
    apys['cake-broobee'] = compound(syrupApy['cake-broobee'], process.env.CAKE_HPY, 1, 0.94);
    apys['cake-stax'] = compound(syrupApy['cake-stax'], process.env.CAKE_HPY, 1, 0.94);

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
