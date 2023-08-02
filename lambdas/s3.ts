import { Handler } from "aws-lambda";
import { S3 } from "aws-sdk";
import { z } from "zod";

const client = new S3({ region: "us-west-2" });

const BodySchema = z.discriminatedUnion("method", [
    z.object({ method: z.literal("GET"), parameters: z.object({ key: z.string() }) }),
    z.object({ method: z.literal("POST"), body: z.object({ key: z.string(), value: z.string() }) }),
]);

const handleGetRequest = async (bucket: string, key: string) => {
    console.log("handling get request", bucket, key);
    const params = {
        Bucket: bucket,
        Key: key,
    };
    const data = await client.getObject(params).promise();
    console.log("got s3 response", data);
    return data.Body?.toString();
};

const handlePostRequest = async (bucket: string, key: string, body: string) => {
    console.log("handling post request", bucket, key, body);
    const params = {
        Bucket: bucket,
        Key: key,
        Body: body,
    };
    const data = await client.putObject(params).promise();
    return data;
};

export const handler: Handler = async (event, context) => {
    try {
        console.log("queryParams", event.queryStringParameters);
        console.log("event", JSON.stringify(event));
        const bucket = process.env.BUCKET;
        if (!bucket) {
            return { statusCode: 500, body: "BUCKET environment variable not set" };
        }

        const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
        const rawData = {
            method: event.requestContext.http.method,
            parameters: event.queryStringParameters,
            body: JSON.parse(body),
        };
        console.log("raw", rawData);
        const parsedData = BodySchema.safeParse(rawData);
        if (!parsedData.success) {
            return { statusCode: 400, body: JSON.stringify(parsedData.error) };
        }
        const data = parsedData.data;
        console.log("data", JSON.stringify(data));

        if (data.method === "GET") {
            const { parameters } = data;
            const val = await handleGetRequest(bucket, parameters.key);
            return { statusCode: 200, body: JSON.stringify(val) };
        }
        if (data.method === "POST") {
            const {
                body: { key, value },
            } = data;
            await handlePostRequest(bucket, key, value);
            return { statusCode: 200, body: "Success" };
        }

        return { statusCode: 400, body: "Invalid HTTP Method" };
    } catch (error) {
        return { statusCode: 500, body: "Error" };
    }
};
