import { Metadata } from "next"
import Image from "next/image"
import coachingStaffData from "@/seed/coaching-staff.json"

export const metadata: Metadata = {
  title: "Тренерский штаб - ЖФК ЦСКА",
  description:
    "Тренерский штаб женского футбольного клуба ЦСКА Москва. Главный тренер, тренеры и специалисты команды.",
  keywords: [
    "тренерский штаб ЖФК ЦСКА",
    "тренеры ЦСКА",
    "главный тренер ЦСКА",
    "тренерский состав",
  ],
  openGraph: {
    title: "Тренерский штаб - ЖФК ЦСКА",
    description:
      "Тренерский штаб женского футбольного клуба ЦСКА Москва. Главный тренер, тренеры и специалисты команды.",
    url: "https://wfccska.ru/team/coaching-staff",
    siteName: "ЖФК ЦСКА",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

interface Coach {
  name: string
  firstName: string
  lastName: string
  middleName: string
  birthDate: string
  position: string
  photoUrl: string
  photoFilename: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export default function CoachingStaffPage() {
  const coaches = coachingStaffData as Coach[]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Тренерский штаб
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Профессиональная команда тренеров и специалистов ЖФК ЦСКА
            </p>
          </div>
        </div>
      </section>

      {/* Coaching Staff Grid */}
      <section className="container px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {coaches.map((coach) => (
            <div
              key={coach.photoFilename}
              className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            >
              {/* Photo */}
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Image
                  src={`/seed-assets/coaching-staff/${coach.photoFilename}`}
                  alt={coach.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={false}
                  quality={85}
                />
              </div>

              {/* Info */}
              <div className="p-6 space-y-3">
                {/* Position */}
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                  {coach.position}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold leading-tight">
                  {coach.firstName} {coach.lastName}
                </h3>

                {/* Birth Date and Age */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(coach.birthDate)}</span>
                  </div>
                  <div className="text-muted-foreground/70">
                    {calculateAge(coach.birthDate)} лет
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
