/* @flow */

import '@vendors/affdex'
import type { Detector } from './types'

declare var affdex: any

type Options = {
  element: HTMLElement,
  width: number,
  height: number,
}

/**
 * Initialyze Affdex Camera instance
 * with all analysis enable
 */
export default ({ element, width, height } : Options): Detector => {
  // Set width and height
  element.style.width = `${width}px`
  element.style.height = `${height}px`

  // Display "initialyzing" message
  element.innerHTML += `
    <div class="affdex__msg" style="position:absolute;top:50%;left:50%;z-index:2;color:white;font-size:14px">
      initialyzing ...
    </div>
  `

  // Initialyze detector
  const faceMode: number = affdex.FaceDetectorMode.LARGE_FACES
  const detector: Detector = new affdex.CameraDetector(element, width, height, faceMode)

  // Initialyze analysis
  detector.detectAllEmotions()
  detector.detectAllExpressions()
  detector.detectAllEmojis()
  detector.detectAllAppearance()

  // Return detector
  return detector
}
