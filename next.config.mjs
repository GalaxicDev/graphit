/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_URL: `${process.env.API_URL}`,
        NEXT_PUBLIC_APP_URL: `${process.env.APP_URL}`,
        PFP_SRC: `${process.env.PFP_SRC}`,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
        ],
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;