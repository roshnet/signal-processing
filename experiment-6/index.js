const matrix = require('matrix-js')

const M = 3

// Code word and data word length for (7,4) block code
const N = Math.pow(2, M) - 1
const K = Math.pow(2, M) - 1 - M

const h = matrix([
  [1, 1, 0],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
]).trans()

let p = matrix(h)([], [0, K - 1])
p = matrix(p).trans()

let G = Array(K)

for (let i = 0; i < K; i++) {
  G[i] = Array(K)
}

for (let i = 0; i < K; i++) {
  for (let j = 0; j < K; j++) {
    if (i == j) G[i][j] = 1
    else G[i][j] = 0
  }
}

G = matrix(G).merge.right(p)
G = matrix(G)

const receivedCodeWord = matrix([[1, 0, 1, 1, 0, 0, 1]])

const syndrome = receivedCodeWord.prod(matrix(matrix(h).trans()))

syndrome[0].forEach((v, i) => {
  syndrome[0][i] = v % 2
})

let sum = 0
for (let i = 0; i < syndrome[0].length; i++) {
  sum += syndrome[0][i]
}

let dw = []
for (i = 0; i < K; i++) {
  let binary = i.toString(2)
  let diff = K - binary.length
  let paddedBinary = '0'.repeat(diff) + binary
  paddedBinary = paddedBinary.split('')
  paddedBinary.forEach((v, idx) => {
    paddedBinary[idx] = Number(paddedBinary[idx])
  })
  dw.push(paddedBinary)
}

let DW = matrix(dw)
let cw = DW.prod(G) // has valid codewords
cw.forEach((_v, i) => {
  cw[i].forEach((v, idx) => {
    cw[i][idx] = v % 2
  })
})

if (!sum) {
  console.log('Valid codeword!')
  // TODO
  // Print correct DW and RCW also
  // 1. Prepare all (valid) datawords (like dw)
  // 2. Prepare valid codewords (like cw)
  // 3. Compare each valid CW with RCW, and store index where they are equal.
  // 4. Print the dw at that index.
} else {
  console.log('Codeword was invalid. Attempting codeword correction.')
  codeWordCorrection(receivedCodeWord())
}

// RESULT: Log all values to the console
// console.log(cw)

// Generates the correct codeword from `receivedCodeWord`
function codeWordCorrection(receivedCodeWord) {
  let distances = []

  cw.forEach((v, i) => {
    let b = receivedCodeWord[0]

    // Calculate & store Hamming distance in `distances[]`
    let distance =
      (parseInt(v.join(''), 2) ^ parseInt(b.join(''), 2)).toString(2).split('1')
        .length - 1

    distances.push(distance)
  })

  let minimumDistance = Math.min(...distances)
  let index = distances.indexOf(minimumDistance)

  console.log('Valid codeword was found:', cw[index])
  console.log('Corresponding data word is:', dw[index])
}
