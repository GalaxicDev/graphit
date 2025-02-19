import "@/app/globals.css";
import { UserProvider, useUser } from '@/lib/UserContext';

export const metadata = {
  title: "Graphity - The next generation of data visualization",
  description: "Graphity is a data visualization tool that allows you to create and share interactive graphs and charts.",
};

export default async function RootLayout({ children }) {


  return (
      <UserProvider>
        <html lang="en">
        <head>
            { /* <script src="//unpkg.com/react-scan/dist/auto.global.js"/> */ }
            {/* rest of your scripts go under */}
        </head>
          <body
              /* className={`${geistSans.variable} ${geistMono.variable} antialiased`} */
          >
            {children}
          </body>
        </html>
      </UserProvider>
  );
}
