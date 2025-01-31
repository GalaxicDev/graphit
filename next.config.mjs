/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: "http://localhost:5000/api",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
};

export default nextConfig;