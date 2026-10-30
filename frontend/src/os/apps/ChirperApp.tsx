/**
 * CORPORATE HELL™ — CorpOS Chirper Social App (Section 6).
 *
 * Phone-style social feed with floating pixel hearts, virality spikes,
 * and 3-icon fast reply mechanic (🤝 helpful, 😎 meme, 🛡 defensive).
 */
import React, { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import { useUiStore } from '../../state/uiStore'
import { Heart, MessageCircle, Repeat2, Sparkles, TrendingUp, Send } from 'lucide-react'
import { PixelButton } from '../../ui/pixel/PixelButton'
import { PixelBadge } from '../../ui/pixel/PixelBadge'
import { audio } from '../../services/audio'

export const ChirperApp: React.FC = () => {
  const socialAccounts = useGameStore((s) => s.state?.socialAccounts)
  const dispatch = useGameStore((s) => s.dispatch)
  const pushToast = useUiStore((s) => s.pushToast)

  const [activeTab, setActiveTab] = useState<'feed' | 'compose'>('feed')
  const [composeText, setComposeText] = useState('')
  const [viralHearts, setViralHearts] = useState<number[]>([])

  const chirperAccount = (socialAccounts && socialAccounts.chirper) || {
    platform: 'chirper' as const,
    followers: 12450,
    sentiment: 72,
    engagementRate: 0.048,
  }

  // Handle 3-icon choice reply
  const handleReplyChoice = (postAuthor: string, type: 'helpful' | 'meme' | 'defensive') => {
    audio.playCelebration()

    // Trigger floating pixel hearts
    setViralHearts((prev) => [...prev, Date.now()])

    let impactText = ''
    if (type === 'helpful') {
      impactText = '🤝 Helpful reply gained +120 followers & +5 morale!'
      dispatch({ type: 'reply_social', postId: 'p-1', commentId: 'c-1', responseKind: 'helpful' })
    } else if (type === 'meme') {
      impactText = '😎 Viral meme exploded! +450 followers, traffic +20%!'
      dispatch({ type: 'reply_social', postId: 'p-1', commentId: 'c-1', responseKind: 'meme' })
    } else {
      impactText = '🛡 Defensive reply sparked flame war! Sentiment -4%.'
      dispatch({ type: 'reply_social', postId: 'p-1', commentId: 'c-1', responseKind: 'defensive' })
    }

    pushToast({
      title: 'Chirper Buzz',
      description: impactText,
      severity: type === 'defensive' ? 'warn' : 'celebrate',
      appId: 'chirper',
    })
  }

  const handlePostTweet = () => {
    if (!composeText.trim()) return
    audio.playCelebration()
    dispatch({
      type: 'post_social',
      platform: 'chirper',
      kind: 'meme',
      content: composeText,
    })
    setComposeText('')
    pushToast({
      title: 'Chirp Broadcast',
      description: 'Your hot take is now propagating across Tech Twitter!',
      severity: 'celebrate',
      appId: 'chirper',
    })
  }

  const mockFeed = [
    {
      id: 'c-1',
      author: '@tech_founder_bro',
      handle: 'Founder & Hustler',
      content:
        'Just replaced our entire QA team with 4 recursive bash scripts and coffee. Thoughts? 🚀🔥 #startup #grindset',
      likes: '3.4k',
      retweets: '890',
    },
    {
      id: 'c-2',
      author: '@sre_tired',
      handle: 'Staff Outage Survivor',
      content:
        'Our Friday 5:00 PM deploy passed all unit tests because somebody commented out the assertions. Currently debugging in production from a bar.',
      likes: '8.1k',
      retweets: '2.1k',
    },
    {
      id: 'c-3',
      author: '@venture_capitalist_alex',
      handle: 'General Partner at Moonshot Ventures',
      content:
        'Software companies that prioritize sleep will never conquer the multiverse. We need more 3AM commits in repo.',
      likes: '1.2k',
      retweets: '340',
    },
  ]

  return (
    <div className="flex flex-col h-full font-mono select-none">
      {/* ----------------------------------------------------------- */}
      {/* Top Header: Follower Count & Sentiment (≤ 3 numbers) */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center justify-between bg-[#2a2838] p-2.5 border-2 border-[#14121c] shadow-[2px_2px_0px_#14121c] mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">🐤</span>
          <span className="font-bold text-xs uppercase text-[#f4ecd8]">
            Chirper Feed
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#14121c] px-2.5 py-1 border border-[#4b4a5e]">
            <span className="text-[9px] text-[#8c8aa0] uppercase">Followers:</span>
            <span className="font-bold text-xs text-[#8fd3ff]">
              {chirperAccount.followers.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#14121c] px-2.5 py-1 border border-[#4b4a5e]">
            <span className="text-[9px] text-[#8c8aa0] uppercase">Sentiment:</span>
            <span className="font-bold text-xs text-[#b6e52d]">
              {chirperAccount.sentiment}%
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Center: Phone-Style Feed */}
      {/* ----------------------------------------------------------- */}
      <div className="flex-1 bg-[#14121c] p-3 border-2 border-[#4b4a5e] overflow-y-auto pixel-scrollbar shadow-[inset_2px_2px_0px_#000000]">
        <div className="flex flex-col gap-3 max-w-lg mx-auto">
          {mockFeed.map((post) => (
            <div
              key={post.id}
              className="p-3 bg-[#2a2838] border-2 border-[#14121c] shadow-[3px_3px_0px_#14121c]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 bg-[#3e6ec0] border border-[#14121c] flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#f4ecd8]">
                      {post.author}
                    </span>
                    <span className="text-[9px] text-[#8c8aa0]">{post.handle}</span>
                  </div>
                </div>
                <PixelBadge label="Trending" variant="lime" className="text-[8px]" />
              </div>

              <p className="text-xs text-[#f4ecd8] my-2 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-[10px] text-[#8c8aa0] pt-2 border-t border-[#4b4a5e]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-[#d9453d]" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-3 w-3 text-[#b6e52d]" /> {post.retweets}
                  </span>
                </div>

                {/* 3-Icon Fast Reply Buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-[#ded2b6]">
                    Quick Reply:
                  </span>
                  <button
                    onClick={() => handleReplyChoice(post.author, 'helpful')}
                    title="🤝 Helpful & Professional (+Followers, +Morale)"
                    className="p-1 bg-[#4b4a5e] hover:bg-[#3e6ec0] border border-[#14121c] shadow-[1px_1px_0px_#14121c] active:top-[1px] text-xs"
                  >
                    🤝
                  </button>
                  <button
                    onClick={() => handleReplyChoice(post.author, 'meme')}
                    title="😎 Ruthless Meme (+Viral Traffic Spike!)"
                    className="p-1 bg-[#4b4a5e] hover:bg-[#b6e52d] border border-[#14121c] shadow-[1px_1px_0px_#14121c] active:top-[1px] text-xs"
                  >
                    😎
                  </button>
                  <button
                    onClick={() => handleReplyChoice(post.author, 'defensive')}
                    title="🛡 Defensive Corporate Speak (Flame War Risk)"
                    className="p-1 bg-[#4b4a5e] hover:bg-[#d9453d] border border-[#14121c] shadow-[1px_1px_0px_#14121c] active:top-[1px] text-xs"
                  >
                    🛡
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* Bottom: Quick Tweet Composer */}
      {/* ----------------------------------------------------------- */}
      <div className="flex items-center gap-2 p-2 bg-[#2a2838] border-2 border-[#14121c] mt-2 shadow-[2px_2px_0px_#14121c]">
        <input
          type="text"
          value={composeText}
          onChange={(e) => setComposeText(e.target.value)}
          placeholder="Chirp a controversial tech announcement..."
          className="flex-1 bg-[#14121c] border border-[#4b4a5e] px-2.5 py-1 text-xs text-[#f4ecd8] outline-none font-mono"
        />
        <PixelButton
          variant="lime"
          size="sm"
          icon={<Send className="h-3 w-3" />}
          onClick={handlePostTweet}
          disabled={!composeText.trim()}
        >
          Chirp
        </PixelButton>
      </div>
    </div>
  )
}
