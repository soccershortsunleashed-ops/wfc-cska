import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

const sponsors = [
  {
    id: 1,
    name: "Самолет",
    logo: "/sponsors/samolet.svg",
    url: "https://samolet.ru/?utm_source=jfkcska&utm_medium=sport&utm_campaign=sponsorstvo_samoletgroup~otc5mwm1",
    tier: "main",
  },
  {
    id: 2,
    name: "Фонбет",
    logo: "/sponsors/fonbet.svg",
    url: "https://fnbt.link/ce241",
    tier: "main",
  },
  {
    id: 3,
    name: "Primera",
    logo: "/sponsors/primera.svg",
    url: "https://primerasport.ru/?ysclid=mhepuxvexn6735641",
    tier: "main",
  },
  {
    id: 4,
    name: "Rota Agro",
    logo: "/sponsors/rota-agro.svg",
    url: "https://rota-agro.ru/",
    tier: "partner",
  },
  {
    id: 5,
    name: "Rota Group",
    logo: "/sponsors/rota-group.svg",
    url: "http://rota-group.ru/",
    tier: "partner",
  },
  {
    id: 6,
    name: "Братство",
    logo: "/sponsors/bratstvo.svg",
    url: "https://bbratstvo.com/",
    tier: "partner",
  },
]

export function Sponsors() {
  return (
    <section className="py-16 md:py-24 border-t">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Наши партнеры
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Мы благодарны нашим партнерам за поддержку и развитие женского футбола
          </p>
        </div>

        {/* Main Sponsors */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground">
            Генеральные партнеры
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsors
              .filter((sponsor) => sponsor.tier === "main")
              .map((sponsor) => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} size="large" />
              ))}
          </div>
        </div>

        {/* Partner Sponsors */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground">
            Официальные партнеры
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {sponsors
              .filter((sponsor) => sponsor.tier === "partner")
              .map((sponsor) => (
                <div key={sponsor.id} className="w-[calc(50%-0.75rem)] sm:w-[calc(33.333%-1rem)] lg:w-[calc(20%-1.2rem)]">
                  <SponsorCard sponsor={sponsor} size="medium" />
                </div>
              ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 md:p-12 bg-gradient-to-br from-[var(--cska-blue)]/5 to-[var(--cska-red)]/5 rounded-lg border">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Станьте партнером ЖФК ЦСКА
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Присоединяйтесь к нашей команде партнеров и поддержите развитие женского футбола в России
            </p>
            <Button asChild size="lg" className="bg-[var(--cska-red)] hover:bg-[var(--cska-red)]/90 button-hover focus-ring">
              <Link href="/club/partners">
                Стать партнером
              </Link>
            </Button>
          </div>
      </Container>
    </section>
  )
}

interface SponsorCardProps {
  sponsor: {
    id: number
    name: string
    logo: string
    url: string
    tier: string
  }
  size: "large" | "medium"
}

function SponsorCard({ sponsor, size }: SponsorCardProps) {
  const heightClass = size === "large" ? "h-32" : "h-24"
  // Устанавливаем фиксированную высоту для логотипов, чтобы все были одинакового размера
  const logoHeight = size === "large" ? "h-16" : "h-12"
  
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block"
    >
      <div
        className={`${heightClass} bg-muted/30 border rounded-lg flex items-center justify-center p-6 card-hover gpu-accelerated`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className={`${logoHeight} w-auto object-contain color-transition group-hover:scale-105 dark:invert`}
            style={{ filter: 'brightness(0) saturate(100%)' }}
          />
        </div>
      </div>
    </a>
  )
}
