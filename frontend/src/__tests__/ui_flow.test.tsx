// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import App from '../App'
import { useGameStore } from '../state/gameStore'

;(globalThis as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}


describe('UI New Game Flow', () => {
  it('renders LaunchScreen and transitions on New Game', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<App />)
    })

    console.log('Phase launch HTML:', container.innerHTML.slice(0, 200))

    // Find New Game button
    const buttons = Array.from(container.querySelectorAll('button'))
    const newGameBtn = buttons.find((b) => b.textContent?.includes('New Game'))
    expect(newGameBtn).toBeDefined()

    await act(async () => {
      newGameBtn?.click()
    })

    console.log('After click phase:', useGameStore.getState().phase)
    console.log('HTML after clicking New Game:', container.innerHTML.slice(0, 300))

    // Now in setup phase, find launch button
    const launchBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Found Corporation')
    )
    console.log('Found Corporation button exists?', !!launchBtn)

    if (launchBtn) {
      await act(async () => {
        launchBtn.click()
      })
      console.log('After launch phase:', useGameStore.getState().phase)
      console.log('HTML after launch:', container.innerHTML.slice(0, 300))
    }
  })
})
