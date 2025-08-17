// src/app/layout.jsx
import './globals.css';

export const metadata = {
  title: 'Malhar E-Card',
  description: 'Foldable e-card with golden starfield',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
