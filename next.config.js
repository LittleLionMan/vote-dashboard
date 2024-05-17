/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
};

const nextConfig = {
  env:{
    API_KEY: process.env.API_KEY
  }
}