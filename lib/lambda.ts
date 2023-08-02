import { Stack, StackProps } from "aws-cdk-lib";
import * as ApiGateway from "aws-cdk-lib/aws-apigateway";
import * as Lambda from "aws-cdk-lib/aws-lambda";
import * as LambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as LambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as S3 from "aws-cdk-lib/aws-s3";
import * as Notifications from "aws-cdk-lib/aws-s3-notifications";
import * as SNS from "aws-cdk-lib/aws-sns";
import * as Subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as SQS from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

// Sets up lambda function at ./lambdas/s3.ts which exposes simple get/put to s3
// with an apiGateway endpoint. Upon object creation in the s3 bucket, a message
// is sent to an sns topic which is subscribed to by an sqs queue.
// The s3 object put events are then logged out by a lambda function that is
// polling the sqs queue.

export class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new S3.Bucket(this, "lambda");

        const handler = new LambdaNode.NodejsFunction(this, "s3-interface-fn", {
            entry: "./lambdas/s3.ts",
            runtime: Lambda.Runtime.NODEJS_14_X,
            handler: "handler",
            bundling: {
                externalModules: ["aws-sdk"],
                nodeModules: ["zod"],
                minify: false,
            },
            environment: {
                BUCKET: bucket.bucketName,
            },
        });

        bucket.grantReadWrite(handler);

        const apiGateway = new ApiGateway.LambdaRestApi(this, "s3-interface-gateway", {
            handler,
        });

        const sqs = new SQS.Queue(this, "s3-interface-queue", {
            queueName: "s3-interface-queue",
        });

        const topic = new SNS.Topic(this, "s3-interface-topic");

        bucket.addObjectCreatedNotification(new Notifications.SnsDestination(topic));

        topic.addSubscription(new Subscriptions.SqsSubscription(sqs));

        // Create lambda that retrieves messages form our sqs queue and logs them
        const logObjectCreateEventLambda = new LambdaNode.NodejsFunction(this, "log-object-create-event", {
            entry: "./lambdas/object-created.ts",
            runtime: Lambda.Runtime.NODEJS_14_X,
            handler: "handler",
            bundling: {
                externalModules: ["aws-sdk"],
                minify: false,
            },
        });

        const sqsEventSource = new LambdaEventSources.SqsEventSource(sqs);

        logObjectCreateEventLambda.addEventSource(sqsEventSource);
    }
}
