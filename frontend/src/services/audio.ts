/**
 * CORPORATE HELL™ — Web Audio API Synthesizer.
 *
 * Procedural audio generation with no external audio file dependencies.
 * Respects browser autoplay restrictions and mute preferences.
 */

class AudioService {
  private ctx: AudioContext | null = null
  private muted: boolean = false
  private masterGain: GainNode | null = null
  private volume: number = 0.5

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime)
        this.masterGain.connect(this.ctx.destination)
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime)
    }
  }

  public isMuted(): boolean {
    return this.muted
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime)
    }
  }

  public getVolume(): number {
    return this.volume
  }

  /** Subtle UI click tone */
  public playClick() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const t = this.ctx.currentTime

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, t)
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04)

    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(t)
    osc.stop(t + 0.04)
  }

  /** Pleasant notification ping */
  public playChime() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const t = this.ctx.currentTime

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(587.33, t) // D5
    osc.frequency.setValueAtTime(880, t + 0.08) // A5

    gain.gain.setValueAtTime(0.18, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(t)
    osc.stop(t + 0.35)
  }

  /** Corporate meeting bell */
  public playMeetingBell() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const t = this.ctx.currentTime
    const freqs = [523.25, 659.25, 783.99] // C5, E5, G5 chord
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t + idx * 0.06)

      gain.gain.setValueAtTime(0.1, t + idx * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.5)

      osc.connect(gain)
      gain.connect(this.masterGain!)

      osc.start(t + idx * 0.06)
      osc.stop(t + idx * 0.06 + 0.5)
    })
  }

  /** Celebratory achievement fanfare */
  public playCelebration() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const notes = [440, 554.37, 659.25, 880] // A4, C#5, E5, A5
    const t = this.ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()
      const noteTime = t + idx * 0.08

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, noteTime)

      gain.gain.setValueAtTime(0.15, noteTime)
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35)

      osc.connect(gain)
      gain.connect(this.masterGain!)

      osc.start(noteTime)
      osc.stop(noteTime + 0.35)
    })
  }

  /** Crisis / warning buzzer */
  public playAlert() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const t = this.ctx.currentTime

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.setValueAtTime(196, t + 0.1)

    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(t)
    osc.stop(t + 0.3)
  }

  /** Money cash register sound */
  public playCash() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(987.77, t) // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.07) // E6

    gain.gain.setValueAtTime(0.15, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(t)
    osc.stop(t + 0.4)
  }

  /** Coffee machine brewing whoosh/pour */
  public playCoffee() {
    if (this.muted) return
    this.initContext()
    if (!this.ctx || !this.masterGain) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const t = this.ctx.currentTime

    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, t)
    osc.frequency.linearRampToValueAtTime(450, t + 0.25)

    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(t)
    osc.stop(t + 0.3)
  }
}

export const audio = new AudioService()
