import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface RequestBody {
    prompt: string;
    duration?: number;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Parse request body
        const body: RequestBody = JSON.parse(event.body || '{}');
        const { prompt, duration = 10 } = body;

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required' }),
            };
        }

        // Get API token from environment variable
        const HF_TOKEN = process.env.HF_TOKEN;
        if (!HF_TOKEN) {
            console.error('HF_TOKEN environment variable is not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error' }),
            };
        }

        console.log(`Generating music with prompt: "${prompt}", duration: ${duration}s`);

        // Call Hugging Face API
        const response = await fetch(
            'https://api-inference.huggingface.co/models/facebook/musicgen-small',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_length: duration * 50, // Approximate tokens per second
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Hugging Face API error: ${response.status} - ${errorText}`);

            // Handle model loading state
            if (response.status === 503) {
                return {
                    statusCode: 503,
                    body: JSON.stringify({
                        error: 'Model is loading, please try again in a moment',
                        retryAfter: 20
                    }),
                };
            }

            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `API error: ${response.status}` }),
            };
        }

        // Get audio blob
        const audioBlob = await response.arrayBuffer();

        // Return audio as base64
        const base64Audio = Buffer.from(audioBlob).toString('base64');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow CORS
            },
            body: JSON.stringify({
                audio: base64Audio,
                contentType: 'audio/wav',
            }),
        };

    } catch (error) {
        console.error('Error in generate-music function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }),
        };
    }
};

export { handler };
