export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: "Malhar E-Cardolate",
  description: "Cardolates for those who are losers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#070b12" }}>{children}</body>
    </html>
  );
}
