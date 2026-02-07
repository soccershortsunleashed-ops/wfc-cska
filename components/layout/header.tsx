"use client"

import Link from "next/link"
import { Menu, Youtube, Twitter } from "lucide-react"
import { FaTelegram, FaVk } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { SocialDock } from "@/components/layout/social-dock"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Главная",
    href: "/",
  },
  {
    title: "Команда",
    href: "/players",
    items: [
      {
        title: "Основной состав",
        href: "/players",
        description: "Игроки основной команды",
      },
      {
        title: "Молодежная команда",
        href: "/players?team=youth",
        description: "Молодежный состав",
      },
      {
        title: "Юниорская команда",
        href: "/players?team=junior",
        description: "Юниорский состав",
      },
      {
        title: "Тренерский штаб",
        href: "/team/coaching-staff",
        description: "Тренеры и специалисты",
      },
    ],
  },
  {
    title: "Матчи",
    href: "/matches",
    items: [
      {
        title: "Расписание и результаты",
        href: "/matches",
        description: "Все матчи команды",
      },
      {
        title: "Турнирная таблица",
        href: "/standings",
        description: "Положение в турнирах",
      },
    ],
  },
  {
    title: "Новости",
    href: "/news",
  },
  {
    title: "Медиа",
    href: "/media",
    items: [
      {
        title: "Фото",
        href: "/media/photos",
        description: "Фотогалерея клуба",
      },
      {
        title: "Видео",
        href: "/media/videos",
        description: "Видеоматериалы",
      },
    ],
  },
  {
    title: "Клуб",
    href: "/club",
    items: [
      {
        title: "О клубе",
        href: "/club/about",
        description: "История и достижения",
      },
      {
        title: "Контакты",
        href: "/club/contacts",
        description: "Контактная информация",
      },
      {
        title: "Партнеры",
        href: "/club/partners",
        description: "Наши партнеры",
      },
    ],
  },
]

const socialLinks = [
  {
    name: "VK",
    href: "https://vk.com/wfccska",
    icon: FaVk,
    ariaLabel: "Мы в VK",
  },
  {
    name: "Twitter",
    href: "https://twitter.com/wfccska",
    icon: Twitter,
    ariaLabel: "Мы в Twitter",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCToNhi_LVB-cQzDZCLgl57Q",
    icon: Youtube,
    ariaLabel: "Наш YouTube канал",
  },
  {
    name: "Telegram",
    href: "https://t.me/wfc_cska",
    icon: FaTelegram,
    ariaLabel: "Мы в Telegram",
  },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b gradient-subtle shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img 
            src="/seed-assets/cskaLogo-cska.png" 
            alt="ЖФК ЦСКА" 
            className="h-12 w-12 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold leading-none text-white">
              ЖФК ЦСКА
            </span>
            <span className="text-xs text-white/70 leading-none mt-1">
              Москва
            </span>
          </div>
        </Link>

        {/* Desktop Navigation and Social Links */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="[&_button]:text-white [&_button]:hover:bg-white/10 [&_button]:data-[state=open]:bg-white/10 [&_a]:text-white [&_a]:hover:bg-white/10">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.items ? (
                    <>
                      <NavigationMenuTrigger className="bg-transparent hover:bg-white/10 data-[state=open]:bg-white/10 text-white">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-[#0033A0] border-white/20">
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                          {item.items.map((subItem) => (
                            <li key={subItem.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 text-white"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {subItem.title}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-white/70">
                                    {subItem.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/10 text-white")}>
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Social Links with Floating Dock */}
          <div className="border-l pl-6">
            <SocialDock />
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Открыть меню">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Меню</SheetTitle>
              <SheetDescription>
                Навигация по сайту ЖФК ЦСКА
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-6 pl-2">
              {navigationItems.map((item) => (
                <div key={item.href} className="space-y-2">
                  <Link
                    href={item.href}
                    className="block text-lg font-medium hover:text-[var(--cska-blue)] transition-colors"
                  >
                    {item.title}
                  </Link>
                  {item.items && (
                    <div className="ml-6 space-y-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Social Links in Mobile Menu */}
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm font-medium mb-4 pl-2">Мы в социальных сетях</p>
              <div className="flex items-center gap-3 pl-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-[var(--cska-blue)] hover:text-white transition-colors"
                      aria-label={social.ariaLabel}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
