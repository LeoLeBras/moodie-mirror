/* @flow */

type Options = {
  element: HTMLElement,
}

export const initialyze = ({ element, width, height }: Options) => {
  // Set width and height
  element.style.width = `${width}px`
  element.style.height = `${height}px`

  // Initialyze detector
  const detector = new affdex.CameraDetector($affdex, width, height, faceMode)

  // Run analysis
  detector.detectAllEmotions()
  detector.detectAllExpressions()
  detector.detectAllEmojis()
  detector.detectAllAppearance()

  // Return detector
  return detector
}
