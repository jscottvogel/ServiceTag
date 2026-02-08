
import {
    BedrockRuntimeClient,
    InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event: any) => {
    try {
        const { imageBase64 } = event.arguments || event; // Support AppSync or direct invocation

        if (!imageBase64) {
            return { error: 'No image provided' };
        }

        // Clean base64 string if it has data URI prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `You are an expert AI assistant for identifying assets and their maintenance requirements.
        Analyze the provided image (which may be a product label, a QR code, or the product itself).
        Extract or infer the following information:
        1. Manufacturer Name
        2. Model Number
        3. Serial Number (if visible)
        4. Category (e.g. Vehicle, Appliance, Tool, Electronics)
        5. A likely URL to the official manual or a search URL for it.
        6. A list of standard maintenance tasks for this specific product or its category.
        7. Typical warranty information.

        Return strictly valid JSON with no markdown formatting. The JSON structure must be:
        {
            "manufacturer": "string",
            "model": "string",
            "serialNumber": "string or null",
            "category": "string",
            "manualUrl": "string",
            "maintenanceTasks": [
                { "taskName": "string", "frequency": "string", "description": "string" }
            ],
            "warrantyInfo": "string"
        }`;

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2000,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: "image/jpeg",
                                data: base64Data
                            }
                        },
                        {
                            type: "text",
                            text: prompt
                        }
                    ]
                }
            ]
        };

        const command = new InvokeModelCommand({
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: new TextEncoder().encode(JSON.stringify(payload))
        });

        const response = await client.send(command);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const content = responseBody.content[0].text;

        // Attempt to parse JSON significantly better by finding the first { and last }
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Failed to parse JSON from AI response");
        }

        const result = JSON.parse(jsonMatch[0]);
        return result;

    } catch (error) {
        console.error("Error analyzing asset:", error);
        return { error: "Failed to analyze asset", details: (error as Error).message };
    }
};
