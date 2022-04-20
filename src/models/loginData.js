/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 15:56:27
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-03-10 14:39:27
 * @FilePath: /examSystem/src/models/loginData.js
 * @Description:
 */
const getUserData = () => {
    let userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return userData
}

export default {
    namespace: 'loginData',
    state: { // 变量
        isLogin: false,
        token: '',
        userData: getUserData(),
    },
    effects: { // 异步方法

    },
    reducers: { // 修改数据的具体方法
        changeLogin(state, { payload }){
            return Object.assign({}, state, {
                isLogin: payload
            });
        },
        changeUserData(state, { payload }){
            return Object.assign({}, state, {
                userData: payload
            })
        }
    },
}
