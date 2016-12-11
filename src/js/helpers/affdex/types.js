/* @flow */

export type Detector = any

export type Face = {
  appearance: {
    age: string,
    ethnicity: string,
    gender: string,
    glasses: string,
  },
  emojis: { // 0 => 100
    disappointed: number,
    dominantEmoji: string, // Return emoji
    flushed: number,
    kissing: number,
    laughing: number,
    rage: number,
    relaxed: number,
    scream: number,
    smiley: number,
    smirk: number,
    stuckOutTongue: number,
    stuckOutTongueWinkingEye: number,
    wink: number,
  },
  emotions: { // 0 => 100
    anger: number,
    contempt: number,
    disgust: number,
    engagement: number,
    fear: number,
    joy: number,
    sadness: number,
    surprise: number,
    valence: number,
  },
  expressions: { // 0 => 100
    attention: number,
    browFurrow: number,
    browRaise: number,
    cheekRaise: number,
    chinRaise: number,
    dimpler: number,
    eyeClosure: number,
    eyeWiden: number,
    innerBrowRaise: number,
    jawDrop: number,
    lidTighten: number,
    lipCornerDepressor: number,
    lipPress: number,
    lipPucker: number,
    lipStretch: number,
    lipSuck: number,
    mouthOpen: number,
    noseWrinkle: number,
    smile: number,
    smirk: number,
    upperLipRaise: number,
  },
  featurePoints: {
    [key: number]: {
      x: number,
      y: number,
    }
  },
  measurements: {
    interocularDistance: number,
    orientation: {
      pitch: number,
      roll: number,
      yaw: number,
    },
  },
}
