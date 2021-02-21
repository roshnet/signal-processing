const plotlib = require('nodeplotlib')
const { readAudio, quantize } = require('../utils')

const FILENAME = 'samples/sample-1.wav'
const LEVELS = 16
const N = Math.pow(2, 14)

const originalSamples = readAudio(FILENAME).slice(0, N)

const quantizedSamples = quantize(originalSamples, LEVELS)

if (quantizedSamples.length !== N) {
  console.error('Incorrect number of samples in signals. Exiting.')
  process.exit(1)
}

// Create array of quantization errors
const quantizationErrors = [...Array(N)].map((_, idx) => {
  return Math.abs(originalSamples[idx] - quantizedSamples[idx])
})

// Plot quantization errors
plotlib.plot(
  [
    {
      x: [...Array(N).keys()],
      y: quantizationErrors,
      type: 'bar',
    },
  ],
  {
    title: 'Quantization errors plot',
    xaxis: { title: 'Samples -->' },
    yaxis: { title: 'Quantization Error -->' },
  },
)
