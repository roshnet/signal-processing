const { magnitude, readAudio, quantize, squarify } = require('../utils')
const plotlib = require('nodeplotlib')
const fft = require('fft-js').fft

const FILENAME = 'samples/sample-1.wav'
const FS = 8000 // Sampling frequency
const LEVELS = 64 // Quantization levels
const N = Math.pow(2, 14)

const originalSignal = readAudio(FILENAME).slice(0, N)

const { quantizedSignal, indexes } = quantize(originalSignal, LEVELS)

// Optimization: Consider only 10 binary values.
// Not operating on all samples since only first 20 bits are needed.
let activeIndexes = indexes.slice(0, 10)

// Convert indexes to binary
activeIndexes.forEach((_, idx) => {
  activeIndexes[idx] = activeIndexes[idx].toString(2)
})

// Padding zeros to make binary 7-bits long
activeIndexes.forEach((value, idx) => {
  let diff = 7 - value.length
  if (diff < 0) {
    console.error('Binary already larger than 7 bits. Exiting.')
    process.exit(1)
  }
  activeIndexes[idx] = '0'.repeat(diff) + value
})

// Extract array of 20 bits to plot
let binaries = activeIndexes.join('').slice(0, 20).split('')

// Convert all 0s to -1s
const bitSequence = binaries.map((value) => {
  value = parseInt(value, 10)
  if (!value) value = -1
  return value
})

const squareWave = squarify(
  [...Array(20)].map((_, i) => i),
  bitSequence
)

// Prepare frequency vectors
let freq = []
for (var i = 0; i < 20; i++) {
  freq.push(i * ((Math.log2(LEVELS) * FS) / N) - (Math.log2(LEVELS) * FS) / 2)
}

let powerSamples = magnitude(fft(bitSequence.slice(0, 16)))
powerSamples.forEach((value, idx) => {
  powerSamples[idx] = Math.pow(value, 2) / 20
})

// Plot the polar NRZ signaling
plotlib.plot(
  [
    {
      x: squareWave.X,
      y: squareWave.Y,
    },
  ],
  {
    title: 'Polar NRZ Signaling',
  }
)

// Plot power spectrum
plotlib.plot(
  [
    {
      x: freq,
      y: powerSamples,
    },
  ],
  {
    title: 'Power Spectrum',
  }
)
