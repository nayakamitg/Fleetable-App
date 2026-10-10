import Config from 'react-native-config';

const parseClaudeJson = (text: string) => {
  try {
    // Attempt to extract JSON from markdown code blocks if present
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing Claude JSON:', error);
    throw error;
  }
};

export const analyzeTireWithClaude = async (base64Image: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Config.CLAUDE_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analyze this tire image and return ONLY valid JSON: ' +
                  '{ pressure: "32 PSI || null", LNSD:number || 0,RNSD:number || 0,CNSD:number || 0, issues: "reason all the issues || null", safe: true || false } ' +
                  'CNSD is center depth of tire (mm) || LNSD is left side depth of tire (mm) || RNSD is right side depth of tire (mm) AND if tire is not visible { error: "Tire is not visible something like this" }',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Claude Response:', data);

    if (data?.error?.message?.includes('image exceeds 5 MB maximum')) {
      return {
        error:
          'Image size is too large (Claude 5MB limit). Please try a smaller or more compressed image.',
      };
    }

    const text = data?.content
      ?.filter((c: any) => c.type === 'text')
      ?.map((c: any) => c.text)
      ?.join('\n');

    if (!text) return { error: 'Empty AI response' };

    return parseClaudeJson(text);
  } catch (error: any) {
    if (error?.message?.includes('Network request failed')) {
      return { error: 'Please check your internet connection' };
    }
    console.error('Claude tire analysis error:', error);
    return { error: error?.message || 'AI request failed' };
  }
};

export const analyzeFuelWithClaude = async (base64Image: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Config.CLAUDE_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analyze this fuel slip image. if need tocalculate then please calculate. and return ONLY valid JSON with keys: ' +
                  '{ fuelType : "Diesel or Petrol" || null, Quantity : "in litres" || null, Price : "per litre" || null, Total : "total amount" || null, recieptNo : "reciept number" || null, Date:"dd/MM/yyyy" || null, Time:"HH:mm" || null, Vehicle : "vehicle number" || null }',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Claude Response:', data);

    // Handle API-level errors (invalid key, quota, overloaded, etc.)
    if (data?.error) {
      const apiErrMsg: string = data.error.message || 'AI API error';
      if (apiErrMsg.includes('image exceeds 5 MB maximum')) {
        throw new Error('Image size is too large (Claude 5MB limit). Please try a smaller or more compressed image.');
      }
      throw new Error(apiErrMsg);
    }

    const text =
      data?.content?.find((c: any) => c.type === 'text')?.text ||
      data?.content?.[0]?.text;

    if (!text) {
      throw new Error('Empty Claude response');
    }

    return parseClaudeJson(text);
  } catch (error: any) {
    console.log('Claude AI Error:', error);
    // Re-throw so the caller (searchFromAi) can handle with the correct error message
    throw error;
  }
};

export const analyzeNumberPlateWithClaude = async (base64Image: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Config.CLAUDE_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analyze this number plate image. Return ONLY valid JSON with keys: ' +
                  '{ numberPlate:"vehicle number", error:"error message || null" }',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Claude Response:', data);

    if (data?.error?.message?.includes('image exceeds 5 MB maximum')) {
      throw new Error(
        'Image size is too large (Claude 5MB limit). Please try a smaller or more compressed image.',
      );
    }

    const text =
      data?.content?.find((c: any) => c.type === 'text')?.text ||
      data?.content?.[0]?.text;

    if (!text) {
      throw new Error('Empty Claude response');
    }

    return parseClaudeJson(text);
  } catch (error: any) {
    console.log('Claude AI Error:', error);

    const isNetworkError = error?.message?.includes('Network request failed');
    const isSizeError =
      error?.message?.includes('image exceeds 5 MB maximum') ||
      error?.message?.includes('Image size is too large');

    const errorResult = {
      numberPlate: null,
      networkError: isNetworkError,
      error: isSizeError
        ? 'Image size is too large'
        : error?.message || 'AI request failed',
    };

    return errorResult;
  }
};
export const analyzeVehicleDamageWithClaude = async (base64Image: string) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Config.CLAUDE_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analyze this vehicle damage image. Return ONLY valid JSON with keys: ' +
                  '{ damageType:[{subject:"dent",notes:"dent description"},{subject:"scratch",notes:"scratch description"},{subject:"headlight",notes:"headlight description"}], error:"error message || null" }',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log('Claude Response:', data);

    if (data?.error?.message?.includes('image exceeds 5 MB maximum')) {
      throw new Error('Image size is too large');
    }

    const text =
      data?.content?.find((c: any) => c.type === 'text')?.text ||
      data?.content?.[0]?.text;

    if (!text) {
      throw new Error('Empty Claude response');
    }

    return parseClaudeJson(text);
  } catch (error: any) {
    console.log('Claude AI Error:', error);

    const isNetworkError = error?.message?.includes('Network request failed');
    const isSizeError =
      error?.message?.includes('image exceeds 5 MB maximum') ||
      error?.message?.includes('Image size is too large');

    const errorResult: any = {
      damageType: [],
      networkError: isNetworkError,
      error: isSizeError
        ? 'Image size is too large'
        : error?.message || 'AI request failed',
    };

    return errorResult;
  }
};
