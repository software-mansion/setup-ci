import React from 'react'
import styles from './styles.module.css'
import HomepageButton from '@site/src/components/HomepageButton'
import CommandBox from '../CommandBox'

const StartScreen = () => {
  return (
    <section className={styles.hero}>
      <h1 className={styles.headingLabel}>
        <span>{'>'} setup-ci</span>
      </h1>
      <h2 className={styles.subheadingLabel}>
        Quickly bootstrap CI for your React Native app
      </h2>
      <CommandBox />
      <div className={styles.buttonsContainer}>
        <HomepageButton
          href="/setup-ci/docs/introduction/getting-started"
          title="Learn more"
        />
        <HomepageButton
          target="_blank"
          href="https://github.com/software-mansion/setup-ci"
          title="GitHub"
        />
      </div>
    </section>
  )
}

export default StartScreen
