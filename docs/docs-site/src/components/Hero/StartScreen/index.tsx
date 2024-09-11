import React from 'react'
import styles from './styles.module.css'
import HomepageButton from '@site/src/components/HomepageButton'
import CommandBox from '../CommandBox'

const StartScreen = () => {
  return (
    <section className={styles.hero}>
      <h1 className={styles.headingLabel}>
        <span>React Native</span>
        <span>CI CLI</span>
      </h1>
      <h2 className={styles.subheadingLabel}>
        Efficiently setup CI for your React Native app
      </h2>
      <CommandBox />
      <div className={styles.buttonsContainer}>
        <HomepageButton
          href="/react-native-ci-cli/docs/introduction"
          title="Learn more"
        />
        <HomepageButton
          target="_blank"
          href="https://github.com/software-mansion-labs/react-native-ci-cli/"
          title="GitHub"
        />
      </div>
    </section>
  )
}

export default StartScreen
