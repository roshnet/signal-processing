/**
 * Author: Roshan Sharma (reprogram46@gmail.com)
 */

let experiment

try {
  experiment = `./experiment-${process.argv[2]}`
} catch (e) {
  console.error(e)
  console.log('Running experiment-1')
  experiment = './experiment-1'
}

require(experiment)
