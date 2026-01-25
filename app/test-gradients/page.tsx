import Link from 'next/link'

export default function TestGradientsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Назад на главную
        </Link>
      </div>

      {/* Hero Section with Gradient */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-hero" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
            ЖФК ЦСКА
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Демонстрация градиентов в стиле ФК "Локомотив"
          </p>
          <button className="gradient-button text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl transition-all">
            Купить билет
          </button>
        </div>
      </section>

      {/* Gradient Examples */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
            Примеры градиентов
          </h2>

          {/* Grid of Gradient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Hero Gradient */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="gradient-hero h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Hero Gradient</h3>
                  <p className="text-sm text-white/80">Синий → Красный</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <code className="text-xs">gradient-hero</code>
              </div>
            </div>

            {/* Subtle Gradient */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="gradient-subtle h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Subtle Gradient</h3>
                  <p className="text-sm text-white/80">Темно-синий → Синий</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <code className="text-xs">gradient-subtle</code>
              </div>
            </div>

            {/* Button Gradient */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="gradient-button h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Button Gradient</h3>
                  <p className="text-sm text-white/80">Красный → Темно-красный</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <code className="text-xs">gradient-button</code>
              </div>
            </div>

            {/* Accent Gradient */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="gradient-accent h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Accent Gradient</h3>
                  <p className="text-sm text-white/80">Красный → Синий</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <code className="text-xs">gradient-accent</code>
              </div>
            </div>

            {/* Hover Gradient */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="gradient-hover h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Hover Gradient</h3>
                  <p className="text-sm text-white/80">Синий → Светло-синий</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <code className="text-xs">gradient-hover</code>
              </div>
            </div>

            {/* Animated Gradient */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="gradient-animated h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Animated</h3>
                  <p className="text-sm text-white/80">Анимированный градиент</p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <code className="text-xs">gradient-animated</code>
              </div>
            </div>
          </div>

          {/* Text Gradient Example */}
          <div className="text-center mb-16">
            <h2 className="text-6xl font-bold gradient-text mb-4">
              Градиентный текст
            </h2>
            <p className="text-muted-foreground">
              Используйте класс <code className="px-2 py-1 bg-muted rounded">gradient-text</code>
            </p>
          </div>

          {/* Card with Gradient Overlay */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Карточка с градиентным overlay</h3>
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              {/* Background Image Placeholder */}
              <div className="h-96 bg-gray-300" />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 gradient-overlay" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <span className="inline-block px-3 py-1 bg-[#E4002B] rounded-full text-sm mb-3">
                  Новости
                </span>
                <h3 className="text-3xl font-bold mb-2">
                  Победа в чемпионате
                </h3>
                <p className="text-white/90 text-lg">
                  ЖФК ЦСКА одержал уверенную победу со счетом 3:0
                </p>
              </div>
            </div>
          </div>

          {/* Buttons with Gradients */}
          <div className="text-center mb-16">
            <h3 className="text-2xl font-bold mb-6">Кнопки с градиентами</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="gradient-button text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Primary Button
              </button>
              <button className="gradient-hero text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Hero Button
              </button>
              <button className="gradient-accent text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Accent Button
              </button>
            </div>
          </div>

          {/* Stats Cards with Gradients */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Статистика с градиентами</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-xl p-8 gradient-hero text-white shadow-lg hover:shadow-2xl transition-all">
                <div className="text-5xl font-bold mb-2">24</div>
                <div className="text-xl">Побед</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              </div>
              
              <div className="relative overflow-hidden rounded-xl p-8 gradient-button text-white shadow-lg hover:shadow-2xl transition-all">
                <div className="text-5xl font-bold mb-2">68</div>
                <div className="text-xl">Голов</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              </div>
              
              <div className="relative overflow-hidden rounded-xl p-8 gradient-accent text-white shadow-lg hover:shadow-2xl transition-all">
                <div className="text-5xl font-bold mb-2">1</div>
                <div className="text-xl">Место</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              </div>
            </div>
          </div>

          {/* Gradient Border Example */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Градиентная рамка</h3>
            <div className="max-w-md mx-auto gradient-border rounded-xl p-8">
              <h4 className="text-xl font-bold mb-2">Карточка с градиентной рамкой</h4>
              <p className="text-muted-foreground">
                Используйте класс <code className="px-2 py-1 bg-muted rounded">gradient-border</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Примеры кода</h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Gradient */}
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Hero секция с градиентом</h3>
              <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
{`<div className="gradient-hero min-h-screen flex items-center justify-center">
  <div className="text-center text-white">
    <h1 className="text-6xl font-bold">ЖФК ЦСКА</h1>
    <button className="gradient-button px-8 py-4 rounded-lg">
      Купить билет
    </button>
  </div>
</div>`}
              </pre>
            </div>

            {/* Gradient Text */}
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Градиентный текст</h3>
              <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
{`<h1 className="text-6xl font-bold gradient-text">
  ЖФК ЦСКА
</h1>`}
              </pre>
            </div>

            {/* Card with Overlay */}
            <div className="bg-card rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Карточка с overlay</h3>
              <pre className="bg-muted p-4 rounded overflow-x-auto text-sm">
{`<div className="relative rounded-xl overflow-hidden">
  <img src="/image.jpg" />
  <div className="absolute inset-0 gradient-overlay" />
  <div className="absolute bottom-0 p-6 text-white">
    <h3>Заголовок</h3>
  </div>
</div>`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
