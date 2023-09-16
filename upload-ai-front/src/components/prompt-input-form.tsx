import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@radix-ui/react-select'
import { Separator } from './ui/separator'
import { Slider } from './ui/slider'
import { Label } from './ui/label'

export function PromptInputForm() {
  return (
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
        <Slider min={0} max={1} step={0.1}></Slider>
        <span className='block text-xs text-muted-foreground italic'>
          Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros.
        </span>
      </div>
    </div>
  )
}
