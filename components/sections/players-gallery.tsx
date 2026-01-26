'use client';

import React from 'react';
import { CircularGallery, GalleryItem } from '@/components/ui/circular-gallery';

interface Player {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  number: number | null;
  position: string;
  photoUrl: string | null;
}

interface PlayersGalleryProps {
  players: Player[];
}

export function PlayersGallery({ players }: PlayersGalleryProps) {
  // Преобразуем данные игроков в формат для галереи
  const galleryItems: GalleryItem[] = players.map(player => ({
    common: `${player.firstName} ${player.lastName}`,
    binomial: player.position,
    photo: {
      url: player.photoUrl || '/placeholder.svg',
      text: `${player.firstName} ${player.lastName} - ${player.position}`,
      pos: '50% 20%',
      by: 'ЖФК ЦСКА'
    }
  }));

  return (
    // Outer container provides scrollable height for scroll-based rotation
    <section className="w-full bg-gradient-to-b from-background via-[var(--cska-blue)]/5 to-background">
      <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
        {/* Header - поднят выше */}
        <div className="text-center mb-8 absolute top-8 z-10 px-4">
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
            items={galleryItems} 
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
