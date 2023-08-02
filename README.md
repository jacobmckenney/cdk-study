# CDK Study

Learning how to use cdk to declare maintainable sets of aws resources and properly wire them together to create entire cloud systems.

## AWSStack

Setup a load balanced elastic container service fargate cluster with
a simple Dockerized container - Wrote a github actions script to, build, tag, and push the container when Dockerfile is changed

## LambdaStack

Setup a set of resources to kick off a pipeline of actions in AWS. Very simple pipeline for learning how to wire s3, sns, sqs, and lambda together primarily through event-based actions.
