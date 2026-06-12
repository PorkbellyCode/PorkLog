import VisitorCounter from "@/components/visitor-counter";

export default function Footer() {
  return (
    <footer className="border-t border-border-default">
      <div className="flex flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-fg-muted sm:flex-row">
        <p>© {new Date().getFullYear()} PorkLog</p>
        <VisitorCounter />
      </div>
    </footer>
  );
}