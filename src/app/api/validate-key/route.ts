import { NextRequest, NextResponse } from 'next/server';

const PROVIDER_ENDPOINTS: Record<string, string> = {
  gemini: '', // handled separately
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  grok: 'https://api.x.ai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json({ valid: false, error: 'Missing parameters' }, { status: 400 });
    }

    let valid = false;

    if (provider === 'gemini') {
      // Retry up to 2 times for transient failures
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Reply with exactly one word: valid' }] }],
            }),
            signal: AbortSignal.timeout(15000),
          });
          if (resp.ok) { valid = true; break; }
          // Rate limited or server error — retry after delay
          if (resp.status === 429 || resp.status >= 500) {
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
            continue;
          }
          // Other errors (401, 403) — don't retry
          break;
        } catch {
          if (attempt < 2) await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    } else {
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
        signal: AbortSignal.timeout(15000),
      });
      valid = resp.ok;
    }

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
