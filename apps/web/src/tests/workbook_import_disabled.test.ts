import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockXlsxRead, mockXlsxReadFile } = vi.hoisted(() => ({
  mockXlsxRead: vi.fn(),
  mockXlsxReadFile: vi.fn(),
}))

vi.mock('xlsx', () => ({
  read: mockXlsxRead,
  readFile: mockXlsxReadFile,
  utils: {
    sheet_to_json: vi.fn(),
  },
  default: {
    read: mockXlsxRead,
    readFile: mockXlsxReadFile,
    utils: {
      sheet_to_json: vi.fn(),
    },
  },
}))

import { POST as importHandler } from '../app/api/b2c/attractions/import/route'
import { POST as masterImportHandler } from '../app/api/b2c/attractions/master-workbook/import/route'

describe('Gate 05E / Security Patch: Attraction Workbook Import Server Boundary Disable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('strictly returns HTTP 503 and never calls XLSX.read when /api/b2c/attractions/import is invoked', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['malicious-or-untrusted-content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'test.xlsx')

    const req = new Request('http://localhost:3000/api/b2c/attractions/import', {
      method: 'POST',
      body: formData,
    })

    const res = await importHandler(req)
    expect(res.status).toBe(503)

    const json = await res.json()
    expect(json.error).toBe('Workbook import is temporarily unavailable while the spreadsheet processor is being upgraded.')
    expect(json.code).toBe('WORKBOOK_IMPORT_DISABLED')

    // Confirm that XLSX parser is NEVER invoked at runtime
    expect(mockXlsxRead).not.toHaveBeenCalled()
    expect(mockXlsxReadFile).not.toHaveBeenCalled()
  })

  it('strictly returns HTTP 503 and never calls XLSX.read when /api/b2c/attractions/master-workbook/import is invoked', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['dummy-binary'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'master.xlsx')

    const req = new Request('http://localhost:3000/api/b2c/attractions/master-workbook/import', {
      method: 'POST',
      body: formData,
    })

    const res = await masterImportHandler(req)
    expect(res.status).toBe(503)

    const json = await res.json()
    expect(json.error).toBe('Workbook import is temporarily unavailable while the spreadsheet processor is being upgraded.')
    expect(json.code).toBe('WORKBOOK_IMPORT_DISABLED')

    // Confirm that XLSX parser is NEVER invoked at runtime
    expect(mockXlsxRead).not.toHaveBeenCalled()
    expect(mockXlsxReadFile).not.toHaveBeenCalled()
  })
})
