'use client';

import React from 'react';
import { CircularGallery, GalleryItem } from '@/components/ui/circular-gallery';

// Данные игроков для галереи (топ-10 игроков команды)
const playersGalleryData: GalleryItem[] = [
  {
    common: 'Юлия Плешкова',
    binomial: 'Капитан команды',
    photo: {
      url: '/seed-assets/players/pleshkova-yuliya-aleksandrovna.jpg',
      text: 'Юлия Плешкова - капитан ЖФК ЦСКА',
      pos: '50% 20%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Алина Сапронова',
    binomial: 'Нападающая',
    photo: {
      url: '/seed-assets/players/sapronova-alina-aleksandrovna.jpg',
      text: 'Алина Сапронова - нападающая ЖФК ЦСКА',
      pos: '50% 30%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Виктория Корниенко',
    binomial: 'Защитница',
    photo: {
      url: '/seed-assets/players/kornienko-viktoriya-aleksandrovna.jpg',
      text: 'Виктория Корниенко - защитница ЖФК ЦСКА',
      pos: '50% 25%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Елизавета Шкиндер',
    binomial: 'Полузащитница',
    photo: {
      url: '/seed-assets/players/shkinder-elizaveta-aleksandrovna.jpg',
      text: 'Елизавета Шкиндер - полузащитница ЖФК ЦСКА',
      pos: '50% 20%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Мария Фадеева',
    binomial: 'Вратарь',
    photo: {
      url: '/seed-assets/players/fadeeva-mariya-aleksandrovna.jpg',
      text: 'Мария Фадеева - вратарь ЖФК ЦСКА',
      pos: '50% 15%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Анастасия Шевченко',
    binomial: 'Нападающая',
    photo: {
      url: '/seed-assets/players/shevchenko-anastasiya-aleksandrovna.jpg',
      text: 'Анастасия Шевченко - нападающая ЖФК ЦСКА',
      pos: '50% 25%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Дарья Чернышова',
    binomial: 'Полузащитница',
    photo: {
      url: '/seed-assets/players/chernyshova-darya-aleksandrovna.jpg',
      text: 'Дарья Чернышова - полузащитница ЖФК ЦСКА',
      pos: '50% 20%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Екатерина Панюкова',
    binomial: 'Защитница',
    photo: {
      url: '/seed-assets/players/panyukova-ekaterina-aleksandrovna.jpg',
      text: 'Екатерина Панюкова - защитница ЖФК ЦСКА',
      pos: '50% 25%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Ксения Коваленко',
    binomial: 'Полузащитница',
    photo: {
      url: '/seed-assets/players/kovalenko-kseniya-aleksandrovna.jpg',
      text: 'Ксения Коваленко - полузащитница ЖФК ЦСКА',
      pos: '50% 20%',
      by: 'ЖФК ЦСКА'
    }
  },
  {
    common: 'Анна Белова',
    binomial: 'Нападающая',
    photo: {
      url: '/seed-assets/players/belova-anna-aleksandrovna.jpg',
      text: 'Анна Белова - нападающая ЖФК ЦСКА',
      pos: '50% 30%',
      by: 'ЖФК ЦСКА'
    }
  },
];

export function PlayersGallery() {
  return (
    // Outer container provides scrollable height for scroll-based rotation
    <section className="w-full bg-gradient-to-b from-background via-[var(--cska-blue)]/5 to-background">
      <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8 absolute top-16 z-10 px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--cska-blue)] to-[var(--cska-red)] bg-clip-text text-transparent">
            Наши звёзды
          </h2>
          <p className="text-muted-foreground text-lg">
            Прокрутите страницу, чтобы увидеть всех игроков
          </p>
        </div>

        {/* 3D Circular Gallery */}
        <div className="w-full h-full">
          <CircularGallery 
            items={playersGalleryData} 
            radius={500}
            autoRotateSpeed={0.015}
          />
        </div>

        {/* Footer hint */}
        <div className="absolute bottom-8 text-center text-sm text-muted-foreground">
          <p>Продолжайте прокручивать ↓</p>
        </div>
      </div>
    </section>
  );
}
