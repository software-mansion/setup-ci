import React from 'react'
import OverviewList from './OverviewList'

import styles from './styles.module.css'

const Overview = () => {
  return (
    <div className={styles.featuresContainer}>
      <h2>Why React Native CI CLI?</h2>
      <OverviewList />
    </div>
  )
}

export default Overview
