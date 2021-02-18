const { magnitude, recordAudio, readAudio } = require('../utils')
const plotlib = require('nodeplotlib')
const fft = require('fft-js').fft

const FILENAME = 'samples/sample-' + Math.floor(Math.random() * 1000) + '.wav'
const FS = 8000
const DURATION = 3
const N = Math.pow(2, 14) // number of samples to plot

recordAudio(FILENAME, DURATION, FS)
  .then((samples) => {
    let inputSamples = samples.slice(0, N)

    if (inputSamples.length !== N) {
      console.error('Expected %d samples, got %d.', N, inputSamples.length)
      console.error('Exiting, insufficient samples.')
      process.exit(1)
    }

    let signalPowerSamples = magnitude(fft(inputSamples))
    signalPowerSamples.forEach((value, idx) => {
      signalPowerSamples[idx] = Math.pow(value, 2) / N
    })

    // Prepare frequency vector
    let fv = []

    for (let i = 0; i < N; i++) {
      fv.push((i * FS) / N)
    }

    // Plot input samples
    plotlib.plot([
      {
        x: [...Array(inputSamples.length).keys()],
        y: inputSamples,
        type: 'line',
        name: 'Input Signal',
      },
    ])

    // Plot the power spectrum
    plotlib.plot([
      {
        x: fv,
        y: signalPowerSamples,
        type: 'line',
        name: 'Power Spectrum',
      },
    ])
  })
  .catch((err) => {
    console.warn('Caught exception: ', err)
  })
