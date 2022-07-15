const contracts = require('./abi.json');

/**
 * Returns contract template metadata needed for deployment
 * @param {string} templateId
 * @returns {{
 * id:number,
 * name:string,
 * isUpgradeable:boolean,
 * initializer:string,
 * address:string,
 * abi:any[],
 * bytecode:string
 * }}
 */
module.exports = (templateId) => {
  if (!contracts[templateId]) throw new Error('Requested unsupported contract id');
  return contracts[templateId];
};
