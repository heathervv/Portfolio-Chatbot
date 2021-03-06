import React, { Component } from 'react'
import './App.css'

import { apps, icons, resumeLink, systemSettings } from './config'
import StartBar from './components/startbar'
import Messenger from './components/messenger'
import Work from './components/work'
import Contact from './components/contact'
import Settings from './components/settings'
import ShutDown from './components/shutDown'
import Screensaver from './components/screensaver'

import resume from './images/resume.svg'

import './css/theme.css'

const programComponents = {
  'chat': Messenger,
  'work': Work,
  'contact': Contact,
  'settings': Settings
}

class App extends Component {
  constructor() {
    super()

    this.state = {
      shutDown: false,
      openApps: [apps.messenger.toLowerCase()],
      minimizedApps: [],
      openStart: false,
      currentlyActiveApp: apps.messenger.toLowerCase(),
      previouslyActiveApp: '',
      systemSettings: {
        background: this.loadSystemBackground(),
        theme: this.loadSystemTheme()
      }
    }
  }

  componentDidMount() {
    if (document.addEventListener) {
      document.addEventListener('click', this.linkClickListener, false)
    } else {
      document.attachEvent('onclick', this.linkClickListener)
    }
  }

  linkClickListener = (e) => {
    var event = window.e || e

    if (event.target.tagName === 'A') {
      this.openInNewTab(event.target.href)
    }
  }

  openApp = (e, component) => {
    e.preventDefault()

    const { openApps, minimizedApps } = this.state
    openApps.push(component)

    if (minimizedApps.indexOf(component) > -1) {
      for (let i = minimizedApps.length - 1; i >= 0; i--) {
        if (minimizedApps[i] === component) {
            minimizedApps.splice(i, 1);
        }
      }
    }

    this.setState({ openApps, minimizedApps })

    this.updateActiveApp(component)

    this.start('close')
  }

  closeApp = (component, e) => {
    e.preventDefault()

    let openApps = this.state.openApps
    openApps = openApps.filter(e => e !== component)

    this.setState({ openApps })
  }

  updateStartbar = (component, minimizeWindow) => {
    const minimizedApps = this.state.minimizedApps

    if (minimizeWindow) {
      // if we manually ask to minimize
      minimizedApps.push(component)
    } else if (this.state.minimizedApps.indexOf(component) > -1) {
      // if app is currently minimized and needs to be brought back
      const index = minimizedApps.indexOf(component)
      minimizedApps.splice(index, 1)

      this.updateActiveApp(component, null)
    } else {
      // Otherwise, let's just set to currently active app
      this.updateActiveApp(component, null)
    }

    this.setState({ minimizedApps })
    this.start('close')
  }

  updateActiveApp = (component, e) => {
    if (e) e.preventDefault()

    if (component === this.state.updateActiveApp) return

    this.setState({ previouslyActiveApp: this.state.currentlyActiveApp })
    this.setState({ currentlyActiveApp: component })
  }


  start = (status) => {
    if (status === 'close')
      this.setState({ openStart: false })
    else
      this.setState({ openStart: true })
  }

  openInNewTab = (elem) => {
    const win = window.open(elem, '_blank')

    if(win) win.focus()
  }

  shutDown = (e, restart = false) => {
    if (e) e.preventDefault()

    this.setState({
      shutDown: restart ? false : true,
      openStart: false,
      openApps: [],
      minimizedApps: [],
      currentlyActiveApp: '',
      previouslyActiveApp: ''
    })
  }

  loadSystemBackground = () => {
    const existingBackground = localStorage.getItem('background')

    if (existingBackground) {
      return systemSettings.background.find((background) => background.name === existingBackground)
    } else {
      localStorage.setItem('background', systemSettings.background[2].name)

      return systemSettings.background[2]
    }
  }

  loadSystemTheme = () => {
    const existingTheme = localStorage.getItem('theme')

    if (existingTheme) {
      return systemSettings.theme.find((theme) => theme === existingTheme)
    } else {
      localStorage.setItem('theme', systemSettings.theme[0])

      return systemSettings.theme[0]
    }
  }

  changeSystemSettings = (background = null, theme = null) => {
    if (background) {
      localStorage.setItem('background', background.name)

      this.setState({
        systemSettings: {
          ...this.state.systemSettings,
          background
        }
      })
    }

    if (theme) {
      localStorage.setItem('theme', theme)

      this.setState({
        systemSettings: {
          ...this.state.systemSettings,
          theme
        }
      })
    }
  }

  render() {
    const {
      openApps,
      minimizedApps,
      currentlyActiveApp,
      previouslyActiveApp,
      openStart,
      shutDown,
      systemSettings
    } = this.state

    return (
      <section className={`desktop theme-${systemSettings.theme.toLowerCase()}`} style={{ backgroundImage: `url(${systemSettings.background.url})` }}>
        <div className="icons">
          <button onClick={e => this.openApp(e, apps.messenger.toLowerCase())}>
            <img src={icons[apps.messenger.toLowerCase()].url} alt={icons[apps.messenger.toLowerCase()].alt} /> {apps.messenger}
          </button>
          <button onClick={e => this.openApp(e, apps.contact.toLowerCase())}>
            <img src={icons[apps.contact.toLowerCase()].url} alt={icons[apps.contact.toLowerCase()].alt} /> {apps.contact}
          </button>
          <button onClick={e => this.openApp(e, apps.work.toLowerCase())}>
            <img src={icons[apps.work.toLowerCase()].url} alt={icons[apps.work.toLowerCase()].alt} /> {apps.work}
          </button>
          <a href={resumeLink} target="_blank" rel="noopener noreferrer">
            <img src={resume} alt="Icon of resume" /> Resume
          </a>
        </div>

        {
          Object.keys(programComponents).map((program, i) => {
            if (
              openApps.indexOf(program) === -1 &&
              minimizedApps.indexOf(program) === -1
            ) return null

            const ProgramBlock = programComponents[program]

            return (
              <ProgramBlock
                key={i}
                updateActiveApp={this.updateActiveApp}
                closeApp={this.closeApp}
                updateStartbar={this.updateStartbar}
                openApps={openApps}
                minimizedApps={minimizedApps}
                currentlyActiveApp={currentlyActiveApp}
                previouslyActiveApp={previouslyActiveApp}
                activeSystemSettings={systemSettings}
                changeSystemSettings={this.changeSystemSettings}
              />
            )
          })
        }

        <StartBar
          openApp={this.openApp}
          updateActiveApp={this.updateActiveApp}
          currentlyActiveApp={currentlyActiveApp}
          openApps={openApps}
          minimizedApps={minimizedApps}
          shutDown={this.shutDown}
          updateStartbar={this.updateStartbar}
          start={this.start}
          openStart={openStart}
          openSettings={e => this.openApp(e, apps.settings.toLowerCase())}
        />

        <div className={`shutDownPage ${shutDown ? 'visible' : ''}`}>
          <ShutDown restart={() => this.shutDown(null, true)} />
        </div>

        <Screensaver />
      </section>
    )
  }
}

export default App
