export default class Emitter {
  constructor() {
    this.listeners = Object.create(null)
  }

  on(type, handler) {
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }

    this.listeners[type].push(handler)
  }

  off(type, handler) {
    if (this.listeners[type]) {
      let i = this.listeners[type].indexOf(handler)
      if (~i) this.listeners[type].splice(i, 1)
    }
  }

  async emit(type, evt) {
    await Promise.all(
      (this.listeners[type] || []).map(fn => Promise.resolve(fn(evt)))
    )

    await Promise.all(
      (this.listeners['*'] || []).map(fn => Promise.resolve(fn(type, evt)))
    )
  }
}
