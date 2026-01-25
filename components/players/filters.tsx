"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const POSITION_LABELS = {
  all: "Все",
  GOALKEEPER: "Вратари",
  DEFENDER: "Защитники",
  MIDFIELDER: "Полузащитники",
  FORWARD: "Нападающие",
} as const

const TEAM_LABELS = {
  all: "Все команды",
  MAIN: "Основа",
  YOUTH: "Молодежка",
  JUNIOR: "Юниоры",
} as const

const SORT_LABELS = {
  number: "По номеру",
  name: "По алфавиту",
} as const

export function PlayersFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const position = searchParams.get("position") || "all"
  const team = searchParams.get("team") || "MAIN" // Default to MAIN squad
  const sort = searchParams.get("sort") || "number"
  const q = searchParams.get("q") || ""

  // Local state for search input
  const [searchValue, setSearchValue] = useState(q)

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Ensure team=MAIN is set by default if no team is specified
    // UNLESS user explicitly selected "all"
    if (!params.has("team") && updates.team !== "all") {
      params.set("team", "MAIN")
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== q) {
        updateFilters({ q: searchValue })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue, q, updateFilters])

  // Sync with URL params
  useEffect(() => {
    setSearchValue(q)
  }, [q])

  // Set default team to MAIN on initial load if no team is specified
  useEffect(() => {
    if (!searchParams.has("team")) {
      updateFilters({ team: "MAIN" })
    }
  }, []) // Run only once on mount

  return (
    <div className="space-y-6">
      {/* Position Tabs */}
      <Tabs
        value={position}
        onValueChange={(value) => updateFilters({ position: value })}
      >
        <TabsList className="w-full grid grid-cols-5 h-auto">
          {Object.entries(POSITION_LABELS).map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="text-xs sm:text-sm">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск по фамилии..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Team Filter */}
        <Select
          value={team}
          onValueChange={(value) => updateFilters({ team: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TEAM_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select
          value={sort}
          onValueChange={(value) => updateFilters({ sort: value })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
