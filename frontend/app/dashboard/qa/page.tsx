'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { ThumbsUp, MessageCircle, Eye, Plus, Search } from 'lucide-react';
import { qaAPI } from '../../../lib/api';

interface Question {
  id: string;
  title: string;
  content?: string;
  description?: string;
  author?: string | { name: string; image?: string };
  authorId?: string;
  tags?: string[];
  views?: number;
  viewCount?: number;
  answers?: number;
  answerCount?: number;
  votes?: number;
  answered?: boolean;
  isAnswered?: boolean;
  timeAgo?: string;
  createdAt?: string;
}

interface Answer {
  id: string;
  content: string;
  author?: { name: string };
  createdAt: string;
  upvotes?: number;
  downvotes?: number;
}

export default function QAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('unanswered');
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<string | null>(null);
  const [viewQuestionData, setViewQuestionData] = useState<Question | null>(null);
  const [answersList, setAnswersList] = useState<Answer[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionTags, setQuestionTags] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeToday] = useState(() => Math.floor(Math.random() * 50));

  // Time ago helper - declare before loadQuestions
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return 'recently';
  };

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await qaAPI.listQuestions(50, 0, filter === 'unanswered' ? 'unanswered' : 'latest');
      const questionList = Array.isArray(response) ? response : (response?.questions || response?.data || []);

      // Map API response to Question interface
      const mappedQuestions = questionList.map((q: Question) => ({
        id: q.id,
        title: q.title,
        description: q.content || q.description || '',
        content: q.content || q.description || '',
        author: typeof q.author === 'string' ? q.author : (q.author?.name || 'Anonymous'),
        authorId: q.authorId,
        tags: q.tags || [],
        views: q.viewCount || 0,
        viewCount: q.viewCount || 0,
        answers: q.answerCount || 0,
        answerCount: q.answerCount || 0,
        votes: 0,
        answered: q.isAnswered || false,
        timeAgo: q.createdAt ? getTimeAgo(q.createdAt) : 'Recently',
        createdAt: q.createdAt,
      }));

      setQuestions(mappedQuestions);
    } catch (err) {
      console.error('Error loading questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Fetch questions when component mounts and when filter changes
  useEffect(() => {
    // Avoid calling async operations at the top level of effects
    // by wrapping them in a non-async function
    const fetchQuestions = () => {
      void loadQuestions();
    };
    fetchQuestions();
  }, [loadQuestions]);

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) return;
    
    try {
      setLoading(true);
      await qaAPI.postAnswer(questionId, answerText);
      await loadQuestions();
      setAnswerText('');
      setShowAnswerModal(null);
    } catch (err) {
      console.error('Failed to post answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionTitle.trim() || !questionContent.trim()) return;
    
    try {
      setLoading(true);
      const tagsList = questionTags.split(',').map(t => t.trim()).filter(Boolean);
      await qaAPI.createQuestion(questionTitle, questionContent, 'general', tagsList);
      await loadQuestions();
      setQuestionTitle('');
      setQuestionContent('');
      setQuestionTags('');
      setShowQuestionModal(false);
    } catch (err) {
      console.error('Failed to create question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuestion = async (question: Question) => {
    setShowViewModal(question.id);
    setViewQuestionData(question);
    try {
      setLoading(true);
      const response = await qaAPI.getAnswers(question.id);
      setAnswersList(response.answers || []);
    } catch (err) {
      console.error('Failed to load answers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteAnswer = async (answerId: string, type: 'upvote' | 'downvote') => {
    try {
      await qaAPI.voteAnswer(answerId, type);
      setAnswersList(prev => prev.map(ans => {
        if (ans.id === answerId) {
          return {
            ...ans,
            upvotes: type === 'upvote' ? (ans.upvotes || 0) + 1 : ans.upvotes,
            downvotes: type === 'downvote' ? (ans.downvotes || 0) + 1 : ans.downvotes,
          };
        }
        return ans;
      }));
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = question.title.toLowerCase().includes(searchLower) ||
                         (question.description || '').toLowerCase().includes(searchLower) ||
                         (question.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
    
    if (filter === 'all') {
      return matchesSearch;
    }
    if (filter === 'answered') {
      return question.answered && matchesSearch;
    }
    if (filter === 'unanswered') {
      return !question.answered && matchesSearch;
    }
    return matchesSearch;
  });

  const stats = [
    { label: 'Total Questions', value: questions.length, color: 'emerald' },
    { label: 'Answered', value: questions.filter(q => q.answered).length, color: 'amethyst' },
    { label: 'Unanswered', value: questions.filter(q => !q.answered).length, color: 'golden' },
    { label: 'Active Today', value: activeToday, color: 'emerald' },
  ];

  const filters = [
    { id: 'all', label: 'All Questions', count: questions.length },
    { id: 'unanswered', label: 'Unanswered', count: questions.filter(q => !q.answered).length },
    { id: 'answered', label: 'Answered', count: questions.filter(q => q.answered).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-morphism rounded-lg p-6 border border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Q&A Forum</h1>
            <p className="text-gray-300">Ask questions, share knowledge, and help the community grow.</p>
          </div>
          <Button 
            className="btn-emerald px-6"
            onClick={() => setShowQuestionModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Ask Question
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search questions by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 input-glass text-white placeholder-gray-400"
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} variant={stat.color as 'emerald' | 'amethyst' | 'golden'}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <Button
              key={f.id}
              onClick={() => setFilter(f.id)}
              variant={filter === f.id ? 'default' : 'outline'}
              className={filter === f.id ? 'btn-emerald' : 'text-white hover:bg-white/10'}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card
              key={question.id}
              variant={question.answered ? 'amethyst' : 'golden'}
              className="glass-morphism hover:border-white/30 transition-all cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{question.title}</h3>
                      <p className="text-gray-300 font-medium mb-2">{typeof question.author === 'string' ? question.author : (question.author?.name || 'Anonymous')}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                      {(question.tags || []).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-golden-400 mb-2">{question.answers} answers</div>
                    <div className="flex items-center gap-2 text-white">
                      <ThumbsUp className="h-4 w-4 text-golden-400" />
                      <span className="text-sm">{question.votes} votes</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-4">{question.description}</p>

                {/* Tags */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(question.tags || []).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowAnswerModal(question.id)}
                    className="flex-1 btn-amethyst"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Answer
                  </Button>
                  <Button 
                    onClick={() => handleViewQuestion(question)}
                    className="flex-1 btn-emerald"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Answer Modal */}
      {showAnswerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-morphism rounded-lg p-6 w-full max-w-md mx-4 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Answer Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Answer</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Share your knowledge and help the community..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAnswerModal(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAnswer(showAnswerModal)}
                  disabled={!answerText.trim()}
                  className="btn-emerald"
                >
                  Submit Answer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-morphism rounded-lg p-6 w-full max-w-2xl mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Ask a Question</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Question Title</label>
                <Input
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="e.g., How to implement authentication in Next.js?"
                  className="input-glass text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Details</label>
                <textarea
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Provide more context and details about your question..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma separated)</label>
                <Input
                  value={questionTags}
                  onChange={(e) => setQuestionTags(e.target.value)}
                  placeholder="e.g., nextjs, auth, react"
                  className="input-glass text-white"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowQuestionModal(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateQuestion}
                  disabled={!questionTitle.trim() || !questionContent.trim() || loading}
                  className="btn-emerald"
                >
                  Post Question
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Answers Modal */}
      {showViewModal && viewQuestionData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-morphism rounded-lg p-6 w-full max-w-3xl mx-4 border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{viewQuestionData.title}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowViewModal(null);
                  setViewQuestionData(null);
                  setAnswersList([]);
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
            </div>
            
            <div className="text-gray-300 mb-8 whitespace-pre-wrap p-4 bg-white/5 rounded-lg">
              {viewQuestionData.description}
            </div>

            <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">
              {answersList.length} {answersList.length === 1 ? 'Answer' : 'Answers'}
            </h3>

            <div className="space-y-6">
              {answersList.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No answers yet. Be the first to answer!
                </div>
              ) : (
                answersList.map((answer) => (
                  <div key={answer.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                            {(answer.author?.name || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white font-medium block">
                              {answer.author?.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(answer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-200 whitespace-pre-wrap mb-4">{answer.content}</p>
                      </div>
                      
                      {/* Voting */}
                      <div className="flex flex-col items-center gap-1 ml-4 bg-black/20 p-2 rounded-lg">
                        <button 
                          onClick={() => handleVoteAnswer(answer.id, 'upvote')}
                          className="p-1 hover:bg-white/10 rounded group"
                        >
                          <Plus className="h-5 w-5 text-gray-400 group-hover:text-emerald-400" />
                        </button>
                        <span className="text-white font-bold text-lg">
                          {(answer.upvotes || 0) - (answer.downvotes || 0)}
                        </span>
                        <button 
                          onClick={() => handleVoteAnswer(answer.id, 'downvote')}
                          className="p-1 hover:bg-white/10 rounded group"
                        >
                          <div className="h-5 w-5 flex items-center justify-center text-gray-400 group-hover:text-red-400">
                            <div className="w-3 h-0.5 bg-current"></div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
