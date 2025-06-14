import "./globals.css";

export const metadata = {
  title: "物品定位系统",
  description: "通过定位来寻找丢失物品",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-full h-screen flex flex-col m-0">{children}</body>
    </html>
  );
}
