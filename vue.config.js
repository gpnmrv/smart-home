const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true,
  
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
        maxSize: 250000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
              return `npm.${packageName.replace('@', '')}`
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },

  chainWebpack: config => {
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|webp|avif)(\?.*)?$/)
      .set('parser', {
        dataUrlCondition: {
          maxSize: 4 * 1024 // 4kb
        }
      })
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096,
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[hash:8].[ext]'
          }
        }
      })

    config.plugin('html').tap(args => {
      args[0].meta = {
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
        'theme-color': '#4CAF50'
      }
      return args
    })
  },

  devServer: {
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  }
})