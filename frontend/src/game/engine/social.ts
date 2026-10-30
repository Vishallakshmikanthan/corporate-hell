/**
 * CORPORATE HELL™ — Parody Social Media & Viral Traffic Engine.
 *
 * Implements Chirper (@corp_), LinkedOut, and RedDot accounts,
 * formula-based post reach, viral outlier spikes, and reply mechanics.
 */
import type {
  ActionResult,
  CompanyState,
  SocialAccount,
  SocialComment,
  SocialPlatform,
  SocialPost,
} from '../models/types'
import { clamp } from '../models/types'
import { SeededRandom } from './rng'

export function createInitialSocialAccounts(): Record<SocialPlatform, SocialAccount> {
  return {
    chirper: { platform: 'chirper', followers: 1250, engagementRate: 0.045, sentiment: 72 },
    linkedout: { platform: 'linkedout', followers: 3400, engagementRate: 0.032, sentiment: 85 },
    reddot: { platform: 'reddot', followers: 890, engagementRate: 0.082, sentiment: 58 },
    tiktak: { platform: 'tiktak', followers: 450, engagementRate: 0.095, sentiment: 68 },
    instagrim: { platform: 'instagrim', followers: 780, engagementRate: 0.04, sentiment: 74 },
    newsletter: { platform: 'newsletter', followers: 1600, engagementRate: 0.22, sentiment: 80 },
  }
}

export function createInitialSocialPosts(): SocialPost[] {
  return [
    {
      id: 'post_welcome',
      platform: 'chirper',
      kind: 'announcement',
      content: 'We are thrilled to announce Corporate Hell v2! A revolutionary synergy platform transforming how humans endure meetings.',
      quality: 80,
      authorId: 'emp_chad',
      authorName: 'Chad Sterling (Marketing)',
      postedDay: 1,
      postedTick: 4,
      reach: 2400,
      likes: 184,
      shares: 42,
      sentiment: 75,
      comments: [
        {
          id: 'c_1',
          author: 'DevOpsDan',
          handle: '@dan_ops',
          text: 'Looks interesting! Does it support Kubernetes and dark mode out of the box?',
          likes: 24,
          replied: false,
        },
        {
          id: 'c_2',
          author: 'SaaS Roaster',
          handle: '@roastmysaas',
          text: 'Another enterprise dashboard that could have been an Excel spreadsheet.',
          likes: 67,
          isRoast: true,
          replied: false,
        },
      ],
    },
    {
      id: 'post_linkedout_thought',
      platform: 'linkedout',
      kind: 'thread',
      content: 'What failing 47 CI/CD builds on a Friday taught me about B2B sales and visionary leadership. A thread 🧵👇',
      quality: 85,
      authorId: 'emp_chad',
      authorName: 'Chad Sterling (Marketing)',
      postedDay: 1,
      postedTick: 12,
      reach: 5800,
      likes: 412,
      shares: 98,
      sentiment: 82,
      comments: [
        {
          id: 'c_3',
          author: 'Growth Guru Greg',
          handle: 'in/growthgreg',
          text: 'Agree! Vulnerability is the new quarterly revenue metric.',
          likes: 54,
          replied: false,
        },
      ],
    },
  ]
}

/**
 * Calculates social reach using Section 10 formula:
 * reach = round(followers * engagementRate * (contentQuality/100) * timingBonus * (1 + hype/100) * viralRoll)
 */
export function calculateSocialReach(
  followers: number,
  engagementRate: number,
  contentQuality: number,
  hype: number,
  currentTick: number,
  rng: SeededRandom,
): { reach: number; viralRoll: number; newFollowers: number } {
  // Peak engagement hours: 10:00 (tick 4) to 14:00 (tick 20)
  const isPeakHour = currentTick >= 4 && currentTick <= 20
  const timingBonus = isPeakHour ? 1.25 : 1.0

  // Viral roll: lognormal distribution with rare 10x-50x spikes
  let viralRoll = 1.0
  const roll = rng.next()
  if (roll < 0.03) {
    // Mega-viral outlier (10x - 30x)
    viralRoll = rng.float(10.0, 30.0)
  } else if (roll < 0.12) {
    // Mini-viral bump (2.5x - 5x)
    viralRoll = rng.float(2.5, 5.0)
  } else {
    // Standard normal drift around 0.8 to 1.5
    viralRoll = rng.float(0.75, 1.45)
  }

  const rawReach = Math.round(
    followers * engagementRate * (contentQuality / 100) * timingBonus * (1 + hype / 100) * viralRoll * 8,
  )
  const reach = Math.max(120, rawReach)

  // Follower conversion
  const conversionRate = 0.03
  const newFollowers = Math.max(2, Math.round(reach * conversionRate * (contentQuality / 100)))

  return { reach, viralRoll, newFollowers }
}

export function publishSocialPost(
  state: CompanyState,
  params: {
    platform: SocialPlatform
    kind: SocialPost['kind']
    content?: string
    authorId?: string
  },
  rng: SeededRandom,
): ActionResult {
  const account = state.socialAccounts[params.platform]
  if (!account) return { ok: false, reason: 'Social platform account not configured.' }

  const quality = rng.integer(65, 95)
  const hype = state.product?.hype || 20

  const { reach, viralRoll, newFollowers } = calculateSocialReach(
    account.followers,
    account.engagementRate,
    quality,
    hype,
    state.tick,
    rng,
  )

  account.followers += newFollowers

  const isMegaViral = viralRoll >= 8.0
  if (isMegaViral) {
    // Viral surge drives server traffic!
    state.infra.currentTraffic += Math.round(reach * 0.15)
    state.reputation = clamp(state.reputation + 8, 0, 100)
  }

  const post: SocialPost = {
    id: `post_${state.nextUid++}`,
    platform: params.platform,
    kind: params.kind,
    content:
      params.content ||
      `Exciting updates from our engineering war room! We just shipped high-velocity improvements to corporate synergy. #BuildingInPublic`,
    quality,
    authorId: params.authorId || state.playerAvatar?.name || 'Leadership',
    authorName: state.playerAvatar?.name || 'Corporate Team',
    postedDay: state.day,
    postedTick: state.tick,
    reach,
    likes: Math.round(reach * 0.08),
    shares: Math.round(reach * 0.015),
    sentiment: clamp(Math.round(account.sentiment + (quality > 75 ? 3 : -2)), 20, 100),
    comments: [
      {
        id: `c_${state.nextUid++}`,
        author: 'TechGuru_99',
        handle: '@techguru99',
        text: isMegaViral
          ? 'HOLY SHIT this blew up! Server status page looking spicy right now 🚀🔥'
          : 'Can verify this solved our workflow bottleneck. Great work team!',
        likes: rng.integer(5, 50),
        replied: false,
      },
    ],
  }

  state.socialPosts.unshift(post)
  if (state.socialPosts.length > 25) {
    state.socialPosts.pop()
  }

  return {
    ok: true,
    message: isMegaViral
      ? `🔥 POST WENT MEGA-VIRAL on ${account.platform.toUpperCase()}! Reach: ${reach.toLocaleString()} | +${newFollowers} new followers! Server traffic surging!`
      : `Posted to ${account.platform.toUpperCase()}. Reach: ${reach.toLocaleString()} | +${newFollowers} new followers.`,
    effects: [
      `Reach: ${reach.toLocaleString()}`,
      `+${newFollowers} Followers`,
      isMegaViral ? 'Traffic Spike Active' : 'Audience Engaged',
    ],
  }
}

export function replyToComment(
  state: CompanyState,
  postId: string,
  commentId: string,
  responseKind: 'helpful' | 'defensive' | 'meme',
  rng: SeededRandom,
): ActionResult {
  const post = state.socialPosts.find((p) => p.id === postId)
  if (!post) return { ok: false, reason: 'Post not found.' }

  const comment = post.comments.find((c) => c.id === commentId)
  if (!comment) return { ok: false, reason: 'Comment not found.' }

  comment.replied = true

  switch (responseKind) {
    case 'helpful':
      post.sentiment = clamp(post.sentiment + 5, 0, 100)
      state.reputation = clamp(state.reputation + 2, 0, 100)
      return {
        ok: true,
        message: 'Replied with helpful technical answer. Community appreciated the transparent support.',
        effects: ['Sentiment +5%', 'Reputation +2'],
      }

    case 'meme':
      if (rng.boolean(0.7)) {
        post.reach = Math.round(post.reach * 1.3)
        post.likes += rng.integer(40, 120)
        return {
          ok: true,
          message: 'Top-tier satirical meme posted! Comment thread went mini-viral (+30% reach bump).',
          effects: ['Reach +30%', 'Likes surged'],
        }
      }
      post.sentiment = clamp(post.sentiment - 4, 0, 100)
      return {
        ok: true,
        message: 'The meme was deemed slightly cringe by developer Twitter.',
        effects: ['Sentiment -4%'],
      }

    case 'defensive':
      post.sentiment = clamp(post.sentiment - 12, 0, 100)
      state.reputation = clamp(state.reputation - 4, 0, 100)
      return {
        ok: true,
        message: 'Argued defensively with commenter! The thread got ratio’d by angry engineers.',
        effects: ['Sentiment -12%', 'Ratio’d!'],
      }
  }
}
