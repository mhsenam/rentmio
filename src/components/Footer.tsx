import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-10 bg-background">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-4 text-center md:text-left">
        <div>
          <h3 className="font-bold text-xl mb-4">RentMe</h3>
          <p className="text-muted-foreground">
            Find and book accommodations worldwide
          </p>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-4 font-mono">EXPLORE</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/search"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Search Properties
              </Link>
            </li>
            <li>
              <Link
                href="/properties/add"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                List Property
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-4 font-mono">COMPANY</h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </li>
            {/* <li>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </li> */}
            {/* <li>
              <Link
                href="/careers"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Careers
              </Link>
            </li> */}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-4 font-mono">LEGAL</h4>
          <ul className="space-y-3">
            {/* <li>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
            </li> */}
            {/* <li>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </li> */}
          </ul>
        </div>
      </div>
      <div className="container mt-8 pt-8 border-t">
        <p className="text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} RentMe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
