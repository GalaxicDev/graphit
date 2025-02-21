/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: "http://127.0.0.1:5000/api",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placeholder.pics',
            },
        ],
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;