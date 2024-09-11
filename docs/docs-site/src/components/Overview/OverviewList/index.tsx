import React from 'react'
import OverviewItem from '../OverviewItem'

import styles from './styles.module.css'

const OverviewList = () => {
  return (
    <div className={styles.featureList}>
      <OverviewItem title="AAA">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi at eros
        tellus. Donec nec neque massa. Aliquam volutpat et arcu sit amet tempus.
        Phasellus quis nisl convallis purus accumsan ornare. Duis feugiat ante
        enim, ac porttitor mi ultrices in. Pellentesque habitant morbi tristique
        senectus et netus et malesuada fames ac turpis egestas.
      </OverviewItem>
      <OverviewItem title="BBB">
        Pellentesque at nisi arcu. Mauris at lectus non libero convallis
        eleifend. Etiam varius, dolor ac viverra lobortis, purus ante tristique
        mauris, congue elementum elit lorem vulputate dolor. Proin venenatis
        ipsum at nisi efficitur pulvinar. Pellentesque sem ante, convallis non
        dapibus ut, luctus eu arcu.
      </OverviewItem>
      <OverviewItem title="CCC">
        Pellentesque fringilla elementum convallis. Maecenas scelerisque eros
        non metus euismod, eu convallis elit sodales. Nam ac porttitor erat.
        Donec vitae ante non enim cursus lacinia et a sem. Duis ullamcorper
        lobortis nisi. Nulla facilisi. Nulla erat neque, aliquet sit amet
        ultricies quis, lacinia sit amet eros.
      </OverviewItem>
    </div>
  )
}

export default OverviewList
