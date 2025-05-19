'use client'
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Eye,
  Users,
  Send,
  Reply,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { Initiative, BulletPoint, Attachment, Transcript } from '@/lib/types/initiatives';
import { fetchInitiativeById } from '@/lib/api/e-partycypacja';

// Comment interfaces
interface CommentAuthor {
  id: string;
  name: string;
  image?: string;
}

interface CommentVotes {
  upvotes: number;
  downvotes: number;
}

interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  votes: CommentVotes;
  parentId: string | null;
}

// Mock comments
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    author: {
      id: 'user-1',
      name: 'Jan Kowalski',
      image: '/avatars/jan-kowalski.jpg'
    },
    content: 'Pełne poparcie dla tej inicjatywy! Szczególnie ważny jest punkt dotyczący finansowania tego projektu z budżetu państwa. Mam nadzieję, że zyska wystarczające poparcie.',
    createdAt: '2025-05-10T14:22:00Z',
    votes: {
      upvotes: 24,
      downvotes: 3
    },
    parentId: null
  },
  {
    id: 'comment-2',
    author: {
      id: 'user-2',
      name: 'Anna Nowak',
      image: '/avatars/anna-nowak.jpg'
    },
    content: 'Mam wątpliwości co do implementacji tego projektu. Skąd będą brane środki na finansowanie?',
    createdAt: '2025-05-10T16:45:00Z',
    votes: {
      upvotes: 13,
      downvotes: 5
    },
    parentId: null
  },
  {
    id: 'comment-3',
    author: {
      id: 'user-3',
      name: 'Piotr Wiśniewski',
      image: '/avatars/piotr-wisniewski.jpg'
    },
    content: 'Faktycznie, w projekcie brakuje dokładnych informacji o źródłach finansowania. Może autor mógłby to doprecyzować?',
    createdAt: '2025-05-11T09:30:00Z',
    votes: {
      upvotes: 18,
      downvotes: 1
    },
    parentId: 'comment-2'
  },
  {
    id: 'comment-4',
    author: {
      id: 'user-4',
      name: 'Maria Kowalczyk',
      image: '/avatars/maria-kowalczyk.jpg'
    },
    content: 'Myślę, że środki mogłyby pochodzić z funduszy unijnych przeznaczonych na tego typu projekty.',
    createdAt: '2025-05-11T11:15:00Z',
    votes: {
      upvotes: 9,
      downvotes: 2
    },
    parentId: 'comment-3'
  },
  {
    id: 'comment-5',
    author: {
      id: 'user-5',
      name: 'Tomasz Zieliński',
      image: '/avatars/tomasz-zielinski.jpg'
    },
    content: 'Popieram w 100%! Najwyższy czas na takie rozwiązania.',
    createdAt: '2025-05-12T08:05:00Z',
    votes: {
      upvotes: 7,
      downvotes: 0
    },
    parentId: null
  }
];

// Comment component
const CommentItem: React.FC<{
  comment: Comment;
  allComments: Comment[];
  depth: number;
  onReply: (parentId: string, content: string) => void;
  onVote: (commentId: string, value: number) => void;
}> = ({ comment, allComments, depth, onReply, onVote }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const maxDepth = 4;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Handle vote
  const handleVote = async (isUpvote: boolean) => {
    let voteValue = 0;

    // Determine vote value based on current state
    if (isUpvote) {
      if (userVote === 'up') {
        voteValue = 0; // Cancel upvote
        setUserVote(null);
      } else if (userVote === 'down') {
        voteValue = 2; // Change from downvote to upvote
        setUserVote('up');
      } else {
        voteValue = 1; // New upvote
        setUserVote('up');
      }
    } else {
      if (userVote === 'down') {
        voteValue = 0; // Cancel downvote
        setUserVote(null);
      } else if (userVote === 'up') {
        voteValue = -2; // Change from upvote to downvote
        setUserVote('down');
      } else {
        voteValue = -1; // New downvote
        setUserVote('down');
      }
    }

    // Call parent handler
    await onVote(comment.id, voteValue);
  };

  // Handle reply
  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
  };

  // Get replies for this comment
  const replies = allComments.filter(c => c.parentId === comment.id);

  return (
    <div className={`pl-${depth === 0 ? '0' : '4'} mb-3`}>
      <div className="flex">
        {/* Vote buttons column */}
        <div className="flex flex-col items-center mr-2 pt-2">
          <button
            onClick={() => handleVote(true)}
            className={`p-1 rounded ${userVote === 'up' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
          >
            <ArrowUp size={16} />
          </button>
          <span className="text-xs font-medium my-1">
            {comment.votes.upvotes - comment.votes.downvotes}
          </span>
          <button
            onClick={() => handleVote(false)}
            className={`p-1 rounded ${userVote === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
          >
            <ArrowDown size={16} />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="bg-white rounded py-2">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden mr-1">
                  {comment.author.image && (
                    <img src={comment.author.image} alt={comment.author.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="font-medium text-gray-700 mr-1">{comment.author.name}</span>
              </div>
              <span className="mx-1">•</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>

            <p className="text-sm text-gray-800 mb-1">{comment.content}</p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center hover:text-gray-700"
              >
                <Reply size={12} className="mr-1" />
                Odpowiedz
              </button>
              <button className="hover:text-gray-700">
                Udostępnij
              </button>
              <button className="hover:text-gray-700">
                Zgłoś
              </button>
            </div>
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-2 ml-2 mb-3">
              <textarea
                placeholder="Napisz odpowiedź..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                rows={2}
              ></textarea>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className={`px-3 py-1 text-xs ${replyContent.trim() ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} rounded flex items-center`}
                >
                  <Send size={10} className="mr-1" />
                  Wyślij
                </button>
              </div>
            </div>
          )}

          {/* Render replies */}
          {replies.length > 0 && depth < maxDepth && (
            <div className="mt-1 border-l-2 border-gray-200 pl-4">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  allComments={allComments}
                  depth={depth + 1}
                  onReply={onReply}
                  onVote={onVote}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component
interface InitiativeDetailProps {
  id: string;
}

const InitiativeDetail: React.FC<InitiativeDetailProps> = ({ id }) => {
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch initiative data
  useEffect(() => {
    const getInitiative = async () => {
      try {
        setLoading(true);
        const data = await fetchInitiativeById(id);
        if (data) {
          setInitiative(data);
          setVoteCount(data.votes);
          setError(null);
        } else {
          setError('Nie znaleziono inicjatywy');
        }
      } catch (err) {
        console.error('Error fetching initiative:', err);
        setError('Nie udało się pobrać szczegółów inicjatywy.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getInitiative();
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="animate-pulse flex flex-col space-y-6">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !initiative) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="p-6 bg-red-50 border border-red-300 text-red-800 rounded-md">
          <h2 className="text-xl font-bold mb-2">Błąd</h2>
          <p>{error || 'Nie znaleziono inicjatywy'}</p>
          <Link href="/initiatives" className="mt-4 inline-block px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700">
            Wróć do listy inicjatyw
          </Link>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Handle initiative vote
  const handleInitiativeVote = async (isUpvote: boolean) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      let voteValue = 0;

      // Determine vote value based on current state
      if (isUpvote) {
        if (userVote === 'up') {
          voteValue = 0; // Cancel upvote
          setUserVote(null);
          setVoteCount(prev => prev - 1);
        } else if (userVote === 'down') {
          voteValue = 2; // Change from downvote to upvote
          setUserVote('up');
          setVoteCount(prev => prev + 2);
        } else {
          voteValue = 1; // New upvote
          setUserVote('up');
          setVoteCount(prev => prev + 1);
        }
      } else {
        if (userVote === 'down') {
          voteValue = 0; // Cancel downvote
          setUserVote(null);
          setVoteCount(prev => prev + 1);
        } else if (userVote === 'up') {
          voteValue = -2; // Change from upvote to downvote
          setUserVote('down');
          setVoteCount(prev => prev - 2);
        } else {
          voteValue = -1; // New downvote
          setUserVote('down');
          setVoteCount(prev => prev - 1);
        }
      }

      // Send vote to API
      const response = await fetch('http://localhost:8000/api/votes/initiative/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            type: "vote-view-sets",
            attributes: {
              initiative_id: parseInt(id),
              value: voteValue
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Vote successful - UI already updated optimistically

    } catch (error) {
      console.error('Error voting:', error);
      // Revert UI changes on error
      setUserVote(prevState => prevState);
      setVoteCount(initiative.votes);
    } finally {
      setIsVoting(false);
    }
  };

  // Handle adding new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      // Here you would normally send the comment to your API
      // For now, we'll just update the local state

      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        author: {
          id: 'current-user',
          name: 'Ty',
          image: '/avatars/default-user.jpg'
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        votes: {
          upvotes: 0,
          downvotes: 0
        },
        parentId: null
      };

      setComments([...comments, newCommentObj]);
      setNewComment('');

    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle replying to a comment
  const handleReplyToComment = async (parentId: string, content: string) => {
    try {
      // Here you would normally send the reply to your API
      // For now, we'll just update the local state

      const newReply: Comment = {
        id: `comment-${Date.now()}`,
        author: {
          id: 'current-user',
          name: 'Ty',
          image: '/avatars/default-user.jpg'
        },
        content: content,
        createdAt: new Date().toISOString(),
        votes: {
          upvotes: 0,
          downvotes: 0
        },
        parentId: parentId
      };

      setComments([...comments, newReply]);

    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Handle voting on a comment
  const handleVoteOnComment = async (commentId: string, voteValue: number) => {
    try {
      // Send vote to API
      const response = await fetch('http://localhost:8000/api/votes/comment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            type: "vote-view-sets",
            attributes: {
              comment_id: parseInt(commentId),
              value: voteValue
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to vote on comment');
      }

      // Update local comment state optimistically
      setComments(
        comments.map(comment => {
          if (comment.id === commentId) {
            // Update based on the vote value
            if (voteValue === 1) {
              return {
                ...comment,
                votes: {
                  upvotes: comment.votes.upvotes + 1,
                  downvotes: comment.votes.downvotes
                }
              };
            } else if (voteValue === -1) {
              return {
                ...comment,
                votes: {
                  upvotes: comment.votes.upvotes,
                  downvotes: comment.votes.downvotes + 1
                }
              };
            } else if (voteValue === 2) {
              return {
                ...comment,
                votes: {
                  upvotes: comment.votes.upvotes + 1,
                  downvotes: comment.votes.downvotes - 1
                }
              };
            } else if (voteValue === -2) {
              return {
                ...comment,
                votes: {
                  upvotes: comment.votes.upvotes - 1,
                  downvotes: comment.votes.downvotes + 1
                }
              };
            } else {
              // For 0 value (cancellation), would need previous state to properly handle
              return comment;
            }
          }
          return comment;
        })
      );

    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  // Get root comments
  const rootComments = comments.filter(comment => comment.parentId === null);

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      {/* Navigation */}
      <div className="mb-4">
        <Link href="/initiatives" className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
          <ArrowRight className="transform rotate-180 mr-1" size={14} /> Powrót do listy inicjatyw
        </Link>
      </div>

      {/* Main post - Reddit style */}
      <div className="border border-gray-300 rounded bg-white mb-4">
        <div className="flex">
          {/* Vote buttons column */}
          <div className="w-10 bg-gray-50 flex flex-col items-center py-2">
            <button
              onClick={() => handleInitiativeVote(true)}
              disabled={isVoting}
              className={`p-1 rounded-full ${userVote === 'up' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            >
              <ArrowUp size={20} />
            </button>
            <span className="font-medium text-sm my-1">
              {voteCount}
            </span>
            <button
              onClick={() => handleInitiativeVote(false)}
              disabled={isVoting}
              className={`p-1 rounded-full ${userVote === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}
            >
              <ArrowDown size={20} />
            </button>
          </div>

          {/* Post content */}
          <div className="flex-1 p-3">
            {/* Post header with support button moved to top right */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden mr-1">
                      {initiative.author.image && (
                        <img src={initiative.author.image} alt={initiative.author.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="font-medium text-gray-700 mr-1">Opublikowane przez {initiative.author.name}</span>
                    {initiative.author.title && (
                      <span className="text-gray-500">({initiative.author.title})</span>
                    )}
                  </div>
                  <span className="mx-1">•</span>
                  <span>{formatDate(initiative.createdAt)}</span>
                </div>
                <h1 className="text-xl font-medium text-gray-900">{initiative.title}</h1>
              </div>

              {/* Support button moved to top right */}
              <button className="px-4 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 flex items-center whitespace-nowrap">
                <Users size={16} className="mr-1.5" />
                Wesprzyj inicjatywę ({initiative.supporters})
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {initiative.tags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mb-4">
              <p className="text-gray-700 text-sm">{initiative.summary}</p>
            </div>

            {/* Template Sections */}
            {initiative.templateSections && initiative.templateSections.length > 0 && (
              <div className="space-y-4">
                {initiative.templateSections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded">
                      <div className="bg-gray-50 px-3 py-2 text-sm font-medium border-b border-gray-200">
                        {section.title}
                      </div>
                      <div className="p-3">
                        {section.type === 'text' && (
                          <p className="text-gray-700 text-sm">{section.content as string}</p>
                        )}

                        {section.type === 'bullet-list' && (
                          <ul className="list-disc pl-5 space-y-1 text-sm">
                            {(section.content as BulletPoint[]).map((bullet) => (
                              <li key={bullet.id} className="text-gray-700">
                                {bullet.text}
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.type === 'attachment' && (
                          <div className="space-y-2">
                            {(section.content as Attachment[]).map((attachment) => (
                              <div key={attachment.id} className="p-2 border border-gray-200 rounded bg-gray-50 text-sm">
                                <div className="font-medium mb-1">{attachment.name}</div>
                                {attachment.description && (
                                  <p className="text-xs text-gray-600 mb-1">{attachment.description}</p>
                                )}
                                {attachment.url && (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    <ArrowRight size={12} className="mr-1" /> Pobierz załącznik
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {section.type === 'transcript' && (
                          <div className="text-sm">
                            <h4 className="font-medium mb-1">{(section.content as Transcript).title}</h4>
                            <p className="text-gray-700 mb-1">{(section.content as Transcript).content}</p>
                            <p className="text-xs text-gray-500 italic">
                              Źródło: {(section.content as Transcript).source}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Post footer stats */}
            <div className="flex items-center text-xs text-gray-500 mt-4 pt-2 border-t border-gray-200">
              <div className="flex items-center mr-4">
                <Eye size={14} className="mr-1" />
                <span>{initiative.views} wyświetleń</span>
              </div>
              <div className="flex items-center mr-4">
                <MessageSquare size={14} className="mr-1" />
                <span>{comments.length} komentarzy</span>
              </div>
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                <span>{initiative.supporters} wspierających</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="border border-gray-300 rounded bg-white">
        {/* Comment section header */}
        <div className="border-b border-gray-300 p-3 bg-gray-50 flex justify-between items-center">
          <h3 className="font-medium">
            Komentarze
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{comments.length}</span>
          </h3>
          <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-400">
            <option value="top">Najlepsze</option>
            <option value="new">Najnowsze</option>
            <option value="controversial">Kontrowersyjne</option>
            <option value="old">Najstarsze</option>
          </select>
        </div>

        {/* New comment form */}
        <div className="p-3 border-b border-gray-200">
          <textarea
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
            rows={3}
            placeholder="Co myślisz o tej inicjatywie?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmittingComment}
              className={`px-3 py-1 rounded text-sm font-medium flex items-center ${
                newComment.trim() && !isSubmittingComment
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmittingComment ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Wysyłanie...</span>
                </>
              ) : (
                <>
                  <Send size={14} className="mr-1.5" />
                  Dodaj komentarz
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="p-3">
          {rootComments.length > 0 ? (
            rootComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                allComments={comments}
                depth={0}
                onReply={handleReplyToComment}
                onVote={handleVoteOnComment}
              />
            ))
          ) : (
            <div className="text-center py-6">
              <MessageSquare size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Brak komentarzy. Bądź pierwszy i podziel się swoją opinią!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InitiativeDetail;