/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 11:13:40
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-05-11 16:17:32
 * @FilePath: /examSystem/src/Login.jsx
 * @Description:
 */
import React from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import '@/scss/login.scss';
import { postExamLogin } from './network/requestFunction';
const MyIcon = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_2864115_ysift6zlra.js',
});

window.logonExternalFun = function (data) {
    let flutterJavaScript = window.flutterJavaScript || '';
    if (flutterJavaScript) {
        flutterJavaScript.login(data).then((res) => {
            console.log('我调用了');
        });
    }
};

class Login extends React.Component {
    // 配置传递参数的默认值
    static defaultProps = {};
    constructor(props) {
        super(props);
        this.state = {
            userName: '小小强',
        };
    }
    componentDidMount() {
        window.flutterJavaScript = this;
    }

    /** 方法 */
    /**
     * 登录
     * @param {登录需要的参数} values
     */
    login = async (values) => {
        // let returnData = JSON.parse(values);
        message.success(values.data.name);
        // this.setState({
        //     userName: values
        // })
        let TransmitDataTwo = window.TransmitDataTwo || '';
        if (TransmitDataTwo) {
            TransmitDataTwo.postMessage(values);
        }
        // console.log(123456)
        // let loginData = await postExamLogin(values);
        // localStorage.setItem('token', loginData.token);
        // localStorage.setItem('userData', JSON.stringify(loginData.user));
        // localStorage.setItem('isLogin', true);
        // this.props.changeLoginType(true);
        // this.props.changeUserDataFun(loginData.user);
        // history.push('/');
    };

    /**
     * 表单验证失败方法
     * @param {错误信息} errorInfo
     */
    loginError = (errorInfo) => {
        let JavaScriptScanCodes = window.JavaScriptScanCodes || '';
        if (JavaScriptScanCodes) {
            JavaScriptScanCodes.postMessage('JS调用了Flutter');
        }
        message.error('用户名和密码不能为空');
    };
    render() {
        return (
            <div className="loginPage">
                <div className="loginArea">
                    <Form
                        wrapperCol={{ span: 24 }}
                        onFinish={this.login}
                        onFinishFailed={this.loginError}
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                { required: true, message: '请输入用户名' },
                            ]}
                        >
                            <Input
                                placeholder="请输入用户名"
                                prefix={
                                    <MyIcon
                                        style={{ fontSize: 18 }}
                                        type="icon-scan"
                                    ></MyIcon>
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: '请输入用密码' },
                            ]}
                        >
                            <Input.Password
                                placeholder="请输入密码"
                                prefix={
                                    <MyIcon
                                        style={{ fontSize: 18 }}
                                        type="icon-scan"
                                    ></MyIcon>
                                }
                            />
                        </Form.Item>
                        <Form.Item name="remember" valuePropName="checked">
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>
                        <Form.Item wrapperCol={{ span: 24 }}>
                            <Button
                                size="large"
                                type="primary"
                                htmlType="submit"
                            >
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                    <span>{this.state.userName}</span>
                    <Button
                        size="large"
                        type="primary"
                        onClick={logonExternalFun}
                    >
                        点一下
                    </Button>
                </div>
            </div>
        );
    }
}
export default connect(
    (state) => {
        return {};
    },
    (dispatch) => {
        // 更新全局公用数据的方法
        return {
            changeLoginType: (payload) =>
                dispatch({ type: 'loginData/changeLogin', payload }),
            changeUserDataFun: (payload) =>
                dispatch({ type: 'loginData/changeUserData', payload }),
        };
    },
)(Login);
