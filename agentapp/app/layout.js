import "./globals.css";
import "./styles/supportagent.css";
import { ToastProvider } from "@/context/ToastContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>

 {children}
        </ToastProvider>
       </body>

    </html>
  );
}