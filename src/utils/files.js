export const MAX_IMAGE_MB = 10
export const MAX_FILE_MB = 20
export const IMAGE_MAX_WIDTH = 1600
export const IMAGE_QUALITY = 0.85

const MB = 1024 * 1024

export function isImage(file) {
  return Boolean(file?.type?.startsWith('image/'))
}

export function isPdf(file) {
  return file?.type === 'application/pdf'
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

export function validateFile(file) {
  if (!file) return { ok: false, reason: 'Файл не выбран' }
  const limit = isImage(file) ? MAX_IMAGE_MB : MAX_FILE_MB
  const limitBytes = limit * MB
  if (file.size > limitBytes) {
    return {
      ok: false,
      reason: `${file.name}: превышен лимит ${limit} MB (${formatBytes(file.size)})`,
    }
  }
  return { ok: true }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('FileReader returned non-string'))
        return
      }
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error || new Error('FileReader error'))
    reader.readAsDataURL(file)
  })
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error || new Error('FileReader error'))
    reader.readAsDataURL(file)
  })
}

function dataUrlToBlob(dataUrl, type) {
  const comma = dataUrl.indexOf(',')
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

export async function compressImage(file, opts = {}) {
  const maxWidth = opts.maxWidth ?? IMAGE_MAX_WIDTH
  const maxHeight = opts.maxHeight ?? IMAGE_MAX_WIDTH
  const quality = opts.quality ?? IMAGE_QUALITY

  if (!isImage(file)) return file
  if (file.type === 'image/gif') return file
  if (file.size < 200 * 1024) return file

  try {
    const dataUrl = await fileToDataUrl(file)
    const img = await loadImage(dataUrl)
    let { width, height } = img
    if (width <= maxWidth && height <= maxHeight) return file

    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)

    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const outDataUrl = canvas.toDataURL(outputType, quality)
    const blob = dataUrlToBlob(outDataUrl, outputType)
    if (blob.size >= file.size) return file

    const newName = file.name.replace(/\.[^.]+$/, '') + (outputType === 'image/png' ? '.png' : '.jpg')
    return new File([blob], newName, { type: outputType, lastModified: Date.now() })
  } catch {
    return file
  }
}

export async function prepareFile(file) {
  const compressed = await compressImage(file)
  return compressed
}

export async function filesToBase64Payload(files) {
  return Promise.all(
    files.map(async (f) => ({
      name: f.name,
      data: await fileToBase64(f),
    }))
  )
}

export function fileIconType(file) {
  if (!file) return 'other'
  if (isImage(file)) return 'image'
  if (isPdf(file)) return 'pdf'
  const ext = (file.name || '').split('.').pop()?.toLowerCase()
  if (['doc', 'docx'].includes(ext)) return 'doc'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio'
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive'
  return 'other'
}
