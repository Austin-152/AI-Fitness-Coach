"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"


interface MealUploadProps {
  onUpload: (file: File) => Promise<void>
  isAnalyzing?: boolean
}

export function MealUpload({ onUpload, isAnalyzing = false }: MealUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const t = useTranslations("upload")

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file)
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadClick = async () => {
    if (selectedFile) {
      await onUpload(selectedFile)
    }
  }

  const clearSelection = () => {
    setPreview(null)
    setSelectedFile(null)
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex min-h-50 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50"
          }`}
        >
          {preview ? (
            <div className="relative w-full p-4">
              <button
                onClick={clearSelection}
                className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1 text-background hover:bg-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={preview}
                alt="Meal preview"
                className="mx-auto max-h-[180px] rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="rounded-lg border-2 border-muted-foreground/30 p-4">
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("dragAndDrop")}
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isAnalyzing}
          />
        </div>
        <Button
          onClick={handleUploadClick}
          disabled={!selectedFile || isAnalyzing}
          className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            t("uploadImage")
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
