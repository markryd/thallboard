import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GITHUB_SPONSORS_URL } from '@/lib/sponsors'

export function TipJarButton() {
  return (
    <Button
      variant="outline"
      size="icon"
      className="sm:h-8 sm:w-auto sm:gap-1.5 sm:px-3"
      asChild
    >
      <a
        href={GITHUB_SPONSORS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Support on GitHub Sponsors"
        title="Support on GitHub Sponsors"
      >
        <Heart className="size-4" />
        <span className="hidden sm:inline">Support</span>
      </a>
    </Button>
  )
}
