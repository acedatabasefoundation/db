import { readFile } from 'node:fs/promises'
import { initPaths } from '../util/file.js'
import { Memory } from '../objects/Memory.js'
import { graphSort } from '../ace/graphSort.js'
import { AceError } from '../objects/AceError.js'


/** @returns { Promise<void> } */
export async function initMemoryAol () {
  if (Memory.txn.step === 'preEnter' && !Memory.aol.array.length) { // IF txn's first time through gateway AND no aol memory empty => initialize memory
    await initPaths([ 'dir', 'aol' ])

    if (!Memory.txn.paths) throw new AceError('initMemoryAol__missingPaths', 'Please ensure Memory.txn.paths is a truthy when calling initMemoryAol()', {})
    if (!Memory.aol.filehandle) throw new AceError('initMemoryAol__missingFileHandle', 'Please ensure Memory.aol.filehandle is a truthy when calling initMemoryAol()', {})
  
    let fileDataStr = await readFile(Memory.aol.filehandle, { encoding: 'utf8' })
  
    if (!fileDataStr) Memory.aol.ogFileSize = Memory.aol.nowFileSize = 0
    else {
      Memory.aol.array = JSON.parse(fileDataStr)
  
      Memory.aol.array.sort((x, y) => {
        return graphSort(x.$aK, y.$aK, 'graphKey', 'asc')
      })
  
      Memory.aol.ogFileSize = Memory.aol.nowFileSize = (await Memory.aol.filehandle.stat()).size
    }
  }
}
