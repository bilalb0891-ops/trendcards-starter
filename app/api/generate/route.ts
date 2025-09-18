import { NextRequest, NextResponse } from 'next/server';

type GenerateBody = {
  topic?: string;
  url?: string;
  audience: 'beginner' | 'pro' | 'both';
  tone: 'neutral' | 'optimistic' | 'critical';
  primaryColor?: string;
  secondaryColor?: string;
};

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateBody;
  const { topic, url, audience = 'both', tone = 'neutral' } = body;

  if (!topic && !url) {
    return NextResponse.json(
      { error: 'Provide either topic or url' },
      { status: 400 }
    );
  }

  const noApi = !process.env.ABACUS_API_KEY || !process.env.ABACUS_ROUTE_API_URL;
  if (noApi) {
    // Demo response so you can test before adding keys
    const demo = {
      cards: [
        {
          title: 'Punjab’s “AI” Driving Test Car: Progress or PR?',
          body:
            'A smart car will now judge driving tests—no human examiner. Promised: transparency and instant results. Critical questions: Who audits the model? What’s the appeals process? Where’s the privacy policy for facial/fingerprint data?'
        },
        {
          title: 'What Happened',
          body:
            '• AI-powered test vehicle with multiple cameras, facial recognition, and fingerprint scan.\n• Auto-checks basics: seatbelt, handbrake; gives instructions + timer.\n• Auto-fail example: reverse gear used more than once.\n• Lahore first; province-wide rollout planned this fiscal year.'
        },
        {
          title: 'Why It Matters',
          body:
            '• Upside: less bribery, more consistent scoring.\n• Risks: false fails on edge cases; bias if poorly calibrated.\n• Black‑box decisions reduce trust without audits.\n• Biometric privacy: who stores face/fingerprint data and for how long?\n• Maintenance: heat/dust can degrade sensors.\nPublish rubric + error rates.'
        },
        {
          title: 'Numbers / Timeline',
          body:
            '• First deployment: Lahore\n• Planned fleet: 200 vehicles this fiscal year\n• Sensors: 4 external cameras + facial recognition + fingerprint scanner\n• Results: instant; no manual input'
        },
        {
          title: 'Takeaways / Next Steps',
          body:
            '• Publish test rubric + calibration and error rates\n• Independent audit + bias checks\n• Clear appeals process with human override\n• Biometric policy: purpose, retention, deletion\n• Pilot openly; release findings before scaling'
        }
      ],
      sources: [
        {
          title: 'ProPakistani: AI-based driving test car',
          url: 'https://propakistani.pk/2025/09/12/punjab-launches-pakistans-first-ai-based-driving-test-car/'
        }
      ],
      caption_linkedin:
        'Punjab is rolling out an AI-driven car to automate driving tests. Before scaling, publish the rubric, calibration/error rates, and a clear appeals + biometric data policy, or “AI fairness” becomes a black box.',
      caption_instagram:
        'AI is coming to driving tests in Punjab. Cool idea—unless it fails without transparency. Where’s the audit, appeals process, and data policy?',
      hashtags: [
        '#Punjab',
        '#Pakistan',
        '#Lahore',
        '#RoadSafety',
        '#AI',
        '#GovTech',
        '#DigitalPakistan',
        '#TrafficPolice',
        '#Biometrics',
        '#Privacy',
        '#AlgorithmicAccountability',
        '#PublicPolicy'
      ]
    };
    return NextResponse.json(demo);
  }

  // Live mode (use Abacus.AI RouteLLM APIs)
  const sys = `You create concise, fact-checked 5-card carousels for Instagram/LinkedIn with tight copy and sources. Respect length: each card body ≤ ~80 words or 3 short bullets. If uncertain, mark as "Developing".`;

  try {
    const res = await fetch(process.env.ABACUS_ROUTE_API_URL as string, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ABACUS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: sys },
          {
            role: 'user',
            content:
              `Create a 5-card carousel based on:\n` +
              `topic: ${topic || '(none)'}\nurl: ${url || '(none)'}\n` +
              `audience: ${audience}\ntone: ${tone}\n` +
              `Return strict JSON with keys: cards (5), sources (2-4), caption_linkedin, caption_instagram, hashtags (8-12).`
          }
        ],
        max_tokens: 1200,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json(
        { error: 'LLM request failed', details: txt },
        { status: 500 }
      );
    }

    const data = await res.json();

    let parsed: any;
    try {
      parsed = typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.output ??
        data?.content ??
        '';
      parsed = JSON.parse(content);
    }

    if (!Array.isArray(parsed?.cards) || parsed.cards.length !== 5) {
      return NextResponse.json(
        { error: 'Invalid LLM output', raw: parsed },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Server error', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
