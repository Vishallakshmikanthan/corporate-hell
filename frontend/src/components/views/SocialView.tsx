/**
 * CORPORATE HELL™ — Parody Social Media & Viral Feeds View.
 *
 * Implements Chirper, LinkedOut, and RedDot accounts, post publishing,
 * viral reach meters, and interactive "Reply Guy" comment threads.
 */
import { useState } from 'react'
import { useGameStore } from '../../state/gameStore'
import type { SocialPlatform, SocialPost } from '../../game/models/types'
import {
  MessageSquare,
  Share2,
  Heart,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Smile,
  ShieldAlert,
} from 'lucide-react'

export function SocialView() {
  const state = useGameStore((s) => s.state)
  const dispatch = useGameStore((s) => s.dispatch)

  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('chirper')
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [postKind, setPostKind] = useState<SocialPost['kind']>('announcement')

  if (!state) return null

  const accounts = state.socialAccounts || ({} as any)
  const activeAccount = accounts[activePlatform]
  const posts = (state.socialPosts || []).filter((p) => p.platform === activePlatform)

  const handlePublish = () => {
    dispatch({
      type: 'post_social',
      platform: activePlatform,
      kind: postKind,
      content: postContent,
    })
    setPostContent('')
    setIsComposeModalOpen(false)
  }

  const handleReply = (postId: string, commentId: string, responseKind: 'helpful' | 'defensive' | 'meme') => {
    dispatch({
      type: 'reply_social',
      postId,
      commentId,
      responseKind,
    })
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-ink-950 p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-800 pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-black text-paper-50 tracking-tight">
                Corporate Social Feeds
              </h1>
              <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold">
                Public Relations Hub
              </span>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              Build developer hype, viral engagement, and manage community crises.
            </p>
          </div>
        </div>

        {/* Compose Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsComposeModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Compose Post</span>
          </button>
        </div>
      </div>

      {/* Social Platform Switcher Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['chirper', 'linkedout', 'reddot', 'tiktak', 'instagrim', 'newsletter'] as SocialPlatform[]).map((p) => {
            const acc = accounts[p]
            const isSelected = activePlatform === p

            return (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition capitalize ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'border border-ink-800 bg-ink-900 text-ink-300 hover:bg-ink-850'
                }`}
              >
                <span>{p}</span>
                <span className="rounded-full bg-ink-950/60 px-1.5 py-0.2 text-[10px] font-mono">
                  {acc?.followers?.toLocaleString() || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Current Platform KPIs */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3 py-1.5 text-center font-mono text-xs">
            <span className="text-[10px] text-ink-400 block uppercase">Sentiment</span>
            <span className="font-bold text-emerald-400">{activeAccount?.sentiment || 75}% Pos</span>
          </div>

          <div className="rounded-xl border border-ink-800 bg-ink-900/80 px-3 py-1.5 text-center font-mono text-xs">
            <span className="text-[10px] text-ink-400 block uppercase">Engage Rate</span>
            <span className="font-bold text-purple-400">
              {((activeAccount?.engagementRate || 0.04) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="mt-6 flex-1 space-y-4">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-8 text-center text-ink-400 text-xs">
            No posts published on {activePlatform.toUpperCase()} yet. Click "Compose Post" to share company news!
          </div>
        ) : (
          posts.map((post) => {
            const isViral = post.reach > 4000

            return (
              <div
                key={post.id}
                className={`rounded-2xl border p-5 backdrop-blur shadow-lg transition ${
                  isViral
                    ? 'border-purple-500/60 bg-purple-950/20'
                    : 'border-ink-800 bg-ink-900/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-paper-100">{post.authorName}</span>
                      <span className="font-mono text-xs text-ink-400">Day {post.postedDay}</span>
                      {isViral && (
                        <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                          🔥 Trending Viral
                        </span>
                      )}
                    </div>
                    <span className="rounded bg-ink-800 text-ink-300 px-1.5 py-0.5 text-[9px] font-bold uppercase mt-1 inline-block">
                      {post.kind}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ink-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-pink-400" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3.5 w-3.5 text-blue-400" />
                      {post.shares.toLocaleString()}
                    </span>
                    <span className="text-paper-200 font-bold">Reach: {post.reach.toLocaleString()}</span>
                  </div>
                </div>

                {/* Post Text */}
                <p className="mt-3 text-sm text-paper-100 leading-relaxed font-sans">{post.content}</p>

                {/* Comment Thread */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-ink-800/80 pt-3">
                    <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block mb-1">
                      Community Responses
                    </span>

                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-xl border border-ink-800 bg-ink-950/70 p-3 text-xs flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-paper-100">{comment.author}</span>
                            <span className="text-ink-500 font-mono text-[11px]">{comment.handle}</span>
                            {comment.isRoast && (
                              <span className="rounded bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 text-[9px] font-bold">
                                Skeptic Roast
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-paper-200">{comment.text}</p>
                        </div>

                        {/* Reply Guy Buttons */}
                        {!comment.replied && (
                          <div className="flex items-center gap-2 border-t border-ink-900 pt-2">
                            <span className="text-[10px] text-ink-400">Reply as Corporate:</span>
                            <button
                              onClick={() => handleReply(post.id, comment.id, 'helpful')}
                              className="rounded-lg bg-ink-800 border border-ink-700 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-ink-750"
                            >
                              Helpful Support
                            </button>
                            <button
                              onClick={() => handleReply(post.id, comment.id, 'meme')}
                              className="rounded-lg bg-ink-800 border border-ink-700 px-2 py-0.5 text-[10px] font-semibold text-purple-300 hover:bg-ink-750"
                            >
                              Satirical Meme
                            </button>
                            <button
                              onClick={() => handleReply(post.id, comment.id, 'defensive')}
                              className="rounded-lg bg-ink-800 border border-ink-700 px-2 py-0.5 text-[10px] font-semibold text-amber-300 hover:bg-ink-750"
                            >
                              Defensive PR
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Compose Post Modal */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-2 text-paper-50 font-bold">
              <Send className="h-5 w-5 text-blue-400" />
              <span>Compose Post on {activePlatform.toUpperCase()}</span>
            </div>

            <div className="mt-4 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">
                  Post Genre
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['announcement', 'meme', 'thread', 'demo_video', 'behind_the_scenes', 'apology'] as SocialPost['kind'][]).map(
                    (k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setPostKind(k)}
                        className={`rounded-lg py-1.5 text-xs font-bold capitalize transition ${
                          postKind === k
                            ? 'bg-blue-600 text-white shadow'
                            : 'border border-ink-700 bg-ink-800 text-ink-300 hover:bg-ink-750'
                        }`}
                      >
                        {k.replace('_', ' ')}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1">
                  Post Body
                </label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share a groundbreaking product update, humblebrag about 10x engineering, or drop a tech meme..."
                  className="w-full rounded-xl border border-ink-700 bg-ink-850 p-3 text-xs text-paper-100 focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* Preset Quick Fill Buttons */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setPostContent(
                      'Thrilled to share that we just merged 14 PRs in 20 minutes without looking at the CI build. Move fast and break staging!',
                    )
                  }
                  className="rounded bg-ink-800 border border-ink-700 px-2 py-1 text-ink-300 hover:text-paper-100"
                >
                  "Move fast & break staging"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPostContent(
                      'Why modern software engineering is 10% coding and 90% agreeing on Jira ticket story point complexity.',
                    )
                  }
                  className="rounded bg-ink-800 border border-ink-700 px-2 py-1 text-ink-300 hover:text-paper-100"
                >
                  "10% coding 90% Jira"
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs text-ink-400 hover:text-paper-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Broadcast Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
