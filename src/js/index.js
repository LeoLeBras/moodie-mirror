/* @flow */

import { createRecket, dispatch } from '@helpers/recket'
import { initialyze, run } from '@helpers/affdex'
import type { Detector } from '@helpers/affdex/types'
import { Record } from '@helpers/analysis'

// Initialyze recket
const recket = createRecket('http://localhost:3000')

// Initialyze affdex detector
const element: HTMLElement = document.querySelector('.affdex')
const width: number = window.innerWidth
const height: number = window.innerHeight
const detector: Detector = initialyze({ element, width, height })

// Config
const RECORD_DURATION: number = 10 // Defined in secondes
const INACTIVITY_DELAY: number = 1000 // Defined in millisecondes
const DEBUG: boolean = true

// Initialyze vars
let samples = []
let recordStartTimestamp: number = 0
let recordTimestamp: number = 0
let isRecording = false

/**
 * Run affdex detector and calc average
 * values of returned data
 */
let timer
run((faces, timestamp) => {
  // Detect inactivity
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (isRecording) {
      dispatch({
        type: '@@mirror/STOP_RECORD',
        payload: {},
      })(recket)
      isRecording = false
    }
  }, INACTIVITY_DELAY)

  // Set record timestamp
  if (recordStartTimestamp === 0) {
    if (!isRecording) {
      dispatch({
        type: '@@mirror/START_RECORD',
        payload: {},
      })(recket)
      isRecording = true
    }
    recordStartTimestamp = timestamp
    recordTimestamp = 0
  }

  // Get samples
  if (recordTimestamp <= RECORD_DURATION && faces[0]) {
    recordTimestamp = Math.abs(timestamp - recordStartTimestamp)
    if (faces[0].emotions) samples.push(faces[0].emotions)
  }

  // Calc average samples and send it with socket + reset vars
  else {
    if (!isRecording) return

    // Calc average of all samples
    const analysis = Record.calcAverage(samples)
    if (analysis) {
      // Log analysis in browser
      if (DEBUG) Record.log(analysis)
      // Send to api
      dispatch({
        type: '@@mirror/GET_ANALYSIS',
        payload: { analysis },
      })(recket)
    }

    // Reset timestamp and samples
    recordStartTimestamp = 0
    samples = []
  }
})(detector)
