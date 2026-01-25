import { Container } from "./container";
import { FrameMarker } from "./frame-marker";
import { Logo } from "./ui/logo";
import { ModeToggle } from "./ui/theme-toggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-dashed border-border/40">
      <Container>
        <div className="flex items-center justify-between px-4 md:px-8 py-4 relative group bg-background/80">
          <Logo />

          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>

          <FrameMarker />
        </div>
      </Container>
    </nav>
  );
}