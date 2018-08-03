const Tonic = typeof require === 'function'
  ? require('tonic') : window.Tonic

class SidePanel extends Tonic {
  constructor () {
    super()
    this.stylesheet = `%style%`

    this.defaults = {
      position: 'right'
    }
  }

  show () {
    this.root.firstChild.classList.add('show')
  }

  hide () {
    this.root.firstChild.classList.remove('show')
  }

  click ({ target }) {
    const el = Tonic.match(target, '.close')
    if (el) this.hide()

    const overlay = Tonic.match(target, '.overlay')
    if (overlay) this.hide()

    this.value = {}
  }

  willConnect () {
    const {
      name,
      position,
      overlay
    } = { ...this.defaults, ...this.props }

    const id = this.getAttribute('id')

    // create wrapper
    const wrapper = document.createElement('div')
    wrapper.id = 'wrapper'
    wrapper.classList.add('wrapper')
    wrapper.classList.add(position)
    if (overlay) {
      wrapper.setAttribute('overlay', true)
    }
    if (name) {
      wrapper.setAttribute('name', name)
    }

    // create panel
    const panel = document.createElement('div')
    panel.className = 'panel'

    // create overlay
    const overlayElement = document.createElement('div')
    overlayElement.className = 'overlay'

    // create template
    const template = document.querySelector(`template[for="${id}"]`)
    const clone = document.importNode(template.content, true)
    const close = document.createElement('div')
    close.className = 'close'

    // create svg
    const file = './sprite.svg#close'
    const nsSvg = 'http://www.w3.org/2000/svg'
    const nsXlink = 'http://www.w3.org/1999/xlink'
    const svg = document.createElementNS(nsSvg, 'svg')
    const use = document.createElementNS(nsSvg, 'use')
    use.setAttributeNS(nsXlink, 'xlink:href', file)

    // append everything
    wrapper.appendChild(panel)
    wrapper.appendChild(panel)
    wrapper.appendChild(overlayElement)
    panel.appendChild(clone)
    panel.appendChild(close)
    close.appendChild(svg)
    svg.appendChild(use)

    this.structure = wrapper
  }

  render () {
    return this.structure
  }
}

Tonic.add(SidePanel, { shadow: true })
