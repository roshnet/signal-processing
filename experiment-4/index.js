const plotlib = require('nodeplotlib')
const { createWavefile, readAudio, quantize, splitSequence } = require('../utils')

const FILENAME = 'samples/main.wav'
const FS = 8000 // Sampling frequency
const LEVELS = 16
const N = Math.pow(2, 14)
const FC = 500000 // carrier frequency
const BITS = 40

const originalSamples = readAudio(FILENAME).slice(0, N)

const mapping = {
  '00': -3,
  '01': -1,
  '11': 1,
  '10': 3,
}

const _ = quantize(originalSamples, LEVELS)
const quantizedSamples = _.quantizedSignal
let indexes = _.indexes

if (quantizedSamples.length !== N) {
  console.error('Incorrect number of samples in signals. Exiting.')
  process.exit(1)
}

// Take 1000 of 16000 samples
indexes = indexes.slice(0, 1000)

// Convert all indexes to binary
indexes.forEach((_, idx) => {
  indexes[idx] = indexes[idx].toString(2)
})

// Padding zeros to make the binary 6-bits long
indexes.forEach((value, idx) => {
  let diff = 6 - value.length
  if (diff < 0) {
    console.error('Binary already larger than 6 bits. Exiting.', value, idx)
    process.exit(1) // or continue instead of exiting to allow longer values
  }
  indexes[idx] = '0'.repeat(diff) + value
})

// Join binaries and select first 40 bits
let sequence = indexes.join('').slice(0, 40)

// Create sequence of 4 bits
sequence = splitSequence(sequence, 4)

// Prepare inphase component and quadrature component from sequence
let inphaseComponents = []
let quadratureComponents = []

for (el of sequence) {
  // Skip an entry which isn't 4-bit long
  if (el.length !== 4) continue

  // Parse inphase and quadrature out of 4 bits in `el`
  quadratureComponents.push(mapping[el.slice(0, 2)])
  inphaseComponents.push(mapping[el.slice(2, 4)])
}

let inphaseVector = []
for (value of inphaseComponents) {
  for (let i = 0; i < 1/(FC); i += 1/(100*FC)) {
    inphaseVector.push(value * Math.cos(2 * Math.PI * FC * i))
  }
}

let quadratureVector = []
for (value of quadratureComponents) {
  for (let i = 0; i < 1/(FC); i += 1/(100*FC)) {
    quadratureVector.push(value * Math.sin(2 * Math.PI * FC * i))
  }
}

const modulatedVector = []
for (let i = 0; i < 1000; i++) {
  modulatedVector.push(inphaseVector[i] + quadratureVector[i])
}

const timeVector = []
for (let i = 0; i < 1000; i++) {
  timeVector.push(i * 1/(100 * FC))
}

plotlib.plot([
  {
    x: inphaseComponents,
    y: quadratureComponents,
    type: 'scatter',
    mode: 'markers'
  }
], {
  title: 'Scatter Plot',
  yaxis: { title: 'Quadrature Component ->', showline: false },
  xaxis: {title: 'Inphase Component ->', showline: false}
})


plotlib.plot([
  {
    x: timeVector,
    y: inphaseVector,
  }
], {
  title: 'Inphase Component Plot',
  yaxis: { title: 'In-phase component ->' },
  xaxis: {title: 'Time ->'}
})

plotlib.plot([
  {
    x: timeVector,
    y: quadratureVector
  }
], {
  title: 'Quadrature Component Plot',
  yaxis: { title: 'Quadrature ->' },
  xaxis: {title: 'Time ->'}
})

plotlib.plot([
  {
    x: timeVector,
    y: modulatedVector
  }
], {
  title: 'Modulated Signal Plot',
  yaxis: { title: 'Modulated Signal ->' },
  xaxis: {title: 'Time ->'}
})
