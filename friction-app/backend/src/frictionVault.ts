import { DurableObject } from "cloudflare:workers";

export interface Env {
    FRICTION_VAULT: DurableObjectNamespace;
    AI: any;
}

export interface SessionData {
    comment: string;
    articleText: string;
    quiz: Quiz;
    attempts: number;
    solved: boolean;
}

export interface Quiz {
    questions: Question[];
}

export interface Question {
    id: number;
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export class FrictionVault extends DurableObject {
    state: DurableObjectState;

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === "/create-session" && request.method === "POST") {
            return this.createSession(request);
        } else if (path === "/verify-answers" && request.method === "POST") {
            return this.verifyAnswers(request);
        } else if (path === "/get-comment" && request.method === "GET") {
            return this.getComment(request);
        }

        return new Response("Not Found", { status: 404 });
    }

    async createSession(request: Request): Promise<Response> {
        const data = await request.json() as { comment: string; articleText: string; quiz: Quiz };

        const session: SessionData = {
            comment: data.comment,
            articleText: data.articleText,
            quiz: data.quiz,
            attempts: 0,
            solved: false
        };

        await this.state.storage.put("session", session);
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    async verifyAnswers(request: Request): Promise<Response> {
        const { answers } = await request.json() as { answers: number[] };
        const session = await this.state.storage.get<SessionData>("session");

        if (!session) {
            return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
        }

        session.attempts += 1;

        // Verify answers
        let allCorrect = true;
        if (answers.length !== session.quiz.questions.length) {
            allCorrect = false;
        } else {
            for (let i = 0; i < session.quiz.questions.length; i++) {
                if (answers[i] !== session.quiz.questions[i].correctOptionIndex) {
                    allCorrect = false;
                    break;
                }
            }
        }

        if (allCorrect) {
            session.solved = true;
            await this.state.storage.put("session", session);
            return new Response(JSON.stringify({ success: true, comment: session.comment }), { headers: { "Content-Type": "application/json" } });
        } else {
            await this.state.storage.put("session", session);
            return new Response(JSON.stringify({ success: false, message: "Incorrect answers. Please try again." }), { headers: { "Content-Type": "application/json" } });
        }
    }

    async getComment(request: Request): Promise<Response> {
        const session = await this.state.storage.get<SessionData>("session");
        if (!session || !session.solved) {
            return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
        }
        return new Response(JSON.stringify({ comment: session.comment }), { headers: { "Content-Type": "application/json" } });
    }
}
