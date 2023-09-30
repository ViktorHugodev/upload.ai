import { Button } from './components/ui/button'
import { Github, Wand2 } from 'lucide-react'
import { Separator } from './components/ui/separator'
import { Textarea } from './components/ui/textarea'
import { Label } from './components/ui/label'

import { VideoInputForm } from './components/video-input-form'

import { PromptSelect } from './components/prompt-select'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
import { Slider } from './components/ui/slider'
import { useCompletion } from 'ai/react'

export function App() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const { input, setInput, handleInputChange, handleSubmit, completion, isLoading } = useCompletion(
    {
      api: `${import.meta.env.VITE_BASEURL}/ai/openai`,
      body: {
        videoId,
        temperature,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
<<<<<<< HEAD
  console.log('🚀 ~ file: app.tsx:27 ~ App ~ handleSubmit:', handleSubmit)
=======
>>>>>>> 2996124c3856291959fd91930a0b5619ba28fb04

  console.log('🚀 ~ file: app.tsx:27 ~ App ~ isLoading:', isLoading)
  return (
    <div className='min-h-screen flex flex-col'>
      <div className='px-6 py-3 flex items-center justify-between border-b'>
        <h1 className='text-xl font-bold'>upload.ai</h1>

        <div className='flex items-center gap-3 '>
          <span className='text-sm text-muted-foreground'>
            Resuma vídeos, crie títulos e descrições chamativas para seus posts.
          </span>
          <Separator orientation='vertical' className='h-6' />
          <a href='https://github.com/ViktorHugodev'>
            <Button variant='outline' className='hover:bg-primary/10'>
              <Github className='w-4 h-4 mr-3' />
              Github
            </Button>
          </a>
        </div>
      </div>
      <main className='flex-1 p-6 gap-6 flex'>
        <div className='flex flex-col flex-1'>
          <div className='grid grid-rows-2 gap-4 flex-1 '>
            <Textarea
              className='resize-none p-4 leading-relaxed'
              placeholder='Inclua o prompt para a IA, são as palavras chave para uma maior acertabilidade da ferramenta'
              value={input}
              onChange={handleInputChange}
            />
            <Textarea
              className='resize-none p-4 leading-relaxed'
              placeholder='Resultado gerado pela IA...'
              readOnly
              value={completion}
            />
          </div>
          <p className='text-sm text-muted-foreground mt-2'>
            Lembre-se você pode utilizar a variável
            <code className='text-green-500'>{' {transcription}'}</code>
          </p>
        </div>
        <aside className='w-80 space-y-6'>
          <VideoInputForm onVideoIdSelect={setVideoId} isGenerating={isGenerating} />

          <Separator />

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label>Prompt</Label>
              <PromptSelect onPromptSelect={setInput} />
            </div>

            <Separator />

            <div className='space-y-2'>
              <Label>Modelo</Label>
              <Select defaultValue='gpt3.5'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gpt3.5'>GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className='block text-xs text-muted-foreground italic'>
                Você poderá customizar essa opção em breve.
              </span>

              <Separator />

              <div className='space-y-4'>
                <Label>Temperatura</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={value => setTemperature(value[0])}
                />
                <span className='block text-xs text-muted-foreground italic'>
                  Valores mais altos tendem a deixar o resultado mais criativo e com possíveis
                  erros.
                </span>
              </div>
            </div>

            <Separator />

            <Button disabled={isLoading} type='submit' className='w-full'>
              Executar
              <Wand2 className='h-4 w-4 ml-2' />
            </Button>
          </form>
        </aside>
      </main>
    </div>
  )
}
