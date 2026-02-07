import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewsNotFound() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Новость не найдена</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          К сожалению, запрашиваемая новость не существует или была удалена.
        </p>
        <Link href="/news">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Вернуться к новостям
          </Button>
        </Link>
      </div>
    </div>
  );
}
