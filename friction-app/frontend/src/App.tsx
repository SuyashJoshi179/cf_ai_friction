import { useState, useRef } from 'react'
import { ArticleView } from './components/ArticleView'
import { QuizModal } from './components/QuizModal'

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

function App() {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);

  const [comments, setComments] = useState<Comment[]>([
    { id: '1', author: 'Alice', text: 'Interesting perspective, but I disagree with the timeline.', timestamp: '2 mins ago' }
  ]);

  const articleTextRef = useRef<string>(`The era of human coding is over. With the release of GPT-6 and Llama-5, we have reached a point where writing code manually is as obsolete as using a typewriter. Those who cling to "clean code" and "architecture" are simply in denial. By 2026, the role of "Software Engineer" will cease to exist. It will be replaced by "Prompt Architects" who simply guide the AI. Universities should stop teaching Computer Science immediately and focus on Prompt Engineering. The efficiency gains are too massive to ignore. A single AI can do the work of 100 senior engineers in seconds. If you are still learning JavaScript today, you are wasting your time.`);

  const handlePost = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('https://friction-backend.suyjoshi.workers.dev/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: commentText,
          articleText: articleTextRef.current
        })
      });

      const data = await res.json();

      if (data.status === 'posted') {
        addComment(commentText);
        setCommentText('');
      } else if (data.status === 'blocked') {
        setQuiz(data.quiz);
        setQuizId(data.quizId);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizSubmit = async (answers: number[]) => {
    if (!quizId) return;
    setIsVerifying(true);
    setQuizError(undefined);

    try {
      const res = await fetch('https://friction-backend.suyjoshi.workers.dev/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, answers })
      });

      const data = await res.json();

      if (data.success) {
        addComment(data.comment);
        setCommentText('');
        setQuiz(null);
        setQuizId(null);
      } else {
        setQuizError(data.message || 'Incorrect answers');
      }
    } catch (err) {
      console.error(err);
      setQuizError('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const addComment = (text: string) => {
    setComments(prev => [{
      id: Date.now().toString(),
      author: 'You',
      text,
      timestamp: 'Just now'
    }, ...prev]);
  };

  return (
    <div className="container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.05em' }}>Friction.</div>
        <div>
          <button className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Sign In</button>
        </div>
      </nav>

      <ArticleView />

      <div className="glass-panel">
        <h3 style={{ marginTop: 0 }}>Discussion</h3>

        <div style={{ marginBottom: '2rem' }}>
          <textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={isSubmitting}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={handlePost}
              disabled={!commentText.trim() || isSubmitting}
            >
              {isSubmitting ? 'Analyzing...' : 'Post Comment'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.map(comment => (
            <div key={comment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{comment.author}</span>
                <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{comment.timestamp}</span>
              </div>
              <p style={{ margin: 0, color: '#d4d4d8' }}>{comment.text}</p>
            </div>
          ))}
        </div>
      </div>

      {quiz && (
        <QuizModal
          quiz={quiz}
          onSubmit={handleQuizSubmit}
          onCancel={() => setQuiz(null)}
          isVerifying={isVerifying}
          error={quizError}
        />
      )}
    </div>
  )
}

export default App
