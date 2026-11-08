export const metadata = { title: "SupBunker", description: "ISTEM Cyber Platform" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui", margin: 0, padding: 16 }}>{children}</body>
    </html>
  );
}
