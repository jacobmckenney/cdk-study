import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
    console.log("object created", JSON.stringify(event));
};
