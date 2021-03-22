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
  let indexes = []
  let partitions = []
  let codebook = []
  for (let i = min; i <= max; i += interval) {
    partitions.push(i)
  }

  let _start = min - interval / 2
  let _end = max + interval / 2
  for (let i = _start; i <= _end; i += interval) {
    codebook.push(i)
  }

  let idx = 0
  for (let sample of signal) {
    idx = 0
    while (idx < partitions.length && sample > partitions[idx]) {
      idx += 1
    }
    quantizedSignal.push(codebook[idx])
    indexes.push(idx)
  }
  return {
    quantizedSignal,
    indexes,
  }
}

// Records audio for `duration` seconds, at sampled at `freq` Hz.
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
  return [].slice.call(wav.getSamples())
}

// Prepare values for a square plot for an otherwise linear plot
function squarify(X, Y) {
  let peaksIndex = []

  // Check for discontinuities (peaks) in y-values
  Y.map((value, idx) => {
    if (Y[idx + 1] && Y[idx + 1] !== Y[idx]) {
      peaksIndex.push(idx)
    }
  })

  // Extend to another data point for perpendicular plot
  for (let p of peaksIndex) {
    Y.splice(p + 1, 0, Y[p])
    X.splice(p + 1, 0, X[p + 1])
    peaksIndex.forEach((value, i) => {
      // Since indexes have shifted, update the peak indexes too
      peaksIndex[i] += 1
    })
  }
  return { X, Y }
}

// Creates a new wav file from given signal
function createWavefile(signal, freq, filename) {
  let wav = new wavefile.WaveFile()
  wav.fromScratch(1, freq, '8', signal)
  fs.writeFileSync(filename, wav.toBuffer())
}

function splitSequence(seq, len) {
  const size = Math.ceil(seq.length / len)
  const r = Array(size)
  let skip = 0

  for (let i = 0; i < size; i++) {
    r[i] = seq.substr(skip, len)
    skip += len
  }
  return r
}

module.exports = {
  magnitude,
  readAudio: readAudioFromFile,
  recordAudio: recordAudioToFile,
  quantize,
  createWavefile,
  squarify,
  splitSequence
}
