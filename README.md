# awsEcsTaskDefinition

Deploy an AWS ECS Task Definition using [Serverless Component](https://github.com/serverless/components)

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)

&nbsp;

### 1. Install

```console
$ npm install -g @serverless/cli
```

### 2. Create

```console
$ touch serverless.yml .env .env.prod
```

The directory should look something like this:

```
|- serverless.yml
|- .env         # your development AWS api keys
|- .env.prod    # your production AWS api keys
```

the `.env` files are not required if you have the aws keys set globally and you want to use a single stage, but they should look like this.

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### 3. Configure

```yml
# serverless.yml

name: my-component
stage: dev

elasticSearch:
  component: "@bboure/aws-ecs-task-definition"
  inputs:
    region: ${region}
    taskDefinition:
      family: my-task
      cpu: "1024"
      memory: "2048"
      volumes:
          - name: foo
            host:
              sourcePath: /home/foo
          - name: bar
            host:
              sourcePath: /home/bar
      containerDefinitions:
          - name: myContainer
            portMappings:
              - hostPort: 80
                containerPort: 80
                protocol: tcp
            cpu: 0
            environment:
              - name: FOO
                value: BAR
            mountPoints:
              - containerPath: /var/www/foo
                sourceVolume: foo
              - containerPath: /var/www/bar
                sourceVolume: bar
            memory: 768
            image: alpine:latest
            essential: true
```

### 4. Deploy

```console
  $ components

  AwsEcsTaskDefinition:
  region: eu-west-1
  family: my-task
  arn:    arn:aws:ecs:eu-west-1:955509148573:task-definition/my-task:1

0s › AwsEcsTaskDefinition › done
```

&nbsp;

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
