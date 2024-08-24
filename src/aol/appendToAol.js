import { open } from 'node:fs/promises'
import { initPaths } from '../util/file.js'
import { Memory } from '../objects/Memory.js'
import { AceError } from '../objects/AceError.js'
import { binarySearchAdd } from '../util/binarySearch.js'


/** @returns { Promise<void> } */
export async function appendToAol () {
  if (Memory.txn.step === 'lastReq' && Memory.txn.writeArray.length) {
    await toFile()
    toMemory()
  }
}


/** @returns { Promise<void> } */
async function toFile () {
  await initPaths([ 'dir', 'aol' ])

  if (!Memory.txn.paths) throw new AceError('toFile__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling toFile()', {})
  if (!Memory.aol.filehandle) throw new AceError('toFile__missingFileHandle', 'Please ensure Memory.aol.filehandle is a truthy when calling toFile(), by sending "aol" to initPaths()', {})

  Memory.aol.ogFileSize = Memory.aol.nowFileSize = (await Memory.aol.filehandle.stat()).size

  const start = (Memory.aol.nowFileSize > 0) ? Memory.aol.nowFileSize - 1 : 0 // take out the trailing ]
  const writeStream = Memory.aol.filehandle.createWriteStream({ encoding: 'utf-8', start })
  const str = JSON.stringify(Memory.txn.writeArray)

  if (!Memory.aol.nowFileSize) writeStream.write(str)
  else {
    writeStream.write(',')
    writeStream.write(str.substring(1)) // remove opening [
  }

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
    writeStream.end()
  })

  Memory.aol.filehandle = await open(Memory.txn.paths.aol, 'a+') // when we call writeStream.end() that also ends the filehandle so w/o this line the line below won't work
  Memory.aol.nowFileSize = (await Memory.aol.filehandle.stat()).size
}


/** @returns { void } */
function toMemory () {
  for (const graphItem of Memory.txn.writeArray) {
    binarySearchAdd(Memory.aol.array, graphItem)
  }
}
