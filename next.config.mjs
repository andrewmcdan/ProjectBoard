// Standalone output keeps the production Docker image smaller.
const nextConfig = {
    output: "standalone",
    allowedDevOrigins: ["10.0.6.37"],
};

export default nextConfig;
