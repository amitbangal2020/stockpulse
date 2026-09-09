import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ valid: false, error: 'Missing parameters' }, { status: 400 });
    }

    let valid = false;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const resp = await fetch(url);
      valid = resp.ok;
    } else {
      const PROVIDER_ENDPOINTS: Record<string, string> = {
        openai: 'https://api.openai.com/v1/chat/completions',
        anthropic: 'https://api.anthropic.com/v1/messages',
        grok: 'https://api.x.ai/v1/chat/completions',
        mistral: 'https://api.mistral.ai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
      };

      const endpoint = PROVIDER_ENDPOINTS[provider];
      if (!endpoint) {
        return NextResponse.json({ valid: false, error: 'Unknown provider' }, { status: 400 });
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (provider === 'openai' || provider === 'grok' || provider === 'mistral' || provider === 'openrouter') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      if (provider === 'anthropic') {
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
      }
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://abanti.in';
      }

      const body =
        provider === 'anthropic'
          ? {
              model,
              max_tokens: 10,
              messages: [{ role: 'user', content: 'Reply with exactly one word: valid' }],
            }
          : {
              model,
              messages: [{ role: 'user', content: 'Reply with exactly one word: valid' }],
              max_tokens: 10,
            };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      valid = resp.ok;
    }

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
