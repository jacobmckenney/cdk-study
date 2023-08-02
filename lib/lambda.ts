import { Stack, StackProps } from "aws-cdk-lib";
import * as ApiGateway from "aws-cdk-lib/aws-apigateway";
import * as Lambda from "aws-cdk-lib/aws-lambda";
import * as S3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bucket = new S3.Bucket(this, "lambda");

        const handler = new Lambda.Function(this, "s3-interface", {
            runtime: Lambda.Runtime.NODEJS_14_X,
            code: Lambda.Code.fromAsset("lambdas"),
            handler: "s3.handler",
        });

        bucket.grantReadWrite(handler);

        const apiGateway = new ApiGateway.LambdaRestApi(this, "s3-interface", {
            handler,
        });

        apiGateway.root.addMethod("GET");
        apiGateway.root.addMethod("POST");
    }
}
