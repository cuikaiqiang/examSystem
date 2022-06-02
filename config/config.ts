/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 10:36:02
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-05-11 10:46:46
 * @FilePath: /examSystem/config/config.ts
 * @Description:
 */

import { defineConfig } from 'umi';
const webpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
import routes from './router';

const assetDir = 'static';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    sass: {
        implementation: require('node-sass'),
    },
    links: [{ rel: 'icon', href: './image/desktop.png', type: 'image/x-icon' }],
    antd: {}, // 组件
    routes: routes, // 路由
    dynamicImport: {},
    chainWebpack(memo) {
        // 修改js，js chunk文件输出目录
        memo.output
            .filename(assetDir + '/js/[name].[hash:8].js')
            .chunkFilename(assetDir + '/js/[name].[contenthash:8].chunk.js');

        // 修改css输出目录
        memo.plugin('extract-css').tap(() => [
            {
                filename: `${assetDir}/css/[name].[contenthash:8].css`,
                chunkFilename: `${assetDir}/css/[name].[contenthash:8].chunk.css`,
                ignoreOrder: true,
            },
        ]);

        // 修改图片输出目录
        memo.module
            .rule('images')
            .test(/\.(png|jpe?g|gif|webp|ico)(\?.*)?$/)
            .use('url-loader')
            .loader(require.resolve('@umijs/deps/compiled/url-loader'))
            .options({
                name: `${assetDir}/[name].[hash:8].[ext]`,
                // require 图片的时候不用加 .default
                esModule: false,
                fallback: {
                    loader: require.resolve('@umijs/deps/compiled/file-loader'),
                    options: {
                        name: `${assetDir}/images/[name].[hash:8].[ext]`,
                        esModule: false,
                    },
                },
            });
        // new webpackParallelUglifyPlugin({
        //     cacheDir: '.cache/',
        //     test: /.jsx$/,
        //     exclude: [
        //         /Login/
        //     ]
        // })
        // memo.plugin(
        //     new webpackParallelUglifyPlugin({

        //     })
        // )
    },
});
