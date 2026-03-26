import path from "path";

const nextConfig = {
  output: "standalone",
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;