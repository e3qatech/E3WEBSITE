import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure public/uploads directory exists or we might fail. 
    // In production, we'd use S3. This is for local dev.
    const ext = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${ext}`
    
    // We assume public/uploads exists, if not we will catch it
    const uploadPath = join(process.cwd(), 'public/uploads', fileName)
    
    try {
      await writeFile(uploadPath, buffer)
    } catch (e) {
      // Create dir if fails and try again
      const { mkdir } = await import("fs/promises")
      await mkdir(join(process.cwd(), 'public/uploads'), { recursive: true })
      await writeFile(uploadPath, buffer)
    }
    
    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${fileName}`,
      fileName: file.name
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
