/**
 * CORPORATE HELL™ — CorpOS Window Manager.
 *
 * Renders all open windows with retro pixel frames, dragging,
 * focus bring-to-front, and Nerd Mode telemetry toggle.
 */
import React from 'react'
import { useUiStore } from '../state/uiStore'
import { APP_REGISTRY } from './appRegistry'
import { PixelWindow } from '../ui/pixel/PixelWindow'
import { KanbanApp } from './apps/KanbanApp'
import { GitbubApp } from './apps/GitbubApp'
import { PipelineApp } from './apps/PipelineApp'
import { AwsomeApp } from './apps/AwsomeApp'
import { NvidiotApp } from './apps/NvidiotApp'
import { ChirperApp } from './apps/ChirperApp'
import { LaunchApp } from './apps/LaunchApp'
import { InvestorsApp } from './apps/InvestorsApp'
import { MailApp } from './apps/MailApp'
import { TeamApp } from './apps/TeamApp'
import { DirectiveApp } from './apps/DirectiveApp'
import { PagerApp } from './apps/PagerApp'
import { TalentRecruiterApp } from './apps/TalentRecruiterApp'
import { ProductForgeApp } from './apps/ProductForgeApp'

const APP_COMPONENTS: Record<string, React.FC> = {
  kanban: KanbanApp,
  gitbub: GitbubApp,
  pipeline: PipelineApp,
  awsome: AwsomeApp,
  nvidiot: NvidiotApp,
  chirper: ChirperApp,
  launch: LaunchApp,
  investors: InvestorsApp,
  mail: MailApp,
  team: TeamApp,
  directive: DirectiveApp,
  pager: PagerApp,
  talent: TalentRecruiterApp,
  forge: ProductForgeApp,
}

export const WindowManager: React.FC = () => {
  const openWindows = useUiStore((s) => s.openWindows)
  const closeApp = useUiStore((s) => s.closeApp)
  const minimizeApp = useUiStore((s) => s.minimizeApp)
  const nerdMode = useUiStore((s) => s.nerdMode)
  const toggleNerdMode = useUiStore((s) => s.toggleNerdMode)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {openWindows.map((win) => {
        const appDef = APP_REGISTRY.find((a) => a.id === win.appId)
        const AppComponent = APP_COMPONENTS[win.appId]
        if (!appDef || !AppComponent) return null

        return (
          <div key={win.appId} className="pointer-events-auto">
            <PixelWindow
              appId={win.appId}
              title={appDef.title}
              icon={appDef.icon}
              initialX={win.x}
              initialY={win.y}
              width={typeof window !== 'undefined' ? Math.min(740, window.innerWidth - 64) : 740}
              height={typeof window !== 'undefined' ? Math.min(480, window.innerHeight - 160) : 480}
              onClose={() => closeApp(win.appId)}
              onMinimize={() => minimizeApp(win.appId)}
              hasNerdMode={win.appId === 'kanban' || win.appId === 'gitbub'}
              isNerdMode={nerdMode}
              onToggleNerd={toggleNerdMode}
            >
              <AppComponent />
            </PixelWindow>
          </div>
        )
      })}
    </div>
  )
}
