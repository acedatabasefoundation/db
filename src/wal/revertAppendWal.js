import { Memory } from '../objects/Memory.js'


/** @returns { Promise<void> } */
export async function revertAppendWal () {
  if (Memory.wal.filehandle && typeof Memory.wal.fileSize === 'number') {
    await Memory.wal.filehandle.truncate(Memory.wal.fileSize)
  }
}
