'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { SmilePlus } from 'lucide-react'
import { useState } from 'react'
import { LoginDialog } from './login-dialog'
import { Button } from './ui/button'

const REACTIONS = [
  { emoji: '👍', label: 'Popieram' },
  { emoji: '👎', label: 'Nie popieram' },
  { emoji: '😮', label: 'Zaskoczenie' },
  { emoji: '❤️', label: 'Świetne' },
  { emoji: '😂', label: 'Zabawne' },
]

// Mock reaction counts
const mockReactionCounts: Record<string, number> = REACTIONS.reduce(
  (acc, { emoji }) => ({
    ...acc,
    [emoji]: Math.floor(Math.random() * 50),
  }),
  {}
)

interface StatementReactionsProps {
  statementId: number
}

export function StatementReactions({ statementId }: StatementReactionsProps) {
  console.log('🚀 ~ StatementReactions ~ statementId:', statementId)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { session } = useSupabaseSession()

  const handleReactionClick = (emoji: string) => {
    if (!session && process.env.NODE_ENV !== 'development') {
      setShowLoginDialog(true)
      return
    }

    if (selectedReaction === emoji) {
      setSelectedReaction(null)
    } else {
      setSelectedReaction(emoji)
    }
    setIsOpen(false) // Close popover after selection
  }

  const handleReactionTriggerClick = () => {
    if (!session && process.env.NODE_ENV !== 'development') {
      setShowLoginDialog(true)
      return
    }
  }

  // Calculate total reactions and top emojis
  const totalReactions = Object.values(mockReactionCounts).reduce(
    (a, b) => a + b,
    0
  )
  const topTwoReactions = Object.entries(mockReactionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([emoji]) => emoji)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-1.5">
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`group flex h-7 items-center gap-1 px-1.5 transition-all duration-200 hover:scale-105 ${
              !selectedReaction
                ? 'text-muted-foreground hover:text-foreground'
                : 'text-blue-500 hover:text-blue-600'
            }`}
            onClick={handleReactionTriggerClick}
          >
            {selectedReaction ? (
              <>
                <span className="text-lg duration-300 animate-in zoom-in-50">
                  {selectedReaction}
                </span>
                <span className="text-xs font-medium capitalize opacity-90">
                  {REACTIONS.find((r) => r.emoji === selectedReaction)?.label}
                </span>
              </>
            ) : (
              <SmilePlus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            )}
          </Button>
        </PopoverTrigger>

        {totalReactions > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="flex items-center -space-x-1">
              {topTwoReactions.map((emoji) => (
                <span
                  key={emoji}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-base"
                >
                  {emoji}
                </span>
              ))}
            </div>
            <span className="text-xs">{totalReactions}</span>
          </div>
        )}
      </div>

      {(session || process.env.NODE_ENV === 'development') && (
        <PopoverContent
          className="w-auto p-0.5 duration-200 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          sideOffset={5}
          align="start"
          alignOffset={-5}
        >
          <div className="flex gap-0.5">
            {REACTIONS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                className={`group px-1 py-0.5 transition-all duration-200 hover:scale-110 ${
                  selectedReaction === emoji
                    ? 'bg-blue-50 dark:bg-blue-950'
                    : ''
                }`}
                onClick={() => handleReactionClick(emoji)}
              >
                <span
                  className={`text-xl ${
                    selectedReaction === emoji
                      ? 'duration-200 animate-in zoom-in-105'
                      : ''
                  }`}
                  title={`${label} (${mockReactionCounts[emoji]})`}
                >
                  {emoji}
                </span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      )}

      {showLoginDialog && (
        <LoginDialog
          defaultOpen={true}
          onOpenChange={(open) => !open && setShowLoginDialog(false)}
          message="Musisz się zalogować by dodawać reakcje"
        />
      )}
    </Popover>
  )
}
