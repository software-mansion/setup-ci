import React from 'react'

import styles from './styles.module.css'

interface OverviewItemProps {
  title: string
  children: React.ReactNode
}

const OverviewItem = ({ title, children }: OverviewItemProps) => {
  return (
    <div className={styles.featureItem}>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p>{children}</p>
    </div>
  )
}

export default OverviewItem
