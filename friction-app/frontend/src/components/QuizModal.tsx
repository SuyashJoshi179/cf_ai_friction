import React, { useState } from 'react';

interface Question {
    id: number;
    text: string;
    options: string[];
}

interface QuizModalProps {
    quiz: { questions: Question[] };
    onSubmit: (answers: number[]) => void;
    onCancel: () => void;
    isVerifying: boolean;
    error?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, onSubmit, onCancel, isVerifying, error }) => {
    const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));

    const handleSelect = (qIndex: number, optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        if (answers.includes(-1)) return; // All must be answered
        onSubmit(answers);
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛑</div>
                    <h2>Hold on a second.</h2>
                    <p>
                        Your comment seems a bit heated. Before you post, let's make sure you've actually read the article and aren't just reacting to the headline.
                    </p>
                </div>

                {quiz.questions.map((q, qIndex) => (
                    <div key={q.id} className="quiz-question">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{qIndex + 1}. {q.text}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {q.options.map((option, oIndex) => (
                                <button
                                    key={oIndex}
                                    className={`quiz-option ${answers[qIndex] === oIndex ? 'selected' : ''}`}
                                    onClick={() => handleSelect(qIndex, oIndex)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {error && (
                    <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={handleSubmit}
                        disabled={answers.includes(-1) || isVerifying}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify & Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};
