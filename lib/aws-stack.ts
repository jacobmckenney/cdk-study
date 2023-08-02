import { Stack, StackProps } from "aws-cdk-lib";
import * as ECS from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";

export class AwsStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const cluster = new ECS.Cluster(this, "jacob-testing-ecs-cluster");

        // // Build Docker image and push it to ECR
        // const image = new DockerImageAsset(this, "jacob-testing", {
        //     directory: "./",
        // });

        // Create ECS service with previously built and pushed image
        new ApplicationLoadBalancedFargateService(this, "jacob-testing-ecs-service", {
            cluster,
            taskImageOptions: {
                image: ECS.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
                containerPort: 80,
            },
            listenerPort: 80,
            publicLoadBalancer: true,
        });
    }
}
