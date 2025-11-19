import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { FrictionVault, Quiz } from './frictionVault';

type Bindings = {
    FRICTION_VAULT: DurableObjectNamespace;
    AI: any;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.post('/api/submit', async (c) => {
    const { comment, articleText } = await c.req.json();

    if (!comment || !articleText) {
        return c.json({ error: 'Missing comment or article text' }, 400);
    }

    const toxicityPrompt = `
    Analyze the following comment for toxicity, aggression, or harmful content.
    Comment: "${comment}"
    
    Return ONLY a JSON object with the following format:
    {
      "isToxic": boolean,
      "reason": string
    }
  `;

    let isToxic = false;
    let toxicityReason = "";

    try {
        const aiResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
                { role: 'system', content: 'You are a content moderation AI. Output valid JSON only.' },
                { role: 'user', content: toxicityPrompt }
            ],
            response_format: { type: 'json_object' }
        });

        console.log("AI Response:", JSON.stringify(aiResponse));

        // Handle different response shapes
        let content = "";
        if (aiResponse.response) {
            content = aiResponse.response;
        } else if (typeof aiResponse === 'object') {
            // It might be the object itself if we used a specific output mode? 
            // Usually it returns { response: "generated text" }
            content = JSON.stringify(aiResponse);
        }

        // Try to parse JSON from the content
        try {
            const firstOpen = content.indexOf('{');
            const lastClose = content.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1) {
                const jsonStr = content.substring(firstOpen, lastClose + 1);
                const parsed = JSON.parse(jsonStr);
                isToxic = parsed.isToxic;
                toxicityReason = parsed.reason;
            }
        } catch (e) {
            console.error("Failed to parse AI JSON", e);
        }

    } catch (err) {
        console.error("AI Error:", err);
        // Fallback: simple keyword check
        const toxicKeywords = ["stupid", "idiot", "hate", "kill", "ugly"];
        if (toxicKeywords.some(k => comment.toLowerCase().includes(k))) {
            isToxic = true;
            toxicityReason = "Contains toxic keywords (fallback detection)";
        }
    }

    if (!isToxic) {
        return c.json({ status: 'posted', message: 'Comment posted successfully!' });
    }

    const quizPrompt = `
    Generate a reading comprehension quiz based on the following article text.
    The user is trying to post a toxic comment and must prove they read the article.
    
    Article: "${articleText.substring(0, 1000)}..." (truncated)
    
    Create 3 multiple choice questions.
    Return ONLY a JSON object with this format:
    {
      "questions": [
        {
          "id": 1,
          "text": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOptionIndex": 0 // 0-3
        },
        ...
      ]
    }
  `;

    let quiz: Quiz | null = null;
    try {
        const quizResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [
                { role: 'system', content: 'You are a teacher generating a quiz. Output valid JSON only.' },
                { role: 'user', content: quizPrompt }
            ],
            response_format: { type: 'json_object' }
        });

        let content = "";
        if (quizResponse.response) content = quizResponse.response;

        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
            const jsonStr = content.substring(firstOpen, lastClose + 1);
            quiz = JSON.parse(jsonStr);
        }
    } catch (e) {
        console.error("Quiz Gen Error", e);
    }

    // Fallback quiz
    if (!quiz) {
        quiz = {
            questions: [
                { id: 1, text: "What is the main topic?", options: ["A", "B", "C", "D"], correctOptionIndex: 0 },
                { id: 2, text: "Who is the author?", options: ["Me", "You", "AI", "Nobody"], correctOptionIndex: 2 },
                { id: 3, text: "Is this a demo?", options: ["Yes", "No", "Maybe", "Unknown"], correctOptionIndex: 0 }
            ]
        };
    }

    const id = c.env.FRICTION_VAULT.idFromName(crypto.randomUUID());
    const stub = c.env.FRICTION_VAULT.get(id);

    await stub.fetch("http://do/create-session", {
        method: "POST",
        body: JSON.stringify({ comment, articleText, quiz })
    });

    return c.json({
        status: 'blocked',
        reason: toxicityReason,
        quizId: id.toString(),
        quiz: quiz
    });
});

app.post('/api/verify', async (c) => {
    const { quizId, answers } = await c.req.json();

    if (!quizId || !answers) {
        return c.json({ error: "Missing data" }, 400);
    }

    try {
        const id = c.env.FRICTION_VAULT.idFromString(quizId);
        const stub = c.env.FRICTION_VAULT.get(id);

        const response = await stub.fetch("http://do/verify-answers", {
            method: "POST",
            body: JSON.stringify({ answers })
        });

        const data = await response.json();
        return c.json(data);
    } catch (e) {
        return c.json({ error: "Invalid Quiz ID" }, 400);
    }
});

export default app;
export { FrictionVault } from './frictionVault';
