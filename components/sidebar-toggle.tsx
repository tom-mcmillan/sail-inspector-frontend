// Removed ComponentProps import - not needed for fixed sidebar
// Removed useSidebar - using fixed sidebar layout
// Removed Tooltip - not needed for quick demo

import { SidebarLeftIcon } from './icons';
import { Button } from './ui/button';

export function SidebarToggle() {
  // Fixed sidebar doesn't toggle, but keeping component for compatibility
  const handleClick = () => {
    // No-op for fixed sidebar
  };

  return (
    <Button
      data-testid="sidebar-toggle-button"
      onClick={handleClick}
      variant="outline"
      className="md:px-2 md:h-fit opacity-50 cursor-not-allowed"
      title="Sidebar is always visible"
    >
      <SidebarLeftIcon size={16} />
    </Button>
  );
}
