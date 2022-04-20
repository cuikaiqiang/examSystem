/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 11:09:25
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-03-31 09:11:40
 * @FilePath: /examSystem/config/router.ts
 * @Description:
 */

export default [
    { exact: true, title: '登录', path: '/login', component: '@/login.jsx'},
    {
        path: '/',
        component: '@/main.jsx',
        // redirect: '/home',
        routes: [
            {path: '/home', component: '@/pages/home.jsx'},
            {path: '/examManage/:type', component: '@/pages/examManage.jsx'},
            {path: '/paperManage', component: '@/pages/paperManage.jsx'},
            {path: '/questionsManage', component: '@/pages/questionsManage.jsx'},
        ]
    },
]
