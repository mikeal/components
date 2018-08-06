class TabMenu extends Tonic { /* global Tonic */
  defaults () {
    return {}
  }

  style () {
    return `%style%`
  }

  render () {
    let {
      theme
    } = this.props

    if (theme) this.root.classList.add(`theme-${theme}`)

    return `
      <div class="tab-menu">
        <div class="tab"></div>
      </div>
    `
  }
}

Tonic.add(TabMenu)
