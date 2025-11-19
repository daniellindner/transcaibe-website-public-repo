import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/getrichquick1",
        destination: "/",
        permanent: true,
      },
      // other redirects...
    ];
  },
  // other configurations...
};
export default withNextIntl(nextConfig);
