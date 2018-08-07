
    document.addEventListener('DOMContentLoaded', e => {
      class ContentTooltip extends Tonic { /* global Tonic */
  defaults (props) {
    return {
      width: '450px',
      height: 'auto'
    }
  }

  style () {
    return `content-tooltip .text {
  position: relative;
  display: inline-block;
  cursor: default;
}
content-tooltip .text .tooltip {
  position: absolute;
  top: 30px;
  background: var(--window);
  border: 1px solid var(--border);
  border-radius: 2px;
  transition: opacity 0.3s ease-in-out, z-index 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  visibility: hidden;
  z-index: -1;
  opacity: 0;
}
content-tooltip .text .tooltip.show {
  box-shadow: 0px 30px 90px -20px rgba(0,0,0,0.3);
  visibility: visible;
  opacity: 1;
  z-index: 1;
}
content-tooltip .text .tooltip.arrow span {
  width: 12px;
  height: 12px;
  position: absolute;
  z-index: -1;
  background-color: var(--window);
  border: 1px solid transparent;
  border-radius: 2px;
  pointer-events: none;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
  left: 50%;
}
content-tooltip .text .tooltip.top span {
  margin-bottom: -6px;
  bottom: 100%;
  border-top-color: var(--border);
  border-left-color: var(--border);
}
content-tooltip .text .tooltip.bottom span {
  margin-top: -6px;
  position: absolute;
  top: 100%;
  border-bottom-color: var(--border);
  border-right-color: var(--border);
}
content-tooltip .text .image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  -webkit-clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 55% 75%, 47% 83%, 39% 75%, 0% 75%);
  clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 55% 75%, 47% 83%, 39% 75%, 0% 75%);
}
`
  }

  mouseenter (e) {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      const tooltip = this.root.querySelector('.tooltip')
      let el = this.root.parentNode

      while (true) {
        if (!el || el.tagName === 'html') break
        if (window.getComputedStyle(el).overflow === 'scroll') break
        el = el.parentNode
      }

      let { top } = this.root.getBoundingClientRect()
      top += (el.scrollY || 0)
      let left = -(tooltip.offsetWidth / 2) + (this.root.offsetWidth / 2)

      if (left < 0) {
        left = 0
      }

      if ((left + tooltip.offsetWidth) > window.innerWidth) {
        left = window.innerWidth - tooltip.offsetWidth
      }

      if (top < (window.innerHeight / 2)) {
        tooltip.classList.remove('bottom')
        tooltip.classList.add('top')
        tooltip.style.top = `30px`
        tooltip.style.left = `${left}px`
      } else {
        tooltip.classList.remove('top')
        tooltip.classList.add('bottom')
        const offsetTop = tooltip.offsetHeight + this.root.offsetHeight
        tooltip.style.top = `-${offsetTop}px`
        tooltip.style.left = `${left}px`
      }

      tooltip.classList.add('show')
    }, 128)
  }

  mouseleave (e) {
    clearTimeout(this.timer)
    const tooltip = this.root.querySelector('.tooltip')
    tooltip.classList.remove('show')
  }

  render () {
    const {
      id,
      width,
      theme,
      height
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    const style = []
    if (width) style.push(`width: ${width};`)
    if (height) style.push(`height: ${height};`)

    const arrow = document.createElement('span')
    arrow.textContent = ' '

    const span = document.createElement('span')
    span.innerHTML = this.root.innerHTML
    span.className = 'text'

    while (this.root.firstChild) this.root.firstChild.remove()

    const tooltip = document.createElement('div')
    tooltip.className = 'tooltip arrow'
    tooltip.setAttribute('style', style.join(''))
    const template = document.querySelector(`template[for="${id}"]`)
    const clone = document.importNode(template.content, true)

    tooltip.appendChild(arrow)
    tooltip.appendChild(clone)
    span.appendChild(tooltip)
    this.root.appendChild(span)
    return span
  }
}

Tonic.add(ContentTooltip)

class DialogBox extends Tonic { /* global Tonic */
  constructor (props) {
    super(props)

    this.root.show = () => this.show()
    this.root.hide = () => this.hide()
  }

  defaults () {
    return {
      width: '450px',
      height: '275px',
      overlay: true,
      backgroundColor: 'rgba(0,0,0,0.5)'
    }
  }

  compile (s) {
    const body = `return \`${s}\``
    return o => {
      const keys = Object.keys(o)
      const values = Tonic.sanitize(Object.values(o))
      //
      // We have sanitized the strings that are being
      // passed into the template, so this is ok.
      //
      // eslint-disable-next-line
      return new Function(...keys, body)(...values)
    }
  }

  template (id) {
    const node = document.querySelector(`template[for="${id}"]`)
    const template = this.compile(node.innerHTML)
    const div = document.createElement('div')
    div.innerHTML = template({ data: this.props })
    return div
  }

  style () {
    return `dialog-box * {
  box-sizing: border-box;
}
dialog-box > .wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 100;
  visibility: hidden;
  transition: visibility 0s ease 0.5s;
}
dialog-box > .wrapper.show {
  visibility: visible;
  transition: visibility 0s ease 0s;
}
dialog-box > .wrapper.show .overlay {
  opacity: 1;
}
dialog-box > .wrapper.show .dialog {
  opacity: 1;
  -webkit-transform: scale(1);
  -ms-transform: scale(1);
  transform: scale(1);
}
dialog-box .overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
dialog-box .dialog {
  padding-top: 50px;
  margin: auto;
  position: relative;
  background-color: var(--window);
  box-shadow: 0px 30px 90px -20px rgba(0,0,0,0.3), 0 0 1px #a2a9b1;
  border-radius: 4px;
  -webkit-transform: scale(0.8);
  -ms-transform: scale(0.8);
  transform: scale(0.8);
  transition: all 0.3s ease-in-out;
  z-index: 1;
  opacity: 0;
}
dialog-box .dialog header {
  height: 70px;
  font: 14px 'Poppins', sans-serif;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: 1.5px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 26px 65px 25px 65px;
}
dialog-box .dialog main {
  width: auto;
  text-align: center;
  padding: 20px;
  margin: 0 auto;
}
dialog-box .dialog .close {
  width: 25px;
  height: 25px;
  position: absolute;
  top: 25px;
  right: 25px;
  cursor: pointer;
}
dialog-box .dialog .close svg {
  width: 100%;
  height: 100%;
}
dialog-box .dialog .close svg use {
  fill: var(--primary);
  color: var(--primary);
}
dialog-box .dialog footer {
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 88px;
  padding: 15px;
}
dialog-box .dialog footer input-button {
  display: inline-block;
  margin: 0 5px;
}
`
  }

  setContent (s) {
    this.root.querySelector('main').innerHTML = s
  }

  show () {
    setImmediate(() => {
      this.root.firstChild.classList.add('show')
    })
  }

  hide () {
    setImmediate(() => {
      this.root.firstChild.classList.remove('show')
    })
  }

  click (e) {
    const el = Tonic.match(e.target, '.close')
    if (el) this.hide()

    const overlay = e.target.matches('.overlay')
    if (overlay) this.hide()
  }

  render () {
    const {
      width,
      height,
      overlay,
      theme,
      backgroundColor
    } = this.props

    const id = this.root.getAttribute('id')

    if (this.state.rendered) {
      const div = this.root.querySelector('.dialog div')
      div.parentNode.replaceChild(this.template(id), div)
      return this.root.firstChild
    }

    this.state.rendered = true

    if (theme) this.root.classList.add(`theme-${theme}`)

    const style = []
    if (width) style.push(`width: ${width};`)
    if (height) style.push(`height: ${height};`)

    // create wrapper
    const wrapper = document.createElement('div')
    wrapper.className = 'wrapper'

    // create overlay
    if (overlay !== 'false') {
      const overlayElement = document.createElement('div')
      overlayElement.className = 'overlay'
      overlayElement.setAttribute('style', `background-color: ${backgroundColor}`)
      wrapper.appendChild(overlayElement)
    }

    // create dialog
    const dialog = document.createElement('div')
    dialog.className = 'dialog'
    dialog.setAttribute('style', style.join(''))

    // close button
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
    wrapper.appendChild(dialog)
    dialog.appendChild(this.template(id))
    dialog.appendChild(close)
    close.appendChild(svg)
    svg.appendChild(use)

    return wrapper
  }
}

Tonic.add(DialogBox)

class IconContainer extends Tonic { /* global Tonic */
  defaults () {
    return {
      size: '25px',
      color: 'var(--primary)',
      src: './sprite.svg#example'
    }
  }

  style () {
    return `icon-container svg {
  width: 100%;
  height: 100%;
}
`
  }

  render () {
    let {
      color,
      size,
      theme,
      src
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    if (color === 'undefined' || color === 'color') {
      color = this.defaults.color
    }

    const style = `fill: ${color}; color: ${color};`

    return `
      <div class="wrapper" style="width: ${size}; height: ${size};">
        <svg>
          <use xlink:href="${src}" style="${style}">
        </svg>
      </div>
    `
  }
}

Tonic.add(IconContainer)

class InputButton extends Tonic { /* global Tonic */
  constructor (props) {
    super(props)
    this.root.done = () => this.done()
  }
  defaults () {
    return {
      value: 'Submit',
      disabled: false,
      autofocus: false,
      height: '40px',
      width: '150px',
      radius: '2px'
    }
  }

  style () {
    return `input-button {
  display: inline-block;
}
input-button[width="100%"] {
  display: block;
}
input-button .wrapper {
  margin: 5px;
}
input-button button {
  color: var(--primary);
  width: auto;
  min-height: 40px;
  font: 12px var(--subheader);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 8px 8px 5px 8px;
  position: relative;
  background-color: transparent;
  border: 1px solid var(--primary);
  outline: none;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input-button button[disabled],
input-button button.active {
  color: var(--medium);
  background-color: var(--background);
  border-color: var(--background);
}
input-button button:not([disabled]):hover {
  color: var(--window);
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  cursor: pointer;
}
input-button button.loading {
  color: transparent;
  background: var(--medium);
  border-color: var(--medium);
  pointer-events: none;
  transition: background 0.3s ease;
}
input-button button.loading:hover {
  background: var(--medium);
  border-color: var(--medium);
}
input-button button.loading:before {
  margin-top: -8px;
  margin-left: -8px;
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  opacity: 1;
  -webkit-transform: translateX(-50%) translateY(-50%);
  -ms-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  -webkit-animation: spin 1s linear 0s infinite;
  animation: spin 1s linear 0s infinite;
  transition: opacity 0.3s ease;
}
input-button button:before {
  content: '';
  width: 14px;
  height: 14px;
  opacity: 0;
}
@-moz-keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-o-keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
`
  }

  done () {
    setImmediate(() => {
      const button = this.root.querySelector('button')
      button.classList.remove('loading')
    })
  }

  click () {
    if (!this.props.async) return

    setImmediate(() => {
      const button = this.root.querySelector('button')
      button.classList.add('loading')
    })
  }

  render () {
    const {
      id,
      name,
      value,
      type,
      disabled,
      autofocus,
      isActive,
      width,
      height,
      radius,
      theme,
      fill,
      textColor
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    const idAttr = id ? `id="${id}"` : ''
    const nameAttr = name ? `name="${name}"` : ''
    const valueAttr = value ? `value="${value}"` : ''
    const typeAttr = type ? `type="${type}"` : ''

    let style = []
    if (width) style.push(`width: ${width}`)
    if (height) style.push(`height: ${height}`)
    if (radius) style.push(`border-radius: ${radius}`)
    if (fill) {
      style.push(`background-color: ${fill}`)
      style.push(`border-color: ${fill}`)
    }
    if (textColor) style.push(`color: ${textColor}`)
    style = style.join('; ')

    let classes = []
    if (isActive) classes.push(`active`)
    classes = classes.join(' ')

    return `
      <div class="wrapper">
        <button
          ${idAttr}
          ${nameAttr}
          ${valueAttr}
          ${typeAttr}
          ${disabled ? 'disabled' : ''}
          ${autofocus ? 'autofocus' : ''}
          class="${classes}"
          style="${style}">${value}</button>
      </div>
    `
  }
}

Tonic.add(InputButton)

class InputCheckbox extends Tonic { /* global Tonic */
  defaults () {
    return {
      disabled: false,
      checked: false,
      color: 'var(--primary)',
      size: '18px',
      on: './sprite.svg#checkbox_on',
      off: './sprite.svg#checkbox_off'
    }
  }

  style () {
    return `input-checkbox .wrapper {
  display: inline-block;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
input-checkbox input[type="checkbox"] {
  display: none;
}
input-checkbox input[type="checkbox"][disabled] + label {
  opacity: 0.35;
}
input-checkbox label {
  color: var(--primary);
  font: 12px 'Poppins', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: inline-block;
  vertical-align: middle;
}
input-checkbox label:nth-of-type(2) {
  padding-top: 2px;
  margin-left: 10px;
}
input-checkbox svg {
  width: 100%;
  height: 100%;
}
`
  }

  change (e) {
    const state = this.props.checked = !this.props.checked
    const props = { ...this.defaults, ...this.props }
    const file = props[state ? 'on' : 'off']
    const ns = 'http://www.w3.org/1999/xlink'
    this.root.querySelector('use').setAttributeNS(ns, 'xlink:href', file)
  }

  connected () {
    this.label = this.root.querySelector('label')
  }

  updated (oldProps) {
    if (oldProps.checked !== this.props.checked) {
      this.root.dispatchEvent(new window.Event('change'))
    }
  }

  renderLabel () {
    if (!this.props.label) return ''
    return `<label for="${this.props.id}">${this.props.label}</label>`
  }

  render () {
    const {
      id,
      name,
      disabled,
      checked,
      color,
      on,
      theme,
      off,
      size
    } = this.props

    if (theme) this.classList.add(`theme-${theme}`)

    const state = checked ? on : off
    const nameAttr = name ? `name="${name}"` : ''
    const style = `fill: ${color}; color: ${color};`

    //
    // the id attribute can be removed to the input
    // and added to the input inside the component.
    //
    this.root.removeAttribute('id')

    return `
      <div class="wrapper">
        <input
          type="checkbox"
          id="${id}"
          ${nameAttr}
          ${disabled ? 'disabled' : ''}
          ${checked ? 'checked' : ''}/>
        <label
          for="${id}"
          style="width: ${size}; height: ${size};">
          <svg>
            <use xlink:href="${state}" style="${style}">
          </svg>
        </label>
        ${this.renderLabel()}
      </div>
    `
  }
}

Tonic.add(InputCheckbox)

class InputSelect extends Tonic { /* global Tonic */
  defaults () {
    return {
      disabled: false,
      width: '250px'
    }
  }

  style () {
    return `input-select select {
  font: 14px var(--monospace);
  padding: 10px;
  background-color: var(--window);
  border-radius: 2px;
  border: 1px solid var(--border);
  outline: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
`
  }

  renderLabel () {
    if (!this.props.label) return ''
    return `<label>${this.props.label}</label>`
  }

  render () {
    const {
      id,
      name,
      value,
      disabled,
      required,
      width,
      height,
      padding,
      theme,
      radius
    } = this.props

    const idAttr = id ? `id="${id}"` : ''
    const nameAttr = name ? `name="${name}"` : ''
    const valueAttr = value ? `value="${value}"` : ''

    if (theme) this.root.classList.add(`theme-${theme}`)

    let style = []
    if (width) style.push(`width: ${width}`)
    if (height) style.push(`height: ${height}`)
    if (radius) style.push(`border-radius: ${radius}`)
    if (padding) style.push(`padding: ${padding}`)
    style.push(`background-image: url('${InputSelect.svg.default()}')`)
    style = style.join('; ')

    return `
      <div class="wrapper">
        ${this.renderLabel()}

        <select
          ${idAttr}
          ${nameAttr}
          ${valueAttr}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
          style="${style}">
          <option>Example</option>
        </select>
      </div>
    `
  }
}

InputSelect.svg = {}
InputSelect.svg.default = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#D7DBDD" d="M61.4,45.8l-11,13.4c-0.2,0.3-0.5,0.3-0.7,0l-11-13.4c-0.3-0.3-0.1-0.8,0.4-0.8h22C61.4,45,61.7,45.5,61.4,45.8z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

Tonic.add(InputSelect)

class InputText extends Tonic { /* global Tonic */
  defaults () {
    return {
      type: 'text',
      value: '',
      placeholder: '',
      spellcheck: false,
      ariaInvalid: false,
      disabled: false,
      width: '250px',
      position: 'right'
    }
  }

  style () {
    return `input-text .wrapper {
  position: relative;
}
input-text .wrapper.right icon-container {
  right: 10px;
}
input-text .wrapper.right input {
  padding-right: 40px;
}
input-text .wrapper.left icon-container {
  left: 10px;
}
input-text .wrapper.left input {
  padding-left: 40px;
}
input-text icon-container {
  position: absolute;
  bottom: 7px;
}
input-text label {
  color: var(--medium);
  font-weight: 500;
  font: 12px/14px 'Poppins', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 10px;
  display: block;
}
input-text input {
  color: var(--primary);
  width: 100%;
  font: 14px var(--monospace);
  padding: 10px;
  background-color: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  transition: border 0.2s ease-in-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
}
input-text input:focus {
  border-color: var(--primary);
}
input-text input[disabled] {
  background-color: var(--background);
}
`
  }

  renderLabel () {
    if (!this.props.label) return ''
    return `<label>${this.props.label}</label>`
  }

  renderIcon () {
    if (!this.props.src) return ''

    return `
      <icon-container
        src="${this.props.src}"
        color="${this.props.color}">
      </icon-container>
    `
  }

  render () {
    const {
      id,
      name,
      type,
      value,
      placeholder,
      spellcheck,
      ariaInvalid,
      disabled,
      required,
      width,
      height,
      padding,
      theme,
      radius,
      position
    } = this.props

    const idAttr = id ? `id="${id}"` : ''
    const nameAttr = name ? `name="${name}"` : ''
    const valueAttr = value ? `value="${value}"` : ''
    const placeholderAttr = placeholder ? `placeholder="${placeholder}"` : ''
    const spellcheckAttr = spellcheck ? `spellcheck="${spellcheck}"` : ''
    const ariaInvalidAttr = ariaInvalid ? `aria-invalid="${ariaInvalid}"` : ''

    if (theme) this.root.classList.add(`theme-${theme}`)

    let style = []
    if (width) style.push(`width: ${width}`)
    if (height) style.push(`height: ${height}`)
    if (radius) style.push(`border-radius: ${radius}`)
    if (padding) style.push(`padding: ${padding}`)
    style = style.join('; ')

    return `
      <div class="wrapper ${position}" style="${style}">
        ${this.renderLabel()}
        ${this.renderIcon()}

        <input
          ${idAttr}
          ${nameAttr}
          type="${type}"
          ${valueAttr}
          ${placeholderAttr}
          ${spellcheckAttr}
          ${ariaInvalidAttr}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
          style="${style}"
        />
      </div>
    `
  }
}

Tonic.add(InputText)

class InputTextarea extends Tonic { /* global Tonic */
  defaults () {
    return {
      placeholder: '',
      spellcheck: true,
      disabled: false,
      required: false,
      readonly: false,
      autofocus: false,
      width: '100%',
      radius: '2px'
    }
  }

  style () {
    return `input-textarea textarea {
  color: var(--primary);
  width: 100%;
  font: 14px var(--monospace);
  padding: 10px;
  background-color: transparent;
  border: 1px solid var(--border);
  outline: none;
  transition: all 0.2s ease-in-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input-textarea textarea:focus {
  border: 1px solid var(--primary);
}
input-textarea textarea:invalid {
  border-color: var(--danger);
}
input-textarea textarea[disabled] {
  background-color: var(--background);
}
input-textarea label {
  color: var(--medium);
  font-weight: 500;
  font: 12px/14px var(--subheader);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 10px;
  display: block;
}
`
  }

  renderLabel () {
    if (!this.props.label) return ''
    return `<label>${this.props.label}</label>`
  }

  render () {
    const {
      id,
      name,
      placeholder,
      spellcheck,
      disabled,
      required,
      readonly,
      autofocus,
      rows,
      cols,
      minlength,
      maxlength,
      width,
      height,
      theme,
      radius,
      resize
    } = this.props

    const idAttr = id ? `id="${id}"` : ''
    const nameAttr = name ? `name="${name}"` : ''
    const placeholderAttr = placeholder ? `placeholder="${placeholder}"` : ''
    const spellcheckAttr = spellcheck ? `spellcheck="${spellcheck}"` : ''

    if (theme) this.root.classList.add(`theme-${theme}`)

    let style = []
    if (width) style.push(`width: ${width}`)
    if (height) style.push(`height: ${height}`)
    if (radius) style.push(`border-radius: ${radius}`)
    if (resize) style.push(`resize: ${resize}`)
    style = style.join('; ')

    return `
      <div class="wrapper">
        ${this.renderLabel()}
        <textarea
          ${idAttr}
          ${nameAttr}
          ${placeholderAttr}
          ${spellcheckAttr}
          ${disabled ? 'disabled' : ''}
          ${required ? 'required' : ''}
          ${readonly ? 'readonly' : ''}
          ${autofocus ? 'autofocus' : ''}
          rows="${rows}"
          cols="${cols}"
          minlength="${minlength}"
          maxlength="${maxlength}"
          style="${style}"></textarea>
      </div>
    `
  }
}

Tonic.add(InputTextarea)

class InputToggle extends Tonic { /* global Tonic */
  defaults () {
    return {
      checked: false
    }
  }

  style () {
    return `input-toggle .wrapper {
  height: 30px;
  width: 47px;
  position: relative;
}
input-toggle .wrapper > label {
  color: var(--medium);
  font-weight: 500;
  font: 12px/14px 'Poppins', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 58px;
  padding-top: 9px;
  display: block;
}
input-toggle .switch {
  position: absolute;
  left: 0;
  top: 0;
}
input-toggle .switch label:before {
  font: bold 12px 'Poppins', sans-serif;
  text-transform: uppercase;
}
input-toggle .switch input.toggle {
  position: absolute;
  display: none;
  outline: none;
  user-select: none;
  z-index: 1;
}
input-toggle .switch input.toggle + label {
  width: 42px;
  height: 24px;
  padding: 2px;
  display: block;
  position: relative;
  background-color: var(--border);
  border-radius: 60px;
  transition: background 0.4s ease-in-out;
  cursor: default;
}
input-toggle .switch input.toggle + label:before {
  content: '';
  line-height: 29px;
  text-indent: 29px;
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  display: block;
  border-radius: 60px;
  transition: background 0.4s ease-in-out;
  padding-top: 1px;
  font-size: 0.65em;
  letter-spacing: 0.05em;
  background-color: var(--border);
}
input-toggle .switch input.toggle + label:after {
  content: '';
  width: 16px;
  position: absolute;
  top: 4px;
  left: 4px;
  bottom: 4px;
  background-color: var(--window);
  border-radius: 52px;
  transition: background 0.4s ease-in-out, margin 0.4s ease-in-out;
  display: block;
  z-index: 2;
}
input-toggle .switch input.toggle:disabled {
  cursor: default;
  background-color: var(--background);
}
input-toggle .switch input.toggle:disabled + label {
  cursor: default;
  background-color: var(--background);
}
input-toggle .switch input.toggle:disabled + label:before {
  background-color: var(--background);
}
input-toggle .switch input.toggle:disabled + label:after {
  background-color: var(--window);
}
input-toggle .switch input.toggle:checked + label {
  background-color: var(--accent);
}
input-toggle .switch input.toggle:checked + label:before {
  content: ' ';
  background-color: var(--accent);
  color: var(--background);
}
input-toggle .switch input.toggle:checked + label:after {
  margin-left: 18px;
  background-color: var(--background);
}
`
  }

  change (e) {
    this.props.checked = !this.props.checked
  }

  renderLabel () {
    if (!this.props.label) return ''
    return `<label for="${this.props.id}">${this.props.label}</label>`
  }

  render () {
    const {
      id,
      name,
      disabled,
      theme,
      checked
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    //
    // the id attribute can be removed to the input
    // and added to the input inside the component.
    //
    this.root.removeAttribute('id')

    const nameAttr = name ? `name="${name}"` : ''

    return `
      <div class="wrapper">
        <div class="switch">
          <input
            type="checkbox"
            class="toggle"
            id="${id}"
            ${nameAttr}
            ${disabled ? 'disabled' : ''}
            ${checked ? 'checked' : ''}>
          <label for="${id}"></label>
        </div>
        ${this.renderLabel()}
      </div>
    `
  }
}

Tonic.add(InputToggle)

class NotificationBadge extends Tonic { /* global Tonic */
  defaults () {
    return {}
  }

  style () {
    return `notification-badge * {
  box-sizing: border-box;
}
notification-badge .notifications {
  background-color: var(--background);
  width: 40px;
  height: 40px;
  padding: 10px;
  border-radius: 8px;
}
notification-badge .notifications span {
  color: var(--primary);
  font: 15px var(--subheader);
  letter-spacing: 1px;
  text-align: center;
  position: relative;
}
notification-badge .notifications span:after {
  content: '';
  width: 8px;
  height: 8px;
  display: block;
  position: absolute;
  top: -3px;
  right: -6px;
  border-radius: 50%;
  background-color: var(--notification);
  border: 2px solid var(--background);
}
`
  }

  render () {
    let {
      count,
      theme
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    //
    // the id attribute can be removed to the input
    // and added to the input inside the component.
    //
    this.root.removeAttribute('id')

    count = '23'

    return `
      <div class="notifications">
        <span>${count}</span>
      </div>
    `
  }
}

Tonic.add(NotificationBadge)

class NotificationCenter extends Tonic { /* global Tonic */
  constructor (props) {
    super(props)

    this.root.create = (o) => this.create(o)
    this.root.hide = () => this.hide()
  }

  defaults () {
    const computed = window.getComputedStyle(this.root)
    const getVar = s => computed.getPropertyValue(`--${s}`)

    return {
      closeIcon: NotificationCenter.svg.closeIcon,
      dangerIcon: NotificationCenter.svg.dangerIcon(getVar('danger')),
      warningIcon: NotificationCenter.svg.warningIcon(getVar('warning')),
      successIcon: NotificationCenter.svg.successIcon(getVar('success')),
      infoIcon: NotificationCenter.svg.infoIcon(getVar('info')),
      position: 'center'
    }
  }

  style () {
    return `notification-center * {
  box-sizing: border-box;
}
notification-center .wrapper {
  user-select: none;
  position: fixed;
  top: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  visibility: hidden;
  z-index: 102;
}
notification-center .wrapper.show {
  visibility: visible;
}
notification-center .wrapper.center {
  left: 50%;
  align-items: center;
  -webkit-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  transform: translateX(-50%);
}
notification-center .wrapper.left {
  align-items: flex-start;
  left: 10px;
}
notification-center .wrapper.right {
  align-items: flex-end;
  right: 10px;
}
notification-center .notification {
  width: auto;
  max-width: 600px;
  margin-top: 10px;
  position: relative;
  background-color: var(--window);
  box-shadow: 0px 10px 40px -20px rgba(0,0,0,0.4), 0 0 1px #a2a9b1;
  border-radius: 3px;
  -webkit-transform: translateY(-100px);
  -ms-transform: translateY(-100px);
  transform: translateY(-100px);
  transition: opacity 0.2s ease, transform 0s ease 1s;
  z-index: 1;
  opacity: 0;
}
notification-center .notification.show {
  opacity: 1;
  -webkit-transform: translateY(0);
  -ms-transform: translateY(0);
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}
notification-center .notification.close {
  padding-right: 50px;
}
notification-center .notification.alert {
  padding-left: 35px;
}
notification-center .notification main {
  padding: 17px 15px 15px 15px;
}
notification-center .notification main .title {
  font: 14px/18px var(--subheader);
}
notification-center .notification main .message {
  font: 14px/18px var(--subheader);
  color: var(--medium);
}
notification-center .notification .icon {
  width: 16px;
  height: 16px;
  position: absolute;
  left: 20px;
  top: 50%;
  background-size: cover;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
notification-center .notification .close {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 20px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  cursor: pointer;
  background-size: cover;
}
notification-center .notification .close svg path {
  fill: var(--primary);
  color: var(--primary);
}
`
  }

  create ({ message, title, duration, type } = {}) {
    this.show()

    const notification = document.createElement('div')
    notification.className = 'notification'
    const main = document.createElement('main')
    if (type) {
      notification.classList.add('alert')
    }

    const titleElement = document.createElement('div')
    titleElement.className = 'title'
    titleElement.textContent = title || this.props.title

    const messageElement = document.createElement('div')
    messageElement.className = 'message'
    messageElement.textContent = message || this.props.message

    if (!duration) {
      const close = document.createElement('div')
      close.className = 'close'
      const color = window.getComputedStyle(this.root).getPropertyValue('--primary')
      close.style.backgroundImage = `url("${this.props.closeIcon(color)}")`
      notification.appendChild(close)
      notification.classList.add('close')
    }

    if (type) {
      const alertIcon = document.createElement('div')
      alertIcon.className = 'icon'
      notification.appendChild(alertIcon)

      switch (type) {
        case 'danger':
          alertIcon.style.backgroundImage = `url("${this.props.dangerIcon}")`
          if (!title && !message) { titleElement.textContent = 'Danger' }
          break

        case 'warning':
          alertIcon.style.backgroundImage = `url("${this.props.warningIcon}")`
          if (!title && !message) { titleElement.textContent = 'Warning' }
          break

        case 'success':
          alertIcon.style.backgroundImage = `url("${this.props.successIcon}")`
          if (!title && !message) { titleElement.textContent = 'Success' }
          break

        case 'info':
          alertIcon.style.backgroundImage = `url("${this.props.infoIcon}")`
          if (!title && !message) { titleElement.textContent = 'Information' }
          break
      }
    }

    notification.appendChild(main)
    main.appendChild(titleElement)
    main.appendChild(messageElement)
    this.root.querySelector('.wrapper').appendChild(notification)
    setImmediate(() => notification.classList.add('show'))

    if (duration) {
      setTimeout(() => this.destroy(notification), duration)
    }
  }

  destroy (notification) {
    notification.classList.remove('show')
    notification.addEventListener('transitionend', e => {
      notification.parentNode.removeChild(notification)
    })
  }

  show () {
    this.root.firstElementChild.classList.add('show')
  }

  hide () {
    this.root.firstElementChild.classList.remove('show')
  }

  click (e) {
    const el = Tonic.match(e.target, '.close')
    if (!el) return

    const notification = el.closest('.notification')
    if (notification) this.destroy(notification)
  }

  render () {
    const {
      theme
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    return `<div class="wrapper"></div>`
  }
}

NotificationCenter.svg = {}

NotificationCenter.svg.closeIcon = (color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path fill="${color}" d="M80.7,22.6l-3.5-3.5c-0.1-0.1-0.3-0.1-0.4,0L50,45.9L23.2,19.1c-0.1-0.1-0.3-0.1-0.4,0l-3.5,3.5c-0.1,0.1-0.1,0.3,0,0.4l26.8,26.8L19.3,76.6c-0.1,0.1-0.1,0.3,0,0.4l3.5,3.5c0,0,0.1,0.1,0.2,0.1s0.1,0,0.2-0.1L50,53.6l25.9,25.9c0.1,0.1,0.3,0.1,0.4,0l3.5-3.5c0.1-0.1,0.1-0.3,0-0.4L53.9,49.8l26.8-26.8C80.8,22.8,80.8,22.7,80.7,22.6z"/>
    </svg>
  `
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationCenter.svg.dangerIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50.1,6.7C26.3,6.7,6.9,26.2,6.9,50s19.4,43.2,43.2,43.2c23.8,0,43.2-19.5,43.2-43.3C93.3,26.1,74,6.7,50.1,6.7z M53.9,76.4h-7.6V68h7.6V76.4z M53.9,60.5h-7.6V25.6h7.6V60.5z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationCenter.svg.warningIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M98.6,86.6l-46-79.7c-1.2-2-4-2-5.2,0l-46,79.7c-1.2,2,0.3,4.5,2.6,4.5h92C98.3,91.1,99.8,88.6,98.6,86.6z M53.9,80.4h-7.6V72h7.6V80.4z M53.9,64.5h-7.6V29.6h7.6V64.5z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationCenter.svg.successIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50.1,6.7C26.3,6.7,6.9,26.2,6.9,50s19.4,43.2,43.2,43.2c23.8,0,43.2-19.5,43.2-43.3C93.3,26.1,74,6.7,50.1,6.7z M43.4,71.5L22,50.1l4.8-4.8L43.4,62l28.5-28.5l4.8,4.8L43.4,71.5z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationCenter.svg.infoIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50.1,6.7C26.3,6.7,6.9,26.2,6.9,50s19.4,43.2,43.2,43.2c23.8,0,43.2-19.5,43.2-43.3C93.3,26.1,74,6.7,50.1,6.7z M54.1,75.5h-8.1v-7.8h8.1V75.5z M64.1,47.6c-0.8,1.1-2.4,2.7-4.8,4.5L57,54c-1.4,1.1-2.3,2.3-2.7,3.7c-0.3,0.8-0.4,2-0.4,3.6h-8c0.1-3.4,0.5-5.8,1-7.1c0.5-1.3,2-2.9,4.3-4.7l2.4-1.9c0.8-0.6,1.5-1.3,2-2.1c0.9-1.3,1.4-2.8,1.4-4.3c0-1.8-0.5-3.4-1.6-4.9c-1.1-1.5-3-2.3-5.8-2.3c-2.7,0-4.7,0.9-5.9,2.8c-1,1.6-1.6,3.3-1.7,5.1h-8.6c0.4-5.9,2.5-10.1,6.4-12.6l0,0c2.5-1.6,5.7-2.5,9.4-2.5c4.9,0,9,1.2,12.2,3.5c3.2,2.3,4.8,5.7,4.8,10.3C66.2,43.4,65.5,45.7,64.1,47.6z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

Tonic.add(NotificationCenter)

class NotificationInline extends Tonic { /* global Tonic */
  constructor (props) {
    super(props)

    this.root.create = (o) => this.create(o)
    this.root.hide = () => this.hide()
  }

  defaults () {
    return {
      closeIcon: NotificationInline.svg.closeIcon,
      dangerIcon: NotificationInline.svg.dangerIcon('#f06653'),
      warningIcon: NotificationInline.svg.warningIcon('#f9a967'),
      successIcon: NotificationInline.svg.successIcon('#85b274'),
      infoIcon: NotificationInline.svg.infoIcon('#999da0')
    }
  }

  style () {
    return `notification-inline * {
  box-sizing: border-box;
}
notification-inline .wrapper {
  user-select: none;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  transform: translateX(-50%);
  visibility: hidden;
  border: 1px solid #f00;
}
notification-inline .wrapper.show {
  visibility: visible;
}
notification-inline .notification {
  margin: 10px 0;
  position: relative;
  background-color: var(--window);
  border-radius: 3px;
  -webkit-transform: scale(0.95);
  -ms-transform: scale(0.95);
  transform: scale(0.95);
  transition: opacity 0.2s ease-in-out, transform 0.3s ease-in-out;
  border: 1px solid var(--border);
  z-index: 1;
  opacity: 0;
}
notification-inline .notification.warning {
  border-color: var(--warning);
}
notification-inline .notification.danger {
  border-color: var(--danger);
}
notification-inline .notification.success {
  border-color: var(--success);
}
notification-inline .notification.info {
  border-color: var(--secondary);
}
notification-inline .notification.show {
  opacity: 1;
  -webkit-transform: scale(1);
  -ms-transform: scale(1);
  transform: scale(1);
  transition: transform 0.3s ease-in-out;
}
notification-inline .notification.close {
  padding-right: 50px;
}
notification-inline .notification.alert {
  padding-left: 35px;
}
notification-inline .notification main {
  padding: 17px 15px 15px 15px;
}
notification-inline .notification main .title {
  font: 14px/18px var(--subheader);
}
notification-inline .notification main .message {
  font: 14px/18px var(--subheader);
  color: var(--medium);
}
notification-inline .notification .icon {
  width: 16px;
  height: 16px;
  position: absolute;
  left: 20px;
  top: 50%;
  background-size: cover;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
notification-inline .notification .close {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 20px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  cursor: pointer;
  background-size: cover;
}
notification-inline .notification .close svg path {
  fill: var(--primary);
  color: var(--primary);
}
`
  }

  create ({ message, title, duration, type } = {}) {
    this.show()

    while (this.root.firstChild) this.root.firstChild.remove()

    const notification = document.createElement('div')
    notification.className = 'notification'
    const main = document.createElement('main')
    if (type) {
      notification.classList.add('alert')
      notification.classList.add(type)
    }

    const titleElement = document.createElement('div')
    titleElement.className = 'title'
    titleElement.textContent = title || this.props.title

    const messageElement = document.createElement('div')
    messageElement.className = 'message'
    messageElement.textContent = message || this.props.message

    if (!duration) {
      const close = document.createElement('div')
      close.className = 'close'
      const color = window.getComputedStyle(this.root).getPropertyValue('--primary')
      close.style.backgroundImage = `url("${this.props.closeIcon(color)}")`
      notification.appendChild(close)
      notification.classList.add('close')
    }

    if (type) {
      const alertIcon = document.createElement('div')
      alertIcon.className = 'icon'
      notification.appendChild(alertIcon)

      switch (type) {
        case 'danger':
          alertIcon.style.backgroundImage = `url("${this.props.dangerIcon}")`
          if (!title && !message) { titleElement.textContent = 'Danger' }
          break

        case 'warning':
          alertIcon.style.backgroundImage = `url("${this.props.warningIcon}")`
          if (!title && !message) { titleElement.textContent = 'Warning' }
          break

        case 'success':
          alertIcon.style.backgroundImage = `url("${this.props.successIcon}")`
          if (!title && !message) { titleElement.textContent = 'Success' }
          break

        case 'info':
          alertIcon.style.backgroundImage = `url("${this.props.infoIcon}")`
          if (!title && !message) { titleElement.textContent = 'Information' }
          break
      }
    }

    if (!type && !message && !title) {
      messageElement.textContent = 'Empty message'
    }

    this.root.appendChild(notification)
    notification.appendChild(main)
    main.appendChild(titleElement)
    main.appendChild(messageElement)
    setImmediate(() => notification.classList.add('show'))

    if (duration) {
      setTimeout(() => this.destroy(notification), duration)
    }
  }

  destroy (notification) {
    notification.classList.remove('show')
    notification.addEventListener('transitionend', e => {
      notification.parentNode.removeChild(notification)
    })
  }

  show () {
    setImmediate(() => {
      this.root.firstChild.classList.add('show')
    })
  }

  hide () {
    this.root.firstChild.classList.remove('show')
  }

  click (e) {
    const el = Tonic.match(e.target, '.close')
    if (!el) return

    const notification = el.closest('.notification')
    if (notification) this.destroy(notification)
  }

  render () {
    const {
      theme,
      position
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    return `<div class="wrapper ${position}"></div>`
  }
}

NotificationInline.svg = {}

NotificationInline.svg.closeIcon = (color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path fill="${color}" d="M80.7,22.6l-3.5-3.5c-0.1-0.1-0.3-0.1-0.4,0L50,45.9L23.2,19.1c-0.1-0.1-0.3-0.1-0.4,0l-3.5,3.5c-0.1,0.1-0.1,0.3,0,0.4l26.8,26.8L19.3,76.6c-0.1,0.1-0.1,0.3,0,0.4l3.5,3.5c0,0,0.1,0.1,0.2,0.1s0.1,0,0.2-0.1L50,53.6l25.9,25.9c0.1,0.1,0.3,0.1,0.4,0l3.5-3.5c0.1-0.1,0.1-0.3,0-0.4L53.9,49.8l26.8-26.8C80.8,22.8,80.8,22.7,80.7,22.6z"/>
    </svg>
  `
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationInline.svg.dangerIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50.1,6.7C26.3,6.7,6.9,26.2,6.9,50s19.4,43.2,43.2,43.2c23.8,0,43.2-19.5,43.2-43.3C93.3,26.1,74,6.7,50.1,6.7z M53.9,76.4h-7.6V68h7.6V76.4z M53.9,60.5h-7.6V25.6h7.6V60.5z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationInline.svg.warningIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M98.6,86.6l-46-79.7c-1.2-2-4-2-5.2,0l-46,79.7c-1.2,2,0.3,4.5,2.6,4.5h92C98.3,91.1,99.8,88.6,98.6,86.6z M53.9,80.4h-7.6V72h7.6V80.4z M53.9,64.5h-7.6V29.6h7.6V64.5z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationInline.svg.successIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50.1,6.7C26.3,6.7,6.9,26.2,6.9,50s19.4,43.2,43.2,43.2c23.8,0,43.2-19.5,43.2-43.3C93.3,26.1,74,6.7,50.1,6.7z M43.4,71.5L22,50.1l4.8-4.8L43.4,62l28.5-28.5l4.8,4.8L43.4,71.5z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

NotificationInline.svg.infoIcon = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="${color}" d="M50.1,6.7C26.3,6.7,6.9,26.2,6.9,50s19.4,43.2,43.2,43.2c23.8,0,43.2-19.5,43.2-43.3C93.3,26.1,74,6.7,50.1,6.7z M54.1,75.5h-8.1v-7.8h8.1V75.5z M64.1,47.6c-0.8,1.1-2.4,2.7-4.8,4.5L57,54c-1.4,1.1-2.3,2.3-2.7,3.7c-0.3,0.8-0.4,2-0.4,3.6h-8c0.1-3.4,0.5-5.8,1-7.1c0.5-1.3,2-2.9,4.3-4.7l2.4-1.9c0.8-0.6,1.5-1.3,2-2.1c0.9-1.3,1.4-2.8,1.4-4.3c0-1.8-0.5-3.4-1.6-4.9c-1.1-1.5-3-2.3-5.8-2.3c-2.7,0-4.7,0.9-5.9,2.8c-1,1.6-1.6,3.3-1.7,5.1h-8.6c0.4-5.9,2.5-10.1,6.4-12.6l0,0c2.5-1.6,5.7-2.5,9.4-2.5c4.9,0,9,1.2,12.2,3.5c3.2,2.3,4.8,5.7,4.8,10.3C66.2,43.4,65.5,45.7,64.1,47.6z"/></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

Tonic.add(NotificationInline)

class ProfileImage extends Tonic { /* global Tonic */
  defaults () {
    return {
      size: '50px',
      src: ProfileImage.svg.default('#f0f0f0'),
      radius: '5px'
    }
  }

  style () {
    return `profile-image .wrapper {
  position: relative;
  overflow: hidden;
}
profile-image .wrapper .image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
}
profile-image .wrapper .overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  transition: opacity 0.2s ease-in-out;
  visibility: hidden;
  opacity: 0;
  display: flex;
}
profile-image .wrapper .overlay svg {
  margin: auto;
}
profile-image .wrapper.editable:hover .overlay {
  visibility: visible;
  opacity: 1;
  cursor: pointer;
}
`
  }

  getPictureData (src, cb) {
    const reader = new window.FileReader()
    reader.onerror = err => cb(err)
    reader.onload = e => cb(null, e.target.result)
    reader.readAsDataURL(src)
  }

  click (e) {
    const fileInput = this.root.getElementsByTagName('input')[0]
    fileInput.click()
  }

  change (e) {
    const fileInput = this.root.getElementsByTagName('input')[0]
    const data = fileInput.files[0]

    this.getPictureData(data, (err, data) => {
      if (err) return this.emit('error', err)

      const slot = this.root.querySelector('.image')
      slot.style.backgroundImage = 'url("' + data + '")'
      this.emit('changed', data)
    })
  }

  render () {
    let {
      id,
      name,
      size,
      src,
      radius,
      border,
      theme,
      editable
    } = this.props

    const idAttr = id ? `id="${id}"` : ''
    const nameAttr = name ? `name="${name}"` : ''

    if (theme) this.root.classList.add(`theme-${theme}`)

    let style = []

    if (size) {
      style.push(`width: ${size}`)
      style.push(`height: ${size}`)
    }

    if (border) style.push(`border: ${border}`)
    if (radius) style.push(`border-radius: ${radius}`)
    style = style.join('; ')

    return `
      <div class="wrapper ${editable ? 'editable' : ''}" style="${style}">
        <div
          class="image"
          ${idAttr}
          ${nameAttr}
          style="background-image: url('${src}');">
        </div>
        <input type="file" style="display:none"/>
        <div class="overlay">
          <svg style="width: 40px; height: 40px;">
            <use xlink:href="./sprite.svg#edit" style="fill: #fff; color: #fff;">
          </svg>
        </div>
      </div>
    `
  }
}

ProfileImage.svg = {}
ProfileImage.svg.default = (color) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="${color}" width="100" height="100"></rect><circle fill="#D6D6D6" cx="49.3" cy="41.3" r="21.1"></circle><path fill="#D6D6D6" d="M48.6,69.5c-18.1,0-33.1,13.2-36,30.5h72C81.8,82.7,66.7,69.5,48.6,69.5z"></path></svg>`
  return `data:image/svg+xml;base64,${window.btoa(svg)}`
}

Tonic.add(ProfileImage)

class SidePanel extends Tonic { /* global Tonic */
  constructor (props) {
    super(props)

    this.root.show = fn => this.show(fn)
    this.root.hide = fn => this.hide(fn)
  }

  defaults () {
    return {
      position: 'right',
      overlay: false,
      backgroundColor: 'rgba(0,0,0,0.5)'
    }
  }

  style () {
    return `side-panel * {
  box-sizing: border-box;
}
side-panel .wrapper .panel {
  width: 500px;
  position: fixed;
  bottom: 0;
  top: 0;
  background-color: var(--window);
  box-shadow: 0px 0px 28px 0 rgba(0,0,0,0.05);
  z-index: 100;
  transition: transform 0.3s ease-in-out;
}
side-panel .wrapper.left .panel {
  left: 0;
  -webkit-transform: translateX(-500px);
  -ms-transform: translateX(-500px);
  transform: translateX(-500px);
  border-right: 1px solid var(--border);
}
side-panel .wrapper.right .panel {
  right: 0;
  -webkit-transform: translateX(500px);
  -ms-transform: translateX(500px);
  transform: translateX(500px);
  border-left: 1px solid var(--border);
}
side-panel .wrapper.show.right .panel,
side-panel .wrapper.show.left .panel {
  -webkit-transform: translateX(0);
  -ms-transform: translateX(0);
  transform: translateX(0);
}
side-panel .wrapper.show.right[overlay="true"] .overlay,
side-panel .wrapper.show.left[overlay="true"] .overlay {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease-in-out, visibility 0s ease 0s;
}
side-panel .wrapper .overlay {
  opacity: 0;
  visibility: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: opacity 0.3s ease-in-out, visibility 0s ease 1s;
}
side-panel .wrapper .close {
  width: 30px;
  height: 30px;
  position: absolute;
  top: 30px;
  right: 30px;
  cursor: pointer;
}
side-panel .wrapper .close svg {
  width: 100%;
  height: 100%;
}
side-panel .wrapper header {
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
}
side-panel .wrapper main {
  padding: 20px;
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  bottom: 70px;
  overflow: scroll;
}
side-panel .wrapper footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 70px;
  padding: 10px;
  text-align: center;
  border-top: 1px solid var(--border);
}
`
  }

  show (fn) {
    const node = this.root.firstChild
    node.classList.add('show')
    fn && node.addEventListener('transitionend', fn, { once: true })
  }

  hide (fn) {
    const node = this.root.firstChild
    node.classList.remove('show')
    fn && node.addEventListener('transitionend', fn, { once: true })
  }

  click (e) {
    const el = Tonic.match(e.target, '.close')
    if (el) this.hide()

    const overlay = Tonic.match(e.target, '.overlay')
    if (overlay) this.hide()

    this.value = {}
  }

  willConnect () {
    const {
      name,
      position,
      overlay,
      theme,
      backgroundColor
    } = this.props

    const id = this.root.getAttribute('id')

    if (theme) this.root.classList.add(`theme-${theme}`)

    // create wrapper
    const wrapper = document.createElement('div')
    wrapper.id = 'wrapper'
    wrapper.classList.add('wrapper')
    wrapper.classList.add(position)

    if (overlay) wrapper.setAttribute('overlay', true)
    if (name) wrapper.setAttribute('name', name)

    // create panel
    const panel = document.createElement('div')
    panel.className = 'panel'

    // create overlay
    if (overlay !== 'false') {
      const overlayElement = document.createElement('div')
      overlayElement.className = 'overlay'
      overlayElement.setAttribute('style', `background-color: ${backgroundColor}`)
      wrapper.appendChild(overlayElement)
    }

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

Tonic.add(SidePanel)

class ContentTabs extends Tonic { /* global Tonic */
  defaults () {
    return {}
  }

  style () {
    return `tab-menu {
  display: block;
}
tab-menu a {
  text-decoration: none;
}
[data-tab-name]:not([data-tab-group]) {
  border-bottom: 1px solid transparent;
}
[data-tab-name]:not([data-tab-group]).selected {
  padding-bottom: 2px;
  border-bottom: 1px solid var(--accent);
}
[data-tab-group] {
  display: none;
  border: 1px solid var(--border);
}
[data-tab-group].show {
  display: block;
}
`
  }

  qs (s, p) {
    return (p || document).querySelector(s)
  }

  click (e) {
    e.preventDefault()
    if (!Tonic.match(e.target, '[data-tab-name]:not([data-tab-group])')) return

    const group = this.props.group
    const currentContent = this.qs(`[data-tab-group="${group}"].show`)
    if (currentContent) currentContent.classList.remove('show')

    const name = e.target.dataset.tabName
    const target = this.qs(`[data-tab-group="${group}"][data-tab-name="${name}"]`)

    if (!target) {
      console.warn(`Not found '[data-tab-group="${group}"][data-tab-name="${name}"]'`)
      return
    }

    const currentLink = this.qs(`[data-tab-name].selected`)
    if (currentLink) currentLink.classList.remove('selected')

    target.classList.add('show')
    e.target.classList.add('selected')
  }

  render () {
    let {
      theme
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    return this.root.innerHTML
  }
}

Tonic.add(ContentTabs)

    })
  