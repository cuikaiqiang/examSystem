/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 10:36:02
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-03-10 14:41:16
 * @FilePath: /examSystem/config/config.ts
 * @Description:
 */

import { defineConfig } from 'umi';
import routes from './router';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  sass: {
    implementation: require('node-sass'),
  },
  links: [
    { rel: 'icon', href: './image/desktop.png', type: 'image/x-icon' },
],
  antd: {}, // 组件
  routes: routes, // 路由
  fastRefresh: {},
});
