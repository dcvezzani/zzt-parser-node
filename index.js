const fs = require('fs')
const converter = require('hex2dec')

/*
Resources:
https://appuals.com/hex-calculator/
https://nodejs.org/api/buffer.html
file:///home/pi/dos-games/zzt/zztff.txt
*/

/*
// convert to hex
binary = fs.readFileSync('./DCV.ZZT');
var hexdata = Buffer.from(binary, 'ascii').toString('hex');

// convert back to binary
var buffer = Buffer.from(hexdata, 'hex');
fs.writeFileSync('DCV2.ZZT', buffer)
*/

class ZZTParser {
	constructor(filepath){
		this.filepath = filepath
		this._content = fs.readFileSync(this.filepath);
	}

	get content(){
		return this._content
	}

	get header(){
    const start = converter.hexToDec('00')
    const stop = converter.hexToDec('200')
    this._header = this._content.slice(start, stop)
    return this._header
	}
}

const sliceBuffer = function(buffer, startHex, stopHex=null){
  // console.log({startHex, stopHex})
  const start = parseInt(converter.hexToDec(startHex))
  let stop
  if (typeof stopHex === 'number') {
    stop = start + stopHex
  } else {
    stop = (stopHex) ? (parseInt(converter.hexToDec(stopHex)) + 1) : start + 1
  }
  return buffer.slice(start, stop)
}

const getDec = function(buffer, startHex, stopHex){
  const buffer2 = sliceBuffer(buffer, startHex, stopHex)
  // console.log({buffer2})
  const decValue = parseInt(converter.hexToDec(buffer2.reverse().toString('hex')))
  buffer2.reverse()
  return decValue
}

const getStr = function(buffer, startHex, stopHex){
  const buffer2 = sliceBuffer(buffer, startHex, stopHex)
  return buffer2.toString('ascii')
}

const subHex = function(aHexValue, bHexValue, options={}){
  const resultType = options.as || null
  const bDecValue = (typeof bHexValue === 'string') ? parseInt(converter.hexToDec(bHexValue)) : bHexValue

  const decValue = parseInt(converter.hexToDec(aHexValue)) - bDecValue
  return (resultType === 'decimal') ? decValue : converter.decToHex(decValue.toString(), {prefix: false})
}

const addHex = function(aHexValue, bHexValue, options={}){
  const resultType = options.as || null
  const bDecValue = (typeof bHexValue === 'string') ? parseInt(converter.hexToDec(bHexValue)) : bHexValue

  const decValue = parseInt(converter.hexToDec(aHexValue)) + bDecValue
  return (resultType === 'decimal') ? decValue : converter.decToHex(decValue.toString(), {prefix: false})
}

class Header {
  constructor(content){
    this.content = content
    this.flagAllocLength = subHex('47', '32', {as: 'decimal'})
    console.log(">>>this.flagAllocLength", this.flagAllocLength)
  }

  get boardCount(){
    // slice off two bytes, starting at 0x02
    // convert from binary to Buffer of hex
    // reverse bytes, flatten to string of hex
    // convert hex string to decimal value
    return getDec(this.content, '02', '03')
  }

  get ammo(){ return getDec(this.content, '04', '05') }
  get gems(){ return getDec(this.content, '06', '07') }
  get keys(){ 
    const black = getDec(this.content,  '08')
    const green = getDec(this.content,  '09')
    const cyan = getDec(this.content,   '0a')
    const red = getDec(this.content,    '0b')
    const purple = getDec(this.content, '0c')
    const yellow = getDec(this.content, '0d')
    const white = getDec(this.content,  '0e')
    return {black, green, cyan, red, purple, yellow, white}
  }
  get health(){ return getDec(this.content, '0f', '10') }
  get startingBoard(){ return getDec(this.content, '11', '12') }
  get torches(){ return getDec(this.content, '13', '14') }
  get torchCycles(){ return getDec(this.content, '15', '16') }
  get energizerCycles(){ return getDec(this.content, '17', '18') }
  get score(){ return getDec(this.content, '1b', '1c') }
  get titleLength(){ return getDec(this.content, '1d') }
  get title(){ 
    return getStr(this.content, '1e', this.titleLength)
  }
  get flags(){ 
    let offsetHex = '32'
    return (new Array(10)).fill(null).map((entry, index) => {
//       console.log({offsetHex})
      const flagLength = getDec(this.content, offsetHex)
//       console.log(">>>flagLength", flagLength)
      const flag = getStr(this.content, addHex(offsetHex, 1), flagLength)
//       console.log(">>>flag", flag)
      offsetHex = addHex(offsetHex, this.flagAllocLength)
//       console.log({offsetHex})
      return {id: index+1, flagLength, flag}
    })
  }
  get timeLeft(){ return getDec(this.content, '104', '105') }
  get savedGameByte(){ return getDec(this.content, '108') }

  get summary(){
    return {
      boardCount: this.boardCount,
      ammo: this.ammo,
      gems: this.gems,
      keys: this.keys,
      health: this.health,
      startingBoard: this.startingBoard,
      torches: this.torches,
      torchCycles: this.torchCycles,
      energizerCycles: this.energizerCycles,
      score: this.score,
      title: this.title,
      flags: this.flags,
      timeLeft: this.timeLeft,
      savedGameByte: this.savedGameByte
    }
  }
}

const parser = new ZZTParser('DCV2.ZZT')
console.log(">>>parser.header", parser.header)

const zztHeader = new Header(parser.header)
// console.log(zztHeader.boardCount)
// console.log(zztHeader.ammo)
// console.log(zztHeader.gems)
// console.log(zztHeader.keys)
console.log(zztHeader.health)
// console.log(zztHeader.startingBoard)
// console.log(zztHeader.torches)
// console.log(zztHeader.torchCycles)
// console.log(zztHeader.energizerCycles)
// console.log(zztHeader.score)
// console.log(zztHeader.titleLength)
// console.log(zztHeader.title)
// console.log(zztHeader.flags)
// console.log(zztHeader.timeLeft)
// console.log(zztHeader.savedGameByte)
console.log(zztHeader.summary)
