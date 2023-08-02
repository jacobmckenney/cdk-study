import { Stack, StackProps } from "aws-cdk-lib";
import * as ECR from "aws-cdk-lib/aws-ecr";
import * as ECS from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";
import { LambdaStack } from "./lambda";

export class AwsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const lambda = new LambdaStack(this, "lambda-stack");

        const cluster = new ECS.Cluster(this, "cdk-test-cluster");

        const ecr = ECR.Repository.fromRepositoryName(this, "ecr", "jacobmck");

        // const certificate = CM.Certificate.fromCertificateArn(this, "certificate", "ex: certificate arn");

        // Create ECS service with previously built and pushed image
        new ApplicationLoadBalancedFargateService(this, "cdk-test-service", {
            cluster,
            // Valid CPU/Memory combinations:
            // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html
            cpu: 256,
            memoryLimitMiB: 512,
            desiredCount: 1,
            taskImageOptions: {
                image: ECS.ContainerImage.fromEcrRepository(ecr, "latest"),
                containerPort: 80,
            },
            listenerPort: 80,
            publicLoadBalancer: true,
            // certificate
        });
    }
}
