import React from 'react'
import styles from './styles.module.css'

import ArrowRight from '@site/static/img/arrow-right-hero.svg'
import clsx from 'clsx'

const ButtonStyling = {
  PRIMARY: styles.buttonPrimary,
  SECONDARY: styles.buttonSecondary
}

const HomepageButton: React.FC<{
  title: string
  href: string
  type?: 'primary' | 'secondary'
  target?: '_blank' | '_parent' | '_self' | '_top'
  enlarged?: boolean
}> = ({
  title,
  href,
  type = 'primary',
  target = '_self',
}) => {
    const buttonStyling = type === 'primary' ?
      ButtonStyling.PRIMARY : ButtonStyling.SECONDARY

    return (
      <a href={href} target={target} className={styles.homepageButtonLink}>
        <div
          className={clsx(
            styles.homepageButton,
            buttonStyling
          )}
        >
          {title}
          <div className={styles.arrow}>
            <ArrowRight />
          </div>
        </div>
      </a>
    )
  }

export default HomepageButton
