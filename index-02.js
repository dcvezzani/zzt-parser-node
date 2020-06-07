const BinaryFile = require('binary-file');
 
const myBinaryFile = new BinaryFile('./DCV.ZZT', 'r');
(async function () {
  try {
    await myBinaryFile.open();
    console.log('File opened');
    const stringLength = await myBinaryFile.readUInt32();
    console.log(">>>stringLength", stringLength)
//    const string = await myBinaryFile.readString(stringLength);
//    console.log(`File read: ${string}`);
    await myBinaryFile.close();
    console.log('File closed');
  } catch (err) {
    console.log(`There was an error: ${err}`);
  }
})();

