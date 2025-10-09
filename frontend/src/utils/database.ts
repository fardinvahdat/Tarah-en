import Dexie from "dexie"
import { LocalStorageDiscardedKey } from "@/configs/canvas"
import { databaseId } from '@/store'
import { Snapshot } from "@/types/history"


export interface WritingBoardImg {
  id: string
  dataURL: string
}

// export interface Snapshot {
//   index: number
//   templates: Template[]
// }

const DatabaseNamePrefix = 'EDITOR'
// Delete invalid/expired databases
// When the application is closed (close or refresh the browser), its database ID will be recorded in localStorage, indicating that the database pointed to by the ID is invalid
// When the application is initialized, check all current databases and delete the invalid databases recorded
// In addition, databases that are more than 12 hours away from initialization will also be deleted (this is to prevent the database from being deleted incorrectly due to accidents)
export const deleteDiscardedDB = async () => {
  const now = new Date().getTime()

  const localStorageDiscardedDB = localStorage.getItem(LocalStorageDiscardedKey)
  const localStorageDiscardedDBList: string[] = localStorageDiscardedDB ? JSON.parse(localStorageDiscardedDB) : []

  const databaseNames = await Dexie.getDatabaseNames()
  const discardedDBNames = databaseNames.filter(name => {
    if (name.indexOf(DatabaseNamePrefix) === -1) return false
    
    const [prefix, id, time] = name.split('_')
    if (prefix !== DatabaseNamePrefix || !id || !time) return true
    if (localStorageDiscardedDBList.includes(id)) return true
    if (now - (+time) >= 1000 * 60 * 60 * 12) return true

    return false
  })

  for (const name of discardedDBNames) Dexie.delete(name)
  localStorage.removeItem(LocalStorageDiscardedKey)
}

class DrawDB extends Dexie {
  public snapshots: Dexie.Table<Snapshot, number>
  public writingBoardImgs: Dexie.Table<WritingBoardImg, number>

  public constructor() {
    super(`${DatabaseNamePrefix}_${databaseId}_${new Date().getTime()}`)
    this.version(1).stores({
      snapshots: '++id',
      writingBoardImgs: '++id',
    })
    this.snapshots = this.table('snapshots')
    this.writingBoardImgs = this.table('writingBoardImgs')
  }
}

export const db = new DrawDB()