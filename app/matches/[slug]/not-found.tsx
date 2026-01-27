import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function MatchNotFound() {
  return (
    <div className="container mx-auto py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Матч не найден</h1>
            <p className="text-muted-foreground text-lg">
              К сожалению, запрашиваемый матч не существует или был удалён
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild variant="default" size="lg">
              <Link href="/matches">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Все матчи
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                На главную
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
