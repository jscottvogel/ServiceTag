import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { analyzeAsset } from './functions/analyze-asset/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
    auth,
    data,
    storage,
    analyzeAsset,
});

// Grant permission to invoke Bedrock models
backend.analyzeAsset.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        actions: ['bedrock:InvokeModel'],
        resources: ['*'], // Allow invoking any available model
    })
);

export { backend };
