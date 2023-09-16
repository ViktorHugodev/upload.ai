import { api } from '@/lib/axios'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface PromptsProps {
  id: string
  title: string
  template: string
}
interface PromptSelectProps {
  onPromptSelect: (prompt: string) => void
}

export function PromptSelect({ onPromptSelect }: PromptSelectProps) {
  const [prompts, setPrompts] = useState<PromptsProps[]>()

  useEffect(() => {
    api.get('/prompts').then(prompt => {
      setPrompts(prompt.data)
    })
  }, [])

  function handleTemplateSelect(promptId: string) {
    const selectedPrompt = prompts?.find(template => template.id === promptId)

    if (!selectedPrompt) return

    const template = selectedPrompt.template
    onPromptSelect(template)
  }

  return (
    <Select onValueChange={handleTemplateSelect}>
      <SelectTrigger>
        <SelectValue placeholder='Selecione um prompt...' />
      </SelectTrigger>

      <SelectContent>
        {prompts?.map(prompt => (
          <SelectItem key={prompt.id} value={prompt.id}>
            {prompt.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
