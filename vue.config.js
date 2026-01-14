module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production'
      ? 'https://cdn.paperplane.cc/paperplane-cfda/'
      : undefined,
  configureWebpack: {
    externals: {
      BMap: 'BMap',
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
