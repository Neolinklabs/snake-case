// Mock canvas getContext for jsdom
HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: '',
    fillRect: () => {},
    strokeRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    fillText: () => {},
  }
}

// Mock Web Audio API for jsdom
class MockAudioContext {
  constructor() {
    this.state = 'running'
    this.currentTime = 0
  }
  createOscillator() {
    return {
      type: '',
      frequency: { value: 0 },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: { value: 0, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
    }
  }
  resume() {}
}

window.AudioContext = MockAudioContext
window.webkitAudioContext = MockAudioContext
