/* eslint-disable no-console */
const { writeFileSync } = require('fs');
const contracts = require('../index');

module.exports = async (taskArgs, hre) => {
  const { templateId, targetFile, license } = taskArgs;

  const { src } = contracts(templateId);

  const consoleLog = console.log;
  let flatSourceCode;

  // Hackish way to capture and alter log output from hardhat flatten operation. @TODO refactor
  console.log = (data) => {
    flatSourceCode = `// SPDX-License-Identifier: ${license || 'MIXED'}\n\n${data.replace(/SPDX-License-Identifier:/gm, 'License-Identifier:').trim()}`;
  };

  await hre.run('flatten', src);

  // Restore console.log
  console.log = consoleLog;

  if (targetFile) {
    writeFileSync(targetFile, flatSourceCode);
  } else {
    console.log(flatSourceCode);
  }
};
