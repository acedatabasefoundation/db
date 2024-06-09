import { td } from '#ace'
import { Memory } from '../objects/Memory.js'
import { open, mkdir } from 'node:fs/promises'
import { getPaths, doesPathExist, getByteAmount } from '../util/file.js'


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
export async function appendWal (options) {
  if (Memory.txn.step === 'lastReq' && Memory.txn.writeStr) {
    await toFile(options)
    toMemory()
  }
}


/**
 * @param { td.AceFnOptions } options
 * @returns { Promise<void> }
 */
async function toFile (options) {
  const paths = getPaths(options.dir, ['dir', 'wal'])

  if (!await doesPathExist(paths.dir)) await mkdir(paths.dir)
  if (!Memory.wal.filehandle) Memory.wal.filehandle = await open(paths.wal, 'a+')

  Memory.wal.fileSize = (await Memory.wal.filehandle.stat()).size
  await Memory.wal.filehandle.appendFile(Memory.txn.writeStr, { flag: 'a+', flush: true })
}


/** @returns { void } */
function toMemory () {
  for (const entry of Memory.txn.writeMap) {
    const byteAmount = (getByteAmount(entry[0]) + getByteAmount(entry[1]))
    const ogWalValue = Memory.wal.map.get(entry[0])

    Memory.wal.revert.map.set(entry[0], ogWalValue)
    Memory.wal.revert.byteAmount += byteAmount

    Memory.wal.map.set(entry[0], entry[1])
    Memory.wal.byteAmount += byteAmount
  }
}
