import React from 'react'
import styles from './styles.module.css'
import Logo from '@site/static/img/hero-logo.svg'
import { useColorScheme } from '@mui/material'
import HomepageButton from '../../HomepageButton'

const StartScreen = () => {
  const colorScheme = useColorScheme()

  return (
    <section className={styles.hero}>
      <div className={styles.heroLogoContainer}>
        <Logo className={styles.heroLogo} />
        <span className={styles.heroLogoText}>
          <span>npx</span>
          <span> setup-ci</span>
        </span>
        <span className={styles.cursor} />
      </div>
      <h2 className={styles.subheadingLabel}>
        Quickly bootstrap CI for your React Native app
      </h2>
      <div className={styles.buttonsContainer}>
        <HomepageButton
          href="/setup-ci/docs/introduction/getting-started"
          title="Learn more"
        />
        <HomepageButton
          target="_blank"
          href="https://github.com/software-mansion/setup-ci"
          title="GitHub"
          type="secondary"
        />
      </div>
    </section>
  )
}

export default StartScreen
