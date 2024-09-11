import React, { useState } from 'react'
import { Check, Copy } from 'react-swm-icon-pack'
import clsx from 'clsx'
import styles from './styles.module.css'

interface CopyButtonProps {
  text: string
}

const CopyButton = ({ text }: CopyButtonProps) => {
  const visibleClassName = clsx(styles.iconContainer, styles.visible)
  const hiddenClassName = clsx(styles.iconContainer, styles.hidden)

  const [copyIconClassName, setCopyIconClassName] = useState(visibleClassName)
  const [checkIconClassName, setCheckIconClassName] = useState(hiddenClassName)

  const onCopyClick = () => {
    navigator.clipboard?.writeText(text)
    setCopyIconClassName(hiddenClassName)
    setCheckIconClassName(visibleClassName)

    setTimeout(() => {
      setCopyIconClassName(visibleClassName)
      setCheckIconClassName(hiddenClassName)
    }, 1500)
  }

  return (
    <button className={styles.copyButton} onClick={onCopyClick}>
      <div className={checkIconClassName}>
        <Check color="#4CAF50" size={26} />
      </div>
      <div className={copyIconClassName}>
        <Copy color="#757575" size={26} />
      </div>
    </button>
  )
}

export default CopyButton
