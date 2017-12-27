require('babel-register')();
const MochaReflow = require('./mocha-reflow').default;
const reflowProps = require('./props');
const decache = require('decache');

const path = require('path');

let vmRunner;
let mochaReflowInstance;

const typesToPush = ["suite", "hook"];

const pushToMocha = ({ path }) => {
  mochaReflowInstance.files.push(path);
};

const executeSubTree = function(combination) {
  const suites = [].concat(combination.suites);
  suites.forEach(executeSuites);
}

const executeSuites = function(branch) {
  if(typesToPush.includes(branch.type)) {
    return pushToMocha(branch);
  }

  return executeSubTree(branch);
}


const executeTree = function({combination, mochaConfig, flowDetails, DAG, jobDetails}, done) {

  const {
    require: mochaRequiredFiles,
    reporterOptions,
    ...mochaRestConfigs
  } = mochaConfig


  mochaRequiredFiles.forEach(mod => {
    require(mod);
  })

  global.reflow = reflowProps;
  const mochaReflowConfig = Object.assign({
    ui: 'reflow-bdd',
    reporter: 'reflow-reporter',
    reporterOptions: {
      ...(reporterOptions||{}),
      batch: true,
      flowDetails: {
        ...(reporterOptions.flowDetails||{}),
        ...flowDetails,
        DAG,
      },
      jobDetails: {
        ...(reporterOptions.jobDetails||{}),
        ...jobDetails,
      },
    },
  }, mochaRestConfigs);

  mochaReflowInstance = new MochaReflow(mochaReflowConfig);

  const suites = [].concat(combination.suites);

  suites.forEach(executeSuites);

  mochaReflowInstance.run(failures => {
    mochaReflowInstance.files.forEach(decache)
    global.reflow.teardown()

    setTimeout(() => done(failures), 1000)
  })
}




module.exports = executeTree
