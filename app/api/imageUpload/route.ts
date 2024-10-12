import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Define the directory to save uploaded images
const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure the directory exists
const ensureUploadDirExists = async () => {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

export async function POST(req: Request) {
  try {
    // Ensure the uploads directory exists
    await ensureUploadDirExists();

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop();
    const newFileName = `${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadDir, newFileName);

    // Save the file to the uploads directory
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    return NextResponse.json({ message: 'File uploaded', filePath: `/uploads/${newFileName}` });
  } catch (error) {
    return NextResponse.json({ message: 'Error uploading file', error: error.message }, { status: 500 });
  }
}
