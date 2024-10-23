import React from 'react'
import Layout from '@theme/Layout'
import LandingBackground from '@site/src/components/Hero/LandingBackground'
import FooterBackground from '@site/src/components/FooterBackground'
import HomepageStartScreen from '@site/src/components/Hero/StartScreen'
import { HireUsSection } from '@swmansion/t-rex-ui'
import styles from './styles.module.css'
import Sponsors from '../components/Sponsors'

export default function Home() {
  return (
    <Layout
      wrapperClassName={styles.wrapper}
      description="Quickly bootstrap CI for your React Native app"
    >
      <div>
        <LandingBackground />
      </div>
      <div className={styles.container}>
        <HomepageStartScreen />
      </div>
      <div className={styles.container}>
        <HireUsSection
          href={
            'https://swmansion.com/contact/projects?utm_source=screens&utm_medium=docs '
          }
        />
      </div>
      <FooterBackground />
    </Layout>
  )
}
