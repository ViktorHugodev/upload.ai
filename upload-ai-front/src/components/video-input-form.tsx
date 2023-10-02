import { Label } from '@radix-ui/react-label'
import { Separator } from '@radix-ui/react-separator'
import { FileVideo, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { api } from '@/lib/axios'

interface VideoInputFormProps {
  onVideoIdSelect: (videoId: string) => void
}
type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success'

const statusMessages = {
  converting: 'Convertendo...',
  uploading: 'Carregando...',
  generating: 'Transcrevendo...',
  success: 'Sucesso!',
}

export function VideoInputForm({ onVideoIdSelect }: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('waiting')

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

    if (!videoFile) return

    try {
      setStatus('converting')

      const audioFile = await convertVideoToAudio(videoFile)

      const data = new FormData()

      data.append('file', audioFile)

      setStatus('uploading')

      const response = await api.post('/video', data)

      const videoId = response.data.video.id

      setStatus('generating')

      await api.post(`/video/${videoId}/transcription`, {
        prompt,
      })

      setStatus('success')

      onVideoIdSelect(videoId)
    } catch (error) {
      console.log('🚀 ~ file: video-input-form.tsx:117 ~ handleUploadVideo ~ error:', error)
    }
  }

  const previewFile = useMemo(() => {
    if (!videoFile) {
      return null
    }
    return URL.createObjectURL(videoFile)
  }, [videoFile])

  useEffect(() => {
    if (!videoFile) return

    setStatus('waiting')
    // clear the promptInputRef;

    if (promptInputRef?.current) {
      promptInputRef.current.value = ''
    }
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
          disabled={status !== 'waiting'}
          ref={promptInputRef}
          id='transcription_prompt'
          className='h-20 leading-relaxed'
          placeholder='Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)'
        ></Textarea>
      </div>
      <Button
        data-success={status === 'success'}
        disabled={status !== 'waiting'}
        type='submit'
        className='w-full data-[success=true]:bg-emerald-400
       '
      >
        {status !== 'waiting' ? (
          <>
            {statusMessages[status]}
            {status !== 'success' && (
              <span className='ml-2 inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]'></span>
            )}
          </>
        ) : (
          <>
            Carregar vídeo
            <Upload className='h-4 w-4 ml-2' />
          </>
        )}
      </Button>
    </form>
  )
}
