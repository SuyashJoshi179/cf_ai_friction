import React from 'react';

export const ArticleView: React.FC = () => {
    return (
        <article className="glass-panel" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>OPINION</span>
                <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Nov 19, 2025 • 5 min read</span>
            </div>

            <h1>Why AI Will Replace All Software Engineers by 2026</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333' }}></div>
                <div>
                    <div style={{ fontWeight: 600 }}>Tech Visionary</div>
                    <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Futurist & Thought Leader</div>
                </div>
            </div>

            <div className="article-content">
                <p>
                    The era of human coding is over. With the release of GPT-6 and Llama-5, we have reached a point where writing code manually is as obsolete as using a typewriter.
                    Those who cling to "clean code" and "architecture" are simply in denial.
                </p>
                <p>
                    By 2026, the role of "Software Engineer" will cease to exist. It will be replaced by "Prompt Architects" who simply guide the AI.
                    Universities should stop teaching Computer Science immediately and focus on Prompt Engineering.
                </p>
                <p>
                    The efficiency gains are too massive to ignore. A single AI can do the work of 100 senior engineers in seconds.
                    If you are still learning JavaScript today, you are wasting your time.
                </p>
                <p>
                    <em>(This is a satirical article designed to provoke a reaction for the Friction demo.)</em>
                </p>
            </div>
        </article>
    );
};
