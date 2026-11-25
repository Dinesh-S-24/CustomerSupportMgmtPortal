import "./globals.css";
import "./styles/supportagent.css";
import Script from "next/script";
import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="csms-theme-init" strategy="beforeInteractive">
          {`try { if (localStorage.getItem("csms-theme") === "dark") document.documentElement.dataset.theme = "dark"; } catch (_) {}`}
        </Script>
      </head>
      <body>
        <ToastProvider>

 {children}
        </ToastProvider>
       </body>

    </html>
  );
}
