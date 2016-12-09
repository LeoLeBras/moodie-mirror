/* @flow */

import { initialyze } from '@helpers/affdex'

// Initialyze elements
const $affdex = document.querySelector('.affdex')
const $logs = document.querySelector('.logs')
const $results = document.querySelector('.results')
const $startButton = document.querySelector('.controls__start')
const $stopButton = document.querySelector('.controls__stop')
const $resetButton = document.querySelector('.controls__reset')

// Initialyze affdex detector
const element = $affdex
const width = 640
const height = 480
const faceMode = affdex.FaceDetectorMode.LARGE_FACES
const detector = initialyze({ element, width, faceMode, height })


// Listen detector initialization
detector.addEventListener('onInitializeSuccess', () => {
  log('.logs', 'The detector reports initialized')
  document.querySelector('#face_video_canvas').style.display = 'block'
  document.querySelector('#face_video').style.display = 'none'
})

// Add a callback to notify when camera access is allowed
detector.addEventListener('onWebcamConnectSuccess', () => {
  log('.logs', 'Webcam access allowed')
})

// Add a callback to notify when camera access is denied
detector.addEventListener('onWebcamConnectFailure', () => {
  log('.logs', 'webcam denied')
  console.log('Webcam access denied')
})

// Add a callback to notify when detector is stopped
detector.addEventListener('onStopSuccess', () => {
  log('.logs', 'The detector reports stopped')
  document.querySelector('.results').innerHTML = ''
})

// Start watching face
$startButton.addEventListener('click', () => {
  if (detector && !detector.isRunning) {
    $logs.innerHTML = ''
    detector.start()
  }
  $logs.innerHTML += 'Clicked the start button'
})

// Stop watching face
$stopButton.addEventListener('click', () => {
  log('.logs', 'Clicked the stop button')
  if (detector && detector.isRunning) {
    detector.removeEventListener()
    detector.stop()
  }
})

// Reset detector
$resetButton.addEventListener('click', () => {
  log('.logs', 'Clicked the reset button')
  if (detector && detector.isRunning) {
    detector.reset()
    $results.innerHTML = ''
  }
})




function log(node_name, msg) {
  document.querySelector(node_name).innerHTML += `<span>${msg}</span><br>`
}




//Add a callback to receive the results from processing an image.
//The faces object contains the list of the faces detected in an image.
//Faces object contains probabilities for all the different expressions, emotions and appearance metrics
detector.addEventListener('onImageResultsSuccess', function(faces, image, timestamp) {
  document.querySelector('.results').innerHTML = ''
  log('.results', 'Timestamp: ' + timestamp.toFixed(2))
  log('.results', 'Number of faces found: ' + faces.length)
  if (faces.length > 0) {
    log('.results', 'Appearance: ' + JSON.stringify(faces[0].appearance))
    log('.results', 'Emotions: ' + JSON.stringify(faces[0].emotions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val
    }))
    log('.results', 'Expressions: ' + JSON.stringify(faces[0].expressions, function(key, val) {
      return val.toFixed ? Number(val.toFixed(0)) : val
    }))
    log('.results', 'Emoji: ' + faces[0].emojis.dominantEmoji)
    drawFeaturePoints(image, faces[0].featurePoints)
  }
})

// Draw the detected facial feature points on the image
let $canvas, cx
function drawFeaturePoints(img, featurePoints) {
  if (!$canvas || !cx) {
    $canvas = document.querySelector('#face_video_canvas')
    cx = $canvas.getContext('2d')
  }
  context.clearRect(0, 0, $canvas.width, $canvas.height)
  cx.strokeStyle = '#ffffff'
  for (var id in featurePoints) {
    cx.beginPath()
    cx.arc(featurePoints[id].x, featurePoints[id].y, 2, 0, 2 * Math.PI)
    cx.stroke()
  }
}
