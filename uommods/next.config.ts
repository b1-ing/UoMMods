import type { NextConfig } from "next";

const config = {

    experimental: {
        serverActions: true,
        asyncParams: true,
    },
    reactStrictMode: true,
};
export default config;
