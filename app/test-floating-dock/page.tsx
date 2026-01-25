"use client";

import { SocialDock } from "@/components/layout/social-dock";

export default function TestFloatingDockPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-[var(--cska-blue)]">
            FloatingDock Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Наведите курсор на иконки социальных сетей
          </p>
        </div>

        {/* Demo Section 1 - Center */}
        <div className="mb-24">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Центральное расположение
          </h2>
          <div className="flex justify-center items-center min-h-[200px]">
            <SocialDock />
          </div>
        </div>

        {/* Demo Section 2 - With Background */}
        <div className="mb-24">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            На цветном фоне
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-12 shadow-xl">
            <div className="flex justify-center items-center">
              <SocialDock />
            </div>
          </div>
        </div>

        {/* Demo Section 3 - Multiple Instances */}
        <div className="mb-24">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Несколько экземпляров
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-neutral-900 rounded-2xl p-8">
              <h3 className="text-lg font-medium mb-6 text-center">Вариант 1</h3>
              <div className="flex justify-center">
                <SocialDock />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950 dark:to-neutral-900 rounded-2xl p-8">
              <h3 className="text-lg font-medium mb-6 text-center">Вариант 2</h3>
              <div className="flex justify-center">
                <SocialDock />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Как это работает?</h2>
          <div className="space-y-4 text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🖱️</span>
              <div>
                <strong className="text-foreground">Наведите курсор</strong>
                <p>Иконки плавно увеличиваются при приближении мыши</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong className="text-foreground">Подсказки</strong>
                <p>При наведении появляется название социальной сети</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <strong className="text-foreground">Фирменные цвета</strong>
                <p>Иконки окрашены в цвета ЦСКА (синий и красный)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <strong className="text-foreground">Адаптивность</strong>
                <p>На мобильных устройствах - компактная кнопка с меню</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p>Компонент основан на Aceternity UI</p>
          <p className="mt-2">Адаптирован для ЖФК ЦСКА</p>
        </div>
      </div>
    </div>
  );
}
