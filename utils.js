const { isMatch } = require('lodash');

const getTaskDefinition = async ({ ecs, family }) => {
  try {
    const { taskDefinition } = await ecs.describeTaskDefinition({ taskDefinition: family })
      .promise();

    return taskDefinition;
  } catch (e) {
    return null;
  }
};

const registerTaskDefinition = async ({ ecs, taskDefinition: params }) => {
  const { taskDefinition } = await ecs.registerTaskDefinition(params).promise();

  return taskDefinition;
};

const removeTaskDefinitions = async ({ ecs, family }) => {
  let nextToken;

  /* eslint no-await-in-loop: "off" */
  do {
    const { taskDefinitionArns, nextToken: nt } = await ecs
      .listTaskDefinitions({ familyPrefix: family })
      .promise();

    const promises = taskDefinitionArns.map(task => ecs
      .deregisterTaskDefinition({ taskDefinition: task })
      .promise());

    await Promise.all(promises);

    nextToken = nt;
  } while (nextToken);
};

const configChanged = (prevTask, task) => !isMatch(prevTask, task);

module.exports = {
  getTaskDefinition,
  registerTaskDefinition,
  removeTaskDefinitions,
  configChanged,
};
