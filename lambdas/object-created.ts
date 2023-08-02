import { Handler, SQSEvent } from "aws-lambda";

export const handler: Handler<SQSEvent> = async (event, context) => {
    for (const record of event.Records) {
        // Each record's body should be an s3 object creation event
    }
    console.log("object created", JSON.stringify(event));
};
