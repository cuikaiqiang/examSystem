/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-07 09:52:22
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 17:40:00
 * @FilePath: /examSystem/src/main.jsx
 * @Description:
 */
import React from "react";
import { history, Link, } from 'umi';
import { connect } from 'dva';
import zhCN from 'antd/lib/locale/zh_CN';
import { ConfigProvider, Layout, Menu, } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, } from '@ant-design/icons';
import logoBig from '@/assets/images/logo.png';
import logoSmall from '@/assets/images/logo_small.png';
import '@/scss/main.scss';

class App extends React.Component{
    // 配置传递参数的默认值
    static defaultProps = {}
    constructor(props){
        super(props);
        this.state = {
            collapsed: false,
            menuList: [], // 菜单列表
            menuSelectKey: '', // 选中的菜单
            menuOpenKeys: [], // 展开的菜单
        }
    }
    componentDidMount(){
        let isLogin = localStorage.getItem('isLogin'); // 获取登录状态
        // 如果没有登录则跳转登录页面
        if(!isLogin) history.push('/login');
        let pathname = this.props.location.pathname;
        if(pathname == '/') history.push('/home')
        // 声明并获取菜单数据
        let menu = [
            {name: '首页', path: '/home', key: 'home'},
            {name: '考试管理', key: 'examManage', children: [
                {name: '每周答题', path: '/examManage/1', key: 'examManage1'},
                {name: '专项答题', path: '/examManage/2', key: 'examManage2'},
                {name: '集中抽考', path: '/examManage/3', key: 'examManage3'},
                {name: '资格考试', path: '/examManage/4', key: 'examManage4'},
                {name: '技能认证考试', path: '/examManage/10', key: 'examManage10'},
                {name: '自动分发考试', path: '/examManage/9', key: 'examManage9'},
                {name: '入场资格考试', path: '/examManage/7', key: 'examManage5'},
                {name: '职业技能考试', path: '/examManage/8', key: 'examManage6'},
            ]},
            {name: '试卷管理', key: 'paperManage', path: '/paperManage' },
            {name: '试题管理', key: 'questionsManage', path: '/questionsManage' },
        ]
        let menuSelectData = this.initMenuSelect(menu);
        this.setState({
            menuList: menu,
            menuSelectKey: menuSelectData.menuSelect || '',
            menuOpenKeys: menuSelectData.menuOpen.flat(Infinity)
        })
    }

    /** 方法 */
    /**
     * 初始化菜单展开和选中
     * @param {菜单列表} menu
     * @returns 展开的菜单
     */
    initMenuSelect = (menu) => {
        let pathname = this.props.location.pathname; // 获取当前路由
        // 循环全部的菜单数据
        for(let i = 0; i < menu.length; i++){
            let menuItem = menu[i], // 获取当前循环的数据
                menuOpen = []; // 声明打展开的菜单key
            // 判断当前菜单是否存在下级
            if(menuItem.children){
                // 将当前菜单的key添加到展开显示的菜单key下
                menuOpen.push(menuItem.key);
                // 获取当前菜单的子菜单中展开和选中的key
                let retMenu = this.initMenuSelect(menuItem.children);
                // 判断当前菜单的子菜单是否已经被选中了 如果被选中了则将当前值和已经展开的菜单key返回
                if(retMenu.menuSelect){
                    menuOpen.push(retMenu.menuOpen);
                    return {menuSelect: retMenu.menuSelect, menuOpen}
                }
            // 判断当前菜单的路由是否为当前显示的路由 如果是在将当期菜单的key和已经展开的数据返回
            }else if(menu[i].path == pathname){
                return {menuSelect:menuItem.key, menuOpen}
            }
        }
        return {menuOpen: []};
    }

    /**
     * 收起展开左侧菜单栏
     */
    changeCollapsed = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        })
    }

    /**
     * 菜单选中数据
     * @param {选中的菜单key} param0
     */
    onMenuSelect = ({key}) => {
        this.setState({
            menuSelectKey: key
        })
    }

    /**
     * 菜单展开方法
     * @param {菜单展开的key} openKeys
     */
    onOpenChange = (openKeys) => {
        this.setState({
            menuOpenKeys: openKeys
        })
    }

    /** 组件 */
    // 菜单组件
    menuWidget = (item) => {
        let menuWidget = []; // 声明菜单列表
        // 循环全部的菜单数据生成对用的菜单
        for(let i = 0; i < item.length; i++){
            // 生成当前正在循环的菜单数据
            let menuSon = item[i],
                menuItem = '';
            if(menuSon.children){
                menuItem = <Menu.SubMenu title={menuSon.name} key={menuSon.key}>
                    {this.menuWidget(menuSon.children)}
                </Menu.SubMenu>
            }else{
                menuItem = <Menu.Item title={menuSon.name} key={menuSon.key}><Link to={menuSon.path}>{menuSon.name}</Link></Menu.Item>
            }
            menuWidget.push(menuItem)
        }
        return menuWidget;
    }
    render(){
        return (
            <ConfigProvider locale={zhCN}>
                <Layout className="mainArea" style={{ height: '100%' }}>
                    <Layout.Sider collapsible collapsed={this.state.collapsed} trigger={null}>
                        <div className="mainLogo"><img src={this.state.collapsed ? logoSmall : logoBig} /></div>
                        <Menu selectedKeys={this.state.meunSelectKey}
                            openKeys={this.state.menuOpenKeys}
                            onSelect={this.onMenuSelect}
                            onOpenChange={this.onOpenChange}
                            theme="dark" mode="inline">{this.menuWidget(this.state.menuList)}</Menu>
                    </Layout.Sider>
                    <Layout className="site-layout">
                        <Layout.Header className="mainHeader">
                            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, { className: 'collapsedIcon', onClick: this.changeCollapsed, })}
                        </Layout.Header>
                        <Layout.Content>{this.props.children}</Layout.Content>
                    </Layout>
                </Layout>
            </ConfigProvider>
        )
    }
}

export default connect(
    (state) => {
        return { userData: state.loginData.userData }
    }
)(App)
