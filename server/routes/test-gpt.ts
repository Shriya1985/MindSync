import { RequestHandler } from "express";

export const testGPTConnection: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.json({
        status: "error",
        message: "❌ OpenAI API key not configured",
        instructions: "Set OPENAI_API_KEY environment variable with your OpenAI API key"
      });
    }

    // Test API connection with a simple request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello! GPT integration is working!" in exactly those words.' }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.json({
        status: "error",
        message: "❌ OpenAI API connection failed",
        error: error,
        suggestions: [
          "Check if your API key is valid",
          "Ensure you have billing set up on OpenAI account",
          "Verify you have sufficient credits"
        ]
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    res.json({
      status: "success",
      message: "✅ GPT integration working perfectly!",
      response: aiResponse,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    res.json({
      status: "error",
      message: "❌ Test failed",
      error: error.message,
      instructions: "Check server logs for detailed error information"
    });
  }
};
