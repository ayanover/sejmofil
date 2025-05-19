'use client'
import React from 'react';
import {
  ArrowRight,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Eye,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Initiative } from '@/lib/types/initiatives';
import { voteOnInitiative } from '@/lib/api/e-partycypacja';

interface InitiativeCardProps {
  initiative: Initiative;
}

const InitiativeCard: React.FC<InitiativeCardProps> = ({ initiative }) => {
  const [voteStatus, setVoteStatus] = React.useState<'up' | 'down' | null>(null);
  const [voteCount, setVoteCount] = React.useState<number>(initiative.votes);
  const [isVoting, setIsVoting] = React.useState<boolean>(false);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Handle vote
  const handleVote = async (isUpvote: boolean) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      const voteValue = isUpvote ? 1 : -1;
      const success = await voteOnInitiative(initiative.id, voteValue);

      if (success) {
        // If voting for the same option twice, toggle it off
        if ((isUpvote && voteStatus === 'up') || (!isUpvote && voteStatus === 'down')) {
          setVoteStatus(null);
          setVoteCount(prevCount => isUpvote ? prevCount - 1 : prevCount + 1);
        }
        // If switching vote
        else if (voteStatus !== null) {
          setVoteStatus(isUpvote ? 'up' : 'down');
          setVoteCount(prevCount => isUpvote ? prevCount + 2 : prevCount - 2);
        }
        // If voting for the first time
        else {
          setVoteStatus(isUpvote ? 'up' : 'down');
          setVoteCount(prevCount => isUpvote ? prevCount + 1 : prevCount - 1);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-red-300 transition-colors">
      <div className="flex">
        {/* Left voting column */}
        <div className="bg-gray-50 py-4 px-2 flex flex-col items-center w-16 md:w-20 border-r border-gray-200">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting}
            className={`p-1 rounded-full ${voteStatus === 'up' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'} transition-colors`}
            aria-label="Upvote"
          >
            <ArrowUp size={20} />
          </button>
          <span className="font-semibold text-lg my-1">{voteCount}</span>
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting}
            className={`p-1 rounded-full ${voteStatus === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'} transition-colors`}
            aria-label="Downvote"
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* Content column */}
        <div className="flex-1">
          <div className="p-4">
            <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
              <span className="font-medium">Inicjatywa</span>
              <span>{formatDate(initiative.createdAt)}</span>
            </div>

            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-1">
              {initiative.title}
            </h2>

            <div className="flex items-center mb-2">
              <span className="text-sm font-medium mr-1">Autor:</span>
              <span className="text-red-800 font-medium text-sm">{initiative.author.name}</span>
            </div>

            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {initiative.summary}
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {initiative.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  {initiative.comments}
                </span>
                <span className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  {initiative.views || 0}
                </span>
                <span className="flex items-center">
                  <Users size={16} className="mr-1" />
                  {initiative.supporters} wspierających
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/e-partycypacja/initiatives/${initiative.id}`}
                  className="flex items-center px-3 py-1 text-sm bg-red-800 text-white rounded hover:bg-red-700"
                >
                  <span>Zobacz więcej</span>
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitiativeCard;