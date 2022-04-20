/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 09:24:26
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-18 10:25:31
 * @FilePath: /examSystem/src/network/dataServer.js
 * @Description:
 */
import axios from 'axios';
import { history } from 'umi';
import { message } from 'antd'

// 请求返回后的数据进行处理
axios.interceptors.response.use(
    (response) => {
        let resData = response.data ?? ''; // 获取请求成功返回参数
        // 如果返回数据存在并且是字符串类型 则将其转换为对象类型的
        if(resData && typeof resData == 'string'){
            try {
                resData = JSON.parse(resData);
            } catch (error) {}
        }
        return Promise.resolve(resData);
    },
    (error) => {
        return Promise.reject(error.response);
    }
);
// 获取请求接口的通用配置
const getConfig = () => {
    return {
        baseURL: baseURL, //请求IP地址
        headers: {'Content-Type': 'application/json;charset=utf-8'}, // 自定义请求头
        timeout: '0',// 请求超时时间 0为不限制请求时间
        // withCredentials: true, // 表示跨域请求时是否需要凭证
        responseType: 'json', // 表示服务器响应类型
        data: {}, // 作为请求主体被发送数据 仅适用于 PUT、POST、PATCH
        params: {}, // 与URL一块发送的数据
        transformRequest: function(data){ // 请求前可以修改的数据
            // 判断是否为上传文件
            if (Object.prototype.toString.call(data) !== '[object FormData]') {
                return JSON.stringify(data);
            }else{
                return data;
            }
        },
        transformResponse: function(data){ // 请求返回数据
            return data;
        }
    }
}

/**
 * post请求方式
 * @param {请求地址} reqUrl
 * @param {请求参数} reqData
 * @param {返回参数} responseParams
 */
const postData = (reqUrl, reqData = {}, responseParams = []) => {
    return requestDataFun('post', reqUrl, reqData, responseParams);
}

/**
 * get请求方式
 * @param {请求地址} reqUrl
 * @param {请求参数} reqData
 * @param {返回参数} responseParams
 */
const getData = (reqUrl, reqData = {}, responseParams = []) => {
    return requestDataFun('get', reqUrl, reqData, responseParams);
}

/**
 * 请求参数地址相关
 * @param {请求类型} method
 * @param {请求地址} reqUrl
 * @param {请求参数} reqData
 * @returns 请求相关配置
 */
const requestDataBefore = (method, reqUrl, reqData,) => {
    let config = getConfig();
    config.method = method; // 赋值请求方式
    config.url = reqUrl;
    // 判断缓存中是否存在token
    if(localStorage.getItem('token')){
        // config.headers['token'] = localStorage.getItem('token');
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
    }
    // 判断是否为post类型的请求方式 请求传递的参数不同
    if(['post', 'put'].includes(method)){
        config.data = reqData;
        config.params = {};
    }else{
        config.params = reqData;
        config.data = {};
    }
    return config;
}

/**
 * 请求数据的统一方法
 * @param {请求类型} method
 * @param {请求地址} reqUrl
 * @param {请求参数} reqData
 * @param {请求返回的参数} responseParams
 * @returns 异步promise
 */
const requestDataFun = (method, reqUrl, reqData, responseParams) => {
    return new Promise((resolve, reject) => {
        // 获取请求参数、地址等
        let configData = requestDataBefore(method, reqUrl, reqData,);
        axios.request(configData).then((response) => {
            if(response){
                let code = response.code; // 获取返回参数code
                // 请求成功返回请求返回的参数
                if(code === 0 || code === 200){
                    resolve(response.data);
                }else{
                    if(code === 4002){
                        localStorage.clear();
                        history.push('/')
                    }
                    message.error(response.msg)
                }
            }else{
                reject('服务器出现错误')
            }
        }).catch((err) => {
            reject(err);
        })
    })
}

const baseURL = 'http://192.168.1.66:8888/';
// const baseURL = 'http://192.168.1.17:8880/';

export default{
    baseURL,
    postData,
    getData
}
