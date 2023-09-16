import { Label } from '@radix-ui/react-label'
import { Separator } from '@radix-ui/react-separator'
import { FileVideo, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ChangeEvent, FormEvent, FormEventHandler, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { api } from '@/lib/axios'

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) {
    console.log('Convert started')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', log => {
    //   console.log('log geral', log)
    // })

    ffmpeg.on('progress', progress => {
      console.log('Convert progress', Math.floor(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', { type: 'audio/mpeg' })

    console.log('convert finish')
    return audioFile
  }
  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const prompt = promptInputRef.current?.value
    console.log('🚀 ~ file: video-input-form.tsx:64 ~ handleUploadVideo ~ prompt:', prompt)

    if (!videoFile) return

    const audioFile = await convertVideoToAudio(videoFile)
    const data = new FormData()
    data.append('file', audioFile)

    const response = await api.post('/video', data)
    const videoId = response.data.video.id

    const dataTranscription = await api.post(`/video/${videoId}/transcription`, {
      prompt,
    })
    console.log(
      '🚀 ~ file: video-input-form.tsx:78 ~ handleUploadVideo ~ dataTranscription:',
      dataTranscription,
    )

    // console.log('🚀 ~ file: video-input-form.tsx:58 ~ handleUploadVideo ~ audioFile:', audioFile)
  }

  const previewFile = useMemo(() => {
    if (!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form className='space-y-6' onSubmit={handleUploadVideo}>
      <label
        htmlFor='video'
        className='border flex relative rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col
      items-center justify-center text-muted-foreground hover:bg-primary/10'
      >
        {previewFile ? (
          <video
            src={previewFile}
            controls={false}
            className='pointer-events-none absolute inset-0'
          />
        ) : (
          <>
            <FileVideo className='h-4 w-4' />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        type='file'
        id='video'
        accept='video/mp4'
        className='sr-only'
        onChange={handleFileSelected}
      />

      <Separator />

      <div className='space-2-1'>
        <Label htmlFor='transcription_prompt'>Prompt de descrição</Label>
        <Textarea
          ref={promptInputRef}
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
