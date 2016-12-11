/* @flow */

import Velocity from 'velocity-animate'
import type { Detector, Face } from './types'

const INACTIVITY_DELAY = 750
const TRANSITION_DURATION = 375

type Callback = (faces: Array<Face>, timestamp: number ) => void

/**
 * Run Affdex Camera instance and
 * track faces
 */
export default (callback: Callback) => {
  return (detector: Detector) => {
    // Run !
    let detectorIsRunning: boolean = false
    let detectorIsInitialyzed: boolean = false
    let startTimestamp: number = 0
    if (!detector.isRunning) detector.start()

    // Fix style
    const $message: HTMLElement = document.querySelector('.affdex__msg')
    const $video: HTMLElement = document.querySelector('#face_video')
    const $canvas: HTMLElement = document.querySelector('#face_video_canvas')
    const $container = $video.parentNode
    if ($container instanceof HTMLElement) {
      const { width, height } = $container.style
      $video.style.width = width
      $video.style.height = height
    }
    $video.style.display = 'block'
    $video.style.filter = 'blur(20px)'
    $video.style.objectFit = 'cover'
    $canvas.style.display = 'none'
    $canvas.style.position = 'absolute'
    $canvas.style.top = '0'
    $canvas.style.left = '0'
    $canvas.style.opacity = '0'
    $canvas.style.zIndex = '3'

    // Listen bad news and prevent user about this
    detector.addEventListener('onWebcamConnectFailure', () => {
      $message.style.color = 'black'
      $message.innerHTML = 'Webcam access denied'
    })

    // Display canvas when detector is initialyzed
    detector.addEventListener('onInitializeSuccess', () => {
      $message.innerHTML = 'waiting ...'
    })

    //
    let timer
    detector.addEventListener('onImageResultsSuccess', (faces: Array<Face>, image: any, timestamp: number) => {
      // Detect if detector is initialyzed or not
      if (faces.length) {
        clearTimeout(timer)
        detectorIsInitialyzed = true
      }
      else {
        timer = setTimeout(() => {
          detectorIsInitialyzed = false
        }, INACTIVITY_DELAY)
      }

      // Enable camera
      if (detectorIsInitialyzed && !detectorIsRunning) {
        detectorIsRunning = true
        Velocity($video, { blur: 0 }, { duration: TRANSITION_DURATION })
        Velocity($message, { opacity: 0 }, { duration: TRANSITION_DURATION })
      }

      // Disable camera
      if (!detectorIsInitialyzed && detectorIsRunning) {
        detectorIsRunning = false
        Velocity($video, { blur: 30 }, { duration: TRANSITION_DURATION })
        Velocity($message, { opacity: 1 }, { duration: TRANSITION_DURATION })
      }

      // Calc start timestamp
      if (startTimestamp === 0 || !detectorIsRunning) {
        startTimestamp = timestamp
      }

      // Call callback
      if (detectorIsRunning) callback(faces, timestamp - startTimestamp)
    })
  }
}
