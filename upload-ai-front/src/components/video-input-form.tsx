import { Label } from '@radix-ui/react-label'
import { Separator } from '@radix-ui/react-separator'
import { FileVideo, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ChangeEvent, useMemo, useState } from 'react'

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget
    if (!files) {
      return
    }

    const selectedFile = files[0]
    setVideoFile(selectedFile)
  }

  const previewFile = useMemo(() => {
    if (!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form className='space-y-6'>
      <label
        htmlFor='video'
        className='border flex relative rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col
      items-center justify-center text-muted-foreground hover:bg-primary/10'
      >
        {previewFile ? (
          <video src={previewFile} controls={false} className='pointer-events-none absolute inset-0' />
        ) : (
          <>
            <FileVideo className='h-4 w-4' />
            Selecione um vídeo
          </>
        )}
      </label>
      <input type='file' id='video' accept='video/mp4' className='sr-only' onChange={handleFileUpload} />

      <Separator />

      <div className='space-2-1'>
        <Label htmlFor='transcription_prompt'>Prompt de descrição</Label>
        <Textarea
          id='transcription_prompt'
          className='h-20 leading-relaxed'
          placeholder='Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)'
        ></Textarea>
      </div>
      <Button type='submit' className='w-full'>
        Carregar vídeo
        <Upload className='h-4 w-4 ml-2' />
      </Button>
    </form>
  )
}
