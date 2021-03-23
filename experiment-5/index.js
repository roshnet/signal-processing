
const plotlib = require('nodeplotlib')
const { magnitude, readAudio, quantize} = require('../utils')
const dsp = require('digitalsignals')

const FILENAME = 'samples/main.wav'
const FS = 8000 // Sampling frequency
const LEVELS = 64 // Quantization levels
const N = Math.pow(2, 14)
const CUTOFF = 20000

const originalSignal = readAudio(FILENAME).slice(0, N)
const { quantizedSignal, indexes } = quantize(originalSignal, LEVELS)


// Optimization: Consider only 1000 binary values.
// Not operating on all samples since only first 20 bits are needed.
let activeIndexes = indexes.slice(0, 1000)

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

// Extract binary values to plot
let binaries = activeIndexes.join('').slice(5000, 6000).split('')


// Convert all 0s to -1s
const bitSequence = binaries.map((value) => {
  value = parseInt(value, 10)
  if (!value) value = -1
  return value
})

const TIMES = 10

// Prepare array for eye diagram 
const repeatedBitSequence = []
bitSequence.map((value) => {
  for (let i = 0; i < TIMES; i++)
    repeatedBitSequence.push(Number(value))
})

// Create a low pass filter and process signal
const lowPassFilter = new dsp.IIRFilter(dsp.LOWPASS, 1/CUTOFF, 1, 1/FS)
lowPassFilter.process(repeatedBitSequence)

const timeAxis = []
for (i = 0; i < (2/CUTOFF); i+=1/(CUTOFF * TIMES)) { timeAxis.push(i) }

// Prepare plot coordinates for eye diagram
const plots = []
for (i = 5; i < 40; i += TIMES) {
  plots.push({
    x: timeAxis,
    y: repeatedBitSequence.slice(i, i+19),
    type: 'path',
    line: {smoothing: 2, simplify: true}
  })
}

// Plot filtered signal
plotlib.plot([
  {
    y: repeatedBitSequence
  }
], {
  title: 'Filtered Signal'
})

// Plot eye diagram
plotlib.plot(plots, { title: 'Plot for eye diagram'})
