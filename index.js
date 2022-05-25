const contracts = require('./abi.json');

module.exports = (templateId) => {
  if (!contracts[templateId]) throw new Error('Requested unsupported contract id');
  return contracts[templateId];
};
