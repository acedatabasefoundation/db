import { Memory } from '../objects/Memory.js'


/** @returns { Promise<void> } */
export async function revertAppendToAol () {
  if (Memory.aol.filehandle && typeof Memory.aol.ogFileSize === 'number' && Memory.aol.ogFileSize !== Memory.aol.nowFileSize) {
    await Memory.aol.filehandle.truncate(Memory.aol.ogFileSize)
  }
}
