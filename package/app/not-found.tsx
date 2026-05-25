import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link href="/">Return home</Link>
    </main>
  );
}
