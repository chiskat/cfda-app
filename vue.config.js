const S3Plugin = require('webpack-s3-plugin')

module.exports = {
  publicPath: 'https://cdn.paperplane.cc/paperplane-cfda/',
  configureWebpack: {
    externals: {
      BMap: 'BMap',
    },
  },
  chainWebpack(config) {
    config.plugin('S3Plugin').use(S3Plugin, [
      {
        exclude: /.*\.html$/,
        basePath: 'paperplane-cfda',
        s3Options: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          region: process.env.S3_REGION,
          endpoint: process.env.S3_ENDPOINT,
          apiVersion: '2006-03-01',
        },
        s3UploadOptions: {
          Bucket: process.env.S3_BUCKET_NAME,
        },
      },
    ])
  },
}
