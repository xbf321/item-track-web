import "./globals.css";

export const metadata = {
  title: "物品定位",
  description: "通过定位来寻找丢失物品",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-full h-full">{children}</body>
    </html>
  );
}
