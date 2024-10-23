import React from 'react'
import styles from './styles.module.css'
import CopyButton from '../../CopyButton'

const COMMAND = 'npx setup-ci'

const CommandBox = () => {
  return (
    <>
      <div className={styles.commandBox}>
        <div className={styles.blockCursor} />
        <span className={styles.commandLabel}>npx setup-ci</span>
        <CopyButton text={COMMAND} />
      </div>
    </>
  )
}

export default CommandBox
