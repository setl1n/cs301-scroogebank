"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, Check, AlertCircle } from "lucide-react"

interface VerificationParams {
  token: string | null
  email: string | null
}

const App: React.FC = () => {
  const [params, setParams] = useState<VerificationParams>({
    token: null,
    email: null,
  })
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    // Extract query parameters from URL
    const searchParams = new URLSearchParams(window.location.search)
    setParams({
      token: searchParams.get("token"),
      email: searchParams.get("email"),
    })
  }, [])

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = allowedTypes.includes(file.type) || 
                        ['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension || '');
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const isValidSize = file.size <= maxSize;
    
    if (!isValidType || !isValidSize) {
      setFileError("Invalid file type or format. Only PNG, JPEG, and PDF files up to 10MB are allowed.");
      return false;
    }
    
    setFileError(null);
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setFile(null);
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFile(null);
        // Reset the input to allow selecting the same file again
        e.target.value = '';
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return
    if (fileError) return
    if (!params.token || !params.email) {
      setUploadStatus("error")
      setErrorMessage("Missing required parameters in URL")
      return
    }

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("token", params.token)
      formData.append("email", params.email)

      // Use the correct endpoint for verification uploads
      const response = await fetch("https://alb.itsag2t1.com/api/v1/verification/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      setUploadStatus("success")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Verification Upload</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your verification document for {params.email || "verification"}
          </p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit}>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-4 transition-colors
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"}
                ${file ? "bg-green-50 border-green-300" : ""}
                ${fileError ? "bg-red-50 border-red-300" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-2">
                <Upload className={file ? "text-green-500" : fileError ? "text-red-500" : "text-gray-400"} size={24} />
                {file ? (
                  <div>
                    <p className="font-medium text-green-600">File selected</p>
                    <p className="text-sm text-gray-500">{file.name}</p>
                  </div>
                ) : fileError ? (
                  <div>
                    <p className="font-medium text-red-600">Invalid file</p>
                    <p className="text-sm text-red-500">{fileError}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Drop your file here or click to browse</p>
                    <p className="text-sm text-gray-500">Supports PDF, JPG, PNG (max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {uploadStatus === "success" && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-green-600 font-medium">Success</h3>
                  <p className="text-sm text-green-700">Your verification document has been uploaded successfully.</p>
                </div>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-red-600 font-medium">Error</h3>
                  <p className="text-sm text-red-700">
                    {errorMessage || "There was an error uploading your document. Please try again."}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!file || !!fileError || isUploading}
            >
              {isUploading ? "Uploading..." : "Submit Verification"}
            </button>
          </form>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Secure verification portal</p>
        </div>
      </div>
    </div>
  )
}

export default App
