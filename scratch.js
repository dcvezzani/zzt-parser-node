const converter = require('hex2dec')

const b = Buffer.from('ff', 'hex')
process.stdout.write(b)

console.log(converter.hexToDec('FF'), converter.decToHex('255', { prefix: false }))
