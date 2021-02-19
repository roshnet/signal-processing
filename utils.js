const recorder = require('node-record-lpcm16')
const fs = require('fs')
const wavefile = require('wavefile')

// Returns array of magnitudes of complex numbers
function magnitude(complex) {
  complex.forEach((pair, index) => {
    complex[index] = Math.sqrt(Math.pow(pair[0], 2) + Math.pow(pair[1], 2))
  })
  return complex
}

// Quantize the given signal into specified levels
function quantize(signal, levels) {
  const min = Math.min(...signal)
  const max = Math.max(...signal)
  const interval = (max - min) / levels

  let quantizedSignal = []
  let partitions = []
  let codebook = []
  for (let i = min; i < max; i += interval) {
    partitions.push(i)
  }

  let _start = min - interval / 2
  let _end = max + interval / 2
  for (let i = _start; i < _end; i += interval) {
    codebook.push(i)
  }

  let idx = 0
  for (let sample of signal) {
    idx = 0
    while (idx < partitions.length && sample > partitions[idx]) {
      idx += 1
    }
    quantizedSignal.push(codebook[idx])
  }
  return quantizedSignal
}

// Records audio for `duration` seconds, at sampled at `freq` kHz.
// Saves audio to `filename`.wav.
async function recordAudioToFile(filename, duration, freq) {
  const file = fs.createWriteStream(filename, { encoding: 'binary' })

  return new Promise((resolve, reject) => {
    try {
      const recording = recorder.record({
        sampleRate: freq,
        channels: 1,
        endOnSilence: false,
        silence: 0.1,
      })
      recording.stream().pipe(file)
      setTimeout(() => {
        recording.stop()
        let inputSamples = []
        inputSamples = readAudioFromFile(filename)

        // Convert Float64 samples to type 'number'
        inputSamples = [].slice.call(inputSamples)

        resolve(inputSamples)
      }, duration * 1000)
    } catch (err) {
      reject(err)
    }
  })
}

// Reads audio from file in buffer and returns array of samples
function readAudioFromFile(filename) {
  let wav = new wavefile.WaveFile()
  wav.fromBuffer(fs.readFileSync(filename))
  return wav.getSamples()
}

module.exports.magnitude = magnitude
module.exports.readAudio = readAudioFromFile
module.exports.recordAudio = recordAudioToFile
module.exports.quantize = quantize
