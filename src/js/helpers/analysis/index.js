/* @flow */

type Sample = { [key: string]: number }

export class Record {

  /**
   * Calc average for each key of samples
   */
  static calcAverage(samples: Array<Sample>): ?Sample {
    // Get keys
    if (!samples[0]) return null
    const keys = Object.keys(samples[0])
    keys.forEach((key, index) => {
      if (!samples.every((sample) => key in sample && typeof sample[key] === 'number')) {
        delete keys[index]
      }
    })

    // Calc average samples
    return samples.reduce((acc, sample, index) => {
      // Push values
      keys.forEach((key) => acc[key].push(sample[key]))
      if ((samples.length - 1) !== index) return acc
      // Calc average
      return keys.reduce((acc, key) => {
        const sum = samples.reduce((acc, sample) => acc + sample[key], 0)
        acc[key] = sum / samples.length
        return acc
      }, {})
    }, keys.reduce((acc, key) => ({
      ...acc,
      [key]: []
    }), {}))
  }


  /**
   * Log unique sample in console tab
   */
  static log(sample: Sample): void {
    // Build sample to be displayed in chrome console
    const normalizedSample = Object.keys(sample).reduce((acc, key) => {
      acc.push({ key, value: sample[key] })
      return acc
    }, [])
    // Log normalized sample
    console.table(normalizedSample)
  }

}
