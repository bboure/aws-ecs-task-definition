const { Component } = require('@serverless/core');
const { ECS } = require('aws-sdk');
const {
  defaultsDeep,
  every,
  values,
  reduce,
} = require('lodash');
const {
  configChanged,
  getTaskDefinition,
  registerTaskDefinition,
  removeTaskDefinitions,
} = require('./utils');

const defaults = {
  region: 'us-east-1',
  taskDefinition: {
    family: 'ecs-task',
    cpu: '1024',
    memory: '512',
    requiresCompatibilities: ['EC2'],
  },
};

// Fix arrays.
// Issue https://github.com/serverless/template/issues/1
const fixArrays = object => reduce(
  object,
  (acc, val, key) => {
    if (typeof val === 'object') {
      let newVal = fixArrays(val);
      if (every(Object.keys(newVal), v => !Number.isNaN(parseInt(v, 10)))) {
        newVal = values(newVal);
      }

      acc[key] = newVal;
    } else {
      acc[key] = val;
    }

    return acc;
  },
  {},
);


class AwsEcsTaskDefinition extends Component {
  async default(inputs = {}) {
    this.context.status('Deploying');
    const config = fixArrays(defaultsDeep(inputs, defaults));

    const ecs = new ECS({
      region: config.region,
      credentials: this.context.credentials.aws,
    });

    const taskDefinition = await getTaskDefinition({ ecs, ...config.taskDefinition });

    if (!taskDefinition || configChanged(taskDefinition, config.taskDefinition)) {
      const { taskDefinitionArn } = await registerTaskDefinition({ ecs, ...config });
      config.taskDefinition.arn = taskDefinitionArn;
    } else {
      config.taskDefinition.arn = taskDefinition.taskDefinitionArn;
    }

    const outputs = {
      region: config.region,
      family: config.taskDefinition.family,
      arn: config.taskDefinition.arn,
    };
    this.state = outputs;
    await this.save();

    return outputs;
  }

  async remove() {
    this.context.status('Removing');

    const ecs = new ECS({
      region: this.state.region,
      credentials: this.context.credentials.aws,
    });
    const taskDefinition = await getTaskDefinition({ ecs, family: this.state.family });

    if (taskDefinition) {
      await removeTaskDefinitions({ ecs, family: this.state.family });
    }

    this.state = {};
    await this.save();

    return {};
  }
}

module.exports = AwsEcsTaskDefinition;
