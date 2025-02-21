/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: `${process.env.API_URL}`,
        NEXT_PUBLIC_APP_URL: `${process.env.APP_URL}`,
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