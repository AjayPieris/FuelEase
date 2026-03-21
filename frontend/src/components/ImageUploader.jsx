import { useState } from 'react';
import api from '../api/axios';

export default function ImageUploader({ onUploadSuccess, label = "Upload Image", altText = "Preview" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show a local preview immediately
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const uploadedUrl = response.data.url;
      setIsUploading(false);
      
      // Send the URL back to the parent component (Auth.jsx)
      if (onUploadSuccess) onUploadSuccess(uploadedUrl);
      
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. Please try again.");
      setIsUploading(false);
      setPreview(null);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      {!preview ? (
        <div>
          <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-100 transition inline-block">
            {label}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF up to 4MB</p>
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt={altText} className="max-h-32 mx-auto rounded" />
          
          {isUploading ? (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center font-bold text-blue-600">
              Uploading...
            </div>
          ) : (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
              ✓
            </div>
          )}
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-2 font-bold">{error}</p>}
    </div>
  );
}
