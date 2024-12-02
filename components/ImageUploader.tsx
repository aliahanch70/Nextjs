'use client';

import { useState } from 'react';

const ImageUploader = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);

      // Create a preview URL for the selected image
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setUploadStatus('Please select an image first.');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await fetch('/api/imageUpload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('Upload successful: ' + result.filePath);
      } else {
        setUploadStatus('Upload failed.');
      }
    } catch (error) {
      setUploadStatus('Error uploading the file.');
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Image Uploader</h2>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 max-w-xs" />}

      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Upload Image
      </button>

      {uploadStatus && <p className="mt-4">{uploadStatus}</p>}
    </div>
  );
};

export default ImageUploader;
