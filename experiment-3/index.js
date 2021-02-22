const plotlib = require('nodeplotlib')
const { createWavefile, readAudio, quantize } = require('../utils')

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

// Plot input signal
plotlib.plot(
  [
    {
      x: [...Array(N).keys()],
      y: originalSamples,
      type: 'line',
    },
  ],
  {
    title: 'INPUT SIGNAL',
    xaxis: { title: 'Time -->' },
    yaxis: { title: 'Amplitude -->' },
  },
)

// Plot quantized signal
plotlib.plot(
  [
    {
      x: [...Array(N).keys()],
      y: quantizedSamples,
      type: 'line',
    },
  ],
  {
    title: 'QUANTIZED SIGNAL',
    xaxis: { title: 'Time -->' },
    yaxis: { title: 'Amplitude -->' },
  },
)

// Plot quantization errors
plotlib.plot(
  [
    {
      x: [...Array(N).keys()],
      y: quantizationErrors,
      type: 'line',
    },
  ],
  {
    title: 'Quantization errors plot',
    xaxis: { title: 'Samples -->' },
    yaxis: { title: 'Quantization Error -->' },
  },
)

// Reconstruct the signal

const FS = 8000 // set to frequency used to record
createWavefile(quantizedSamples, 8000, 'samples/1-quantized.wav')
