import "./globals.css";


export const metadata = {
  title: "",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body class="w-full h-full">{children}</body>
    </html>
  );
}
