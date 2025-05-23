'use client'
import Image from 'next/image'
import { MessageSquare, Share2, Vote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { truncateText } from '@/lib/utils'
import { PostVoting } from '@/components/post-voting'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export default function PostCard({
  category,
  title,
  description,
  comments,
  pointId,
  proceedingNumber,
  date,
  votingNumbers,
  votes = { upvotes: 0, downvotes: 0 },
}: {
  [key: string]: any // We're getting these props from the database anyway
  votes?: { upvotes: number; downvotes: number }
}) {
  const hasVotes = Boolean(votingNumbers && votingNumbers.length > 0)
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsSharing(true)

    const shareUrl = `${window.location.origin}/proceedings/${proceedingNumber}/${date}/${pointId}`
    const shareData = {
      title: title,
      text: truncateText(description, 200, true),
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: 'Link skopiowany',
          description: 'Link został skopiowany do schowka',
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: 'Nie udało się udostępnić',
        })
      }
    } finally {
      setIsSharing(false)
    }
  }

  // Format date to display
  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4 sm:gap-3 py-2 sm:p-4">
      <div className="flex flex-col md:flex-row items-start gap-3 sm:gap-6">
        <div className="flex-1 min-w-0 order-2 md:order-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-primary text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              {category}
            </span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-muted-foreground text-sm">{formattedDate}</span>
            {hasVotes && (
              <Badge variant="secondary" className="gap-1">
                <Vote className="h-3 w-3" />
                {votingNumbers?.length}
              </Badge>
            )}
          </div>
          <Link
            href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}
            className="block hover:opacity-80 transition-opacity"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h2>
          </Link>
          <p className="text-muted-foreground text-sm sm:text-base line-clamp-3">
            {truncateText(description, 320, true)}
          </p>
        </div>

        <Link
          href={`/proceedings/${proceedingNumber}/${date}/${pointId}`}
          className="block w-full md:w-[200px] lg:w-[300px] order-1 md:order-2"
        >
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-[16/10]">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proceedings/${proceedingNumber}/${date}/${pointId}.jpg`}
              alt={title}
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 200px, 300px"
            />
          </div>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <PostVoting pointId={pointId} initialVotes={votes} />
        <span className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {comments} komentarzy
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="sm:ml-auto"
          onClick={handleShare}
          disabled={isSharing}
        >
          <Share2 className={cn('w-4 h-4', isSharing && 'animate-pulse')} />
          <span className="hidden sm:inline ml-2">
            {isSharing ? 'Udostępnianie...' : 'Udostępnij'}
          </span>
        </Button>
      </div>
    </div>
  )
}
