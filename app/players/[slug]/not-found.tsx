import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Игрок не найден</h1>
      <p className="text-muted-foreground mb-8">
        К сожалению, запрашиваемый игрок не найден в нашей базе данных.
      </p>
      <Link href="/players">
        <Button className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Вернуться к составу
        </Button>
      </Link>
    </div>
  )
}
