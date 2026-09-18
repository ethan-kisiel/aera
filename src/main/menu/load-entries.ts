import { BaseWindow, dialog, OpenDialogOptions } from 'electron'
import { Entry } from '../../types/shared-types'
import fs from 'node:fs/promises'

export async function getEntryFilePath(mainWindow: BaseWindow): Promise<string | undefined> {
  const options = {
    title: 'Select your entries files',
    buttonLabel: 'Add File',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  } as OpenDialogOptions

  // Trigger the window
  return dialog.showOpenDialog(mainWindow, options).then((result) => {
    if (!result.canceled) {
      return result.filePaths[0] // Array of selected file paths
    }
    return undefined
  })
}

export async function parseEntriesFile(filePath: string): Promise<Entry[]> {
  const entries: Entry[] = []
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    const jsonData = JSON.parse(data) as (Omit<Entry, 'check_number'> & { checkNumber: string })[]
    jsonData.forEach((entry) => {
      const validEntry = {
        ...entry,
        check_number: entry.checkNumber,
        id: -1
      }
      entries.push(validEntry as Omit<Entry & { checkNumber: string }, 'checkNumber'>)
    })
    return entries
  } catch {
    console.log('Something went wrong loading entries')
  }
  return entries
}
