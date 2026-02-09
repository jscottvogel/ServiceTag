import { defineFunction } from '@aws-amplify/backend';

export const analyzeAsset = defineFunction({
    name: 'analyze-asset',
    timeoutSeconds: 60, // Give enough time for Bedrock call
    environment: {
        // Add environment variables if needed
    }
});
