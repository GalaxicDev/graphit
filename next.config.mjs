/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: "http://127.0.0.1:5000/api",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
    experimental: {
        reactCompiler: true,
      },
};

export default nextConfig;