'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  { value: 'all', label: 'Все новости' },
  { value: 'novosti-osnovy', label: 'Основная команда' },
  { value: 'novosti-dublja', label: 'Молодежная команда' },
  { value: 'club', label: 'Клуб' },
];

const sortOptions = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
];

export function NewsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentSort = searchParams.get('sort') || 'newest';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all' || value === 'newest') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/news?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('/news');
  };

  const hasActiveFilters = currentCategory !== 'all' || currentSort !== 'newest';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Категория:</span>
          <Select value={currentCategory} onValueChange={(value) => updateFilters('category', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Сортировка:</span>
          <Select value={currentSort} onValueChange={(value) => updateFilters('sort', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Сбросить фильтры
        </Button>
      )}
    </div>
  );
}
