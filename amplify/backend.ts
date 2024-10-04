/*import { defineBackend } from "@aws-amplify/backend";
import {
  StartingPosition,
  Function as LambdaFunction,
  Runtime as LambdaRuntime,
} from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { Stack } from "aws-cdk-lib";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { lambdaCodeFromAssetHelper, BuildMode } from "./backend.utils";
import path from "path";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 
const backend = defineBackend({
  auth,
  data,
  storage,
});

const productTable = backend.data.resources.tables["Product"];

const dataStack = Stack.of(backend.data);

const myLambda = new LambdaFunction(dataStack, "MyCustomFunction", {
  handler: "index.handler",
  code: lambdaCodeFromAssetHelper(
    path.resolve("amplify/functions/create-stripe-product/handler.ts"),
    { buildMode: BuildMode.Esbuild }
  ),
  runtime: LambdaRuntime.NODEJS_20_X,
  environment: {
    PRODUCT_TABLE_NAME: productTable.tableName,
  },
});

const eventSource = new DynamoEventSource(productTable, {
  startingPosition: StartingPosition.LATEST,
});

myLambda.addEventSource(eventSource);

myLambda.role?.attachInlinePolicy(
  new Policy(Stack.of(productTable), "DynamoDBPolicy", {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [productTable.tableArn],
      }),
    ],
  })
);

const stripeSecureKeyArn = `arn:aws:ssm:${Stack.of(myLambda).region}:${
  Stack.of(myLambda).account
}:parameter/stripe/STRIPE_SECURE_KEY`;

myLambda.role?.attachInlinePolicy(
  new Policy(Stack.of(myLambda), "SSMPolicy", {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["ssm:GetParameter"],
        resources: [stripeSecureKeyArn],
      }),
    ],
  })
);*/

import { defineBackend } from "@aws-amplify/backend";
import {
  StartingPosition,
  Function as LambdaFunction,
  Runtime as LambdaRuntime,
} from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { auth } from "./auth/resource"; // Ensure this file exports the auth resources correctly
import { data } from "./data/resource"; // Ensure this file exports the data resources correctly
import { storage } from "./storage/resource"; // Ensure this file exports the storage resources correctly
import { Stack } from "aws-cdk-lib";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { lambdaCodeFromAssetHelper, BuildMode } from "./backend.utils";
import path from "path";

// Define the backend
const backend = defineBackend({
  auth,
  data,
  storage,
});

// Get the product table
const productTable = backend.data.resources.tables["Product"];
const dataStack = Stack.of(backend.data);

// Define Lambda function for creating folders in S3 upon user signup
const createUserFolderLambda = new LambdaFunction(dataStack, "CreateUserFolderLambda", {
  handler: "index.handler",
  code: lambdaCodeFromAssetHelper(
    path.resolve("amplify/functions/create-user-folder/handler.ts"), // Path to your handler file
    { buildMode: BuildMode.Esbuild }
  ),
  runtime: LambdaRuntime.NODEJS_20_X,
  environment: {
    BUCKET_NAME: storage.resources.buckets["YourStorageBucket"].bucketName, // Adjust to dynamically get the bucket name
  },
});

// Grant the Lambda function permissions to put objects in the S3 bucket
createUserFolderLambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["s3:PutObject"],
    resources: [`arn:aws:s3:::${storage.resources.buckets["YourStorageBucket"].bucketName}/*`], // Adjust to your storage bucket ARN
  })
);

// Attach the Lambda to the Post Confirmation trigger of the user pool
const userPool = backend.auth.resources.userPools["MyUserPool"]; // Reference your existing User Pool
userPool.addTrigger('PostConfirmation', createUserFolderLambda); // Set the Post Confirmation trigger

// Define the existing Lambda function for product-related operations
const myLambda = new LambdaFunction(dataStack, "MyCustomFunction", {
  handler: "index.handler",
  code: lambdaCodeFromAssetHelper(
    path.resolve("amplify/functions/create-stripe-product/handler.ts"),
    { buildMode: BuildMode.Esbuild }
  ),
  runtime: LambdaRuntime.NODEJS_20_X,
  environment: {
    PRODUCT_TABLE_NAME: productTable.tableName,
  },
});

// Create a DynamoDB event source for myLambda
const eventSource = new DynamoEventSource(productTable, {
  startingPosition: StartingPosition.LATEST,
});

// Add the event source to myLambda
myLambda.addEventSource(eventSource);

// Add permissions to myLambda for DynamoDB operations
myLambda.role?.attachInlinePolicy(
  new Policy(Stack.of(productTable), "DynamoDBPolicy", {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
        ],
        resources: [productTable.tableArn],
      }),
    ],
  })
);

// Permissions for retrieving the Stripe secure key
const stripeSecureKeyArn = `arn:aws:ssm:${Stack.of(myLambda).region}:${Stack.of(myLambda).account}:parameter/stripe/STRIPE_SECURE_KEY`;

myLambda.role?.attachInlinePolicy(
  new Policy(Stack.of(myLambda), "SSMPolicy", {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["ssm:GetParameter"],
        resources: [stripeSecureKeyArn],
      }),
    ],
  })
);

