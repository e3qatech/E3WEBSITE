import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(`uploads/${fileName}`, file, {
      access: 'public',
    })

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      fileName: file.name
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
