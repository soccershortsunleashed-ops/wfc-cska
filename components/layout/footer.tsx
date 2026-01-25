import Link from "next/link"
import { Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { FaTelegram, FaVk } from "react-icons/fa"
import { SocialDock } from "@/components/layout/social-dock"

const navigationLinks = [
  {
    title: "Команда",
    links: [
      { label: "Основной состав", href: "/players" },
      { label: "Молодежная команда", href: "/players?team=youth" },
      { label: "Юниорская команда", href: "/players?team=junior" },
    ],
  },
  {
    title: "Клуб",
    links: [
      { label: "О клубе", href: "/club/about" },
      { label: "История", href: "/club/history" },
      { label: "Контакты", href: "/club/contacts" },
      { label: "Партнеры", href: "/club/partners" },
    ],
  },
  {
    title: "Медиа",
    links: [
      { label: "Новости", href: "/news" },
      { label: "Фото", href: "/media/photos" },
      { label: "Видео", href: "/media/videos" },
    ],
  },
  {
    title: "Информация",
    links: [
      { label: "Матчи", href: "/matches" },
      { label: "Турнирная таблица", href: "/standings" },
      { label: "Билеты", href: "/tickets" },
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

const contactInfo = [
  {
    icon: Phone,
    label: "+7 (495) 123-45-67",
    href: "tel:+74951234567",
  },
  {
    icon: Mail,
    label: "info@wfccska.ru",
    href: "mailto:info@wfccska.ru",
  },
  {
    icon: MapPin,
    label: "Москва, ул. Примерная, д. 1",
    href: "https://maps.google.com",
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t gradient-subtle">
      <div className="container px-4 py-12 md:px-6 md:py-16">
        {/* Main Footer Content */}
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
              <img 
                src="/seed-assets/cskaLogo-cska.png" 
                alt="ЖФК ЦСКА" 
                className="h-14 w-14 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none text-white">
                  ЖФК ЦСКА
                </span>
                <span className="text-sm text-white/70 leading-none mt-1">
                  Москва
                </span>
              </div>
            </Link>

            {/* Social Links with Floating Dock */}
            <div className="mt-6">
              <SocialDock />
            </div>
          </div>

          {/* Navigation Links */}
          {navigationLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid gap-6 md:grid-cols-3">
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon
              return (
                <a
                  key={index}
                  href={contact.href}
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center space-x-3 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{contact.label}</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/70 text-center md:text-left">
              © {currentYear} ЖФК ЦСКА. Все права защищены.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Политика конфиденциальности
              </Link>
              <Link
                href="/terms"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Условия использования
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Использование cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
