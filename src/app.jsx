/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 15:08:52
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-03-10 14:38:49
 * @FilePath: /examSystem/src/app.jsx
 * @Description:
 */
import { history } from 'umi';

// 重写react 渲染页面的render方法
export function render(oldRender) {
    oldRender();
}
// 初始化或者切换路由时调用的方法
export function onRouteChange({ location, routes, action }) {}
