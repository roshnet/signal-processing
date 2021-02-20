const {
  magnitude,
  recordAudio,
  readAudio,
  quantize,
  createWavefile,
} = require('../utils')
const plotlib = require('nodeplotlib')
const fft = require('fft-js').fft

const sampleId = Math.floor(Math.random() * 1000)
const FILENAME = `samples/sample-${sampleId}.wav`
const FS = 8000
const DURATION = 3

// Number of samples to plot
const N = Math.pow(2, 14)

// Quantization levels
const LEVELS = 8

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
    let fv = [...Array(N)].map((_v, i) => (i * FS) / N)

    // Prepare quantized signal samples
    const quantizedSamples = quantize(inputSamples, LEVELS)

    // Plot input signal samples
    plotlib.plot(
      [
        {
          x: [...Array(inputSamples.length).keys()],
          y: inputSamples,
          type: 'line',
          name: 'Input Signal',
        },
      ],
      {
        title: 'Input Signal',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Amplitude' },
      },
    )

    // Plot the power spectrum
    plotlib.plot(
      [
        {
          x: fv,
          y: signalPowerSamples,
          type: 'line',
          name: 'Power Spectrum',
        },
      ],
      {
        title: 'Power Spectrum',
        xaxis: { title: 'Frequency' },
        yaxis: { title: 'Signal Power' },
      },
    )

    // Plot quantized signal samples
    plotlib.plot(
      [
        {
          x: fv,
          y: quantizedSamples,
          type: 'line',
          name: 'Quantized Signal',
        },
      ],
      {
        title: 'Quantised signal',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Amplitude' },
      },
    )

    createWavefile(
      quantizedSamples,
      FS,
      `samples/sample-${sampleId}-quantized.wav`,
    )
  })
  .catch((err) => {
    console.warn('Caught exception: ', err)
  })
