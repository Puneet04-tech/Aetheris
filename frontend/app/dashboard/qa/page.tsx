'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { ThumbsUp, MessageCircle, Eye, Plus, Search, X } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  views: number;
  answers: number;
  votes: number;
  answered: boolean;
  timeAgo: string;
}

export default function QAPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('unanswered');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set(['1', '2', '4', '5']));
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      title: 'What is the best way to optimize React performance for large datasets?',
      description: 'I\'m working with a table that displays 10,000+ rows and looking for optimization strategies.',
      author: 'Alex Dev',
      tags: ['React', 'Performance', 'JavaScript'],
      views: 2345,
      answers: 8,
      votes: 234,
      answered: true,
      timeAgo: '2 hours ago',
    },
    {
      id: '2',
      title: 'How to design a scalable microservices architecture?',
      description: 'Looking for best practices and patterns for designing microservices at scale.',
      author: 'Sarah Architect',
      tags: ['Microservices', 'Architecture', 'Backend'],
      views: 5432,
      answers: 12,
      votes: 567,
      answered: true,
      timeAgo: '5 hours ago',
    },
    {
      id: '3',
      title: 'What is the difference between null and undefined in JavaScript?',
      description: 'Understanding the nuances between null and undefined in JavaScript.',
      author: 'Mike Chen',
      tags: ['JavaScript', 'Basics', 'Programming'],
      views: 1234,
      answers: 15,
      votes: 89,
      answered: false,
      timeAgo: '1 day ago',
    },
    {
      id: '4',
      title: 'Best practices for API authentication?',
      description: 'Looking for comprehensive guide on securing API endpoints.',
      author: 'Lisa Security',
      tags: ['API', 'Security', 'Authentication'],
      views: 3456,
      answers: 23,
      votes: 456,
      answered: false,
      timeAgo: '3 days ago',
    },
    {
      id: '5',
      title: 'How to implement lazy loading in React?',
      description: 'Need help with implementing lazy loading for images and components.',
      author: 'Tom Performance',
      tags: ['React', 'Performance', 'Optimization'],
      views: 890,
      answers: 34,
      votes: 234,
      answered: false,
      timeAgo: '6 hours ago',
    },
  ]);

  const handleAnswer = (questionId: string) => {
    if (!answerText.trim()) return;
    
    const newAnsweredQuestions = new Set(answeredQuestions);
    newAnsweredQuestions.add(questionId);
    setAnsweredQuestions(newAnsweredQuestions);
    
    // Add answer to question
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, answered: true, answers: q.answers + 1 } : q
    );
    setQuestions(updatedQuestions);
    
    setAnswerText('');
    setShowAnswerModal(null);
  };

  const filteredQuestions = questions.filter(question => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = question.title.toLowerCase().includes(searchLower) ||
                         question.description.toLowerCase().includes(searchLower) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
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
    { label: 'Active Today', value: Math.floor(Math.random() * 50), color: 'emerald' },
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
            onClick={() => setShowAnswerModal('new')}
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
            <Card key={stat.label} variant={stat.color as any}>
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
                      <p className="text-gray-300 font-medium mb-2">{question.author}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags.map((tag) => (
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
                    {question.tags.map((tag) => (
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
                    onClick={() => handleAnswer(question.id)}
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
    </div>
  );
}
