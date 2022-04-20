/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 16:19:46
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 16:51:46
 * @FilePath: /examSystem/src/pages/PaperManage.jsx
 * @Description:
 */

import React from "react";
import { Table, Modal, Space, Button, message } from "antd";
import { PlusCircleOutlined } from '@ant-design/icons';
import TableData from "../component/TableData";
import TableSearchHeader from "../component/TableSearchHeader";
import CommonModal from "../component/CommonModal";
import { getPaperPageList } from "../network/requestFunction";
import '../scss/paperManage.scss';
import dataServer from "../network/dataServer";
import { copyPaperPort, deletePaperPort } from "../network/dataServerUrl";
import AddEditPaper from "./AddEditPaper";

class PaperManage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            searchList: [
                {type: 'input', key: 'name', placeholder: '请输入考试名称'}
            ], // 搜索数据
            searchData: {}, // 点击搜索的数据
            page: 1, // 当前页数
            limit: 10, // 每页多少条数据
            tableList: [], // 列表数据
            tableListAll: 0, // 总共有多少条数据
            searchBtnList: [
                {name: '创建试卷', icon: <PlusCircleOutlined />, bgColor: '#59BCE8', fun: this.addEditPaper.bind(this, 'create')},
            ],
            /** 弹窗数据 */
            popupData: {}, // 当前操作的数据是哪个
            popupType: '', // 弹窗中显示的内容
            popupVisible: false, // 是否显示弹窗 (copyPaper：复制试卷、createPaper：创建试卷)
            popupTitle: '', // 弹窗显示的标题
            popupModalList: [], // 弹窗中显示的列表数据
            popupModalData: {}, // 弹窗中显示的列表数据选择的数据
            okLoading: false, // 弹窗确定按钮是否加载中
            /** 添加编辑试卷弹窗 */
            addEditPaperVisible: false, // 显示新增编辑试卷弹窗
            paperType: 'create', // 当前是新增还是编辑试卷
        }
    }
    /** 生命周期 */
    componentDidMount(){
        this.requestList();
    }

    /** 方法函数 */
    /**
     * 请求列表数据
     */
    requestList = async() => {
        // 声明请求参数
        let reqData = { page: this.state.page, limit: this.state.limit, };
        // 请求基础参数和搜索条件合并
        reqData = Object.assign(reqData, this.state.searchData)
        let res = await getPaperPageList(reqData);
        this.setState({
            tableListAll: res.total,
            tableList: res.records
        })
    }

    /**
     * 点击分页
     * @param {当前页数} page
     * @param {每页多少条数据} pageSize
     */
    pageChange = (page, pageSize) => {
        this.setState({
            page,
            limit: pageSize
        }, () => {this.requestList();})
    }

    /**
     * 点击搜索
     * @param {搜索数据} searchData
     */
    searchClick = (searchData) => {
        this.setState({
            searchData,
            page: 1
        }, () => {this.requestList();})
    }

    /**
     * 复制试卷
     * @param {当前操作的数据} item
     */
    copyPaper = (item) => {
        this.setState({
            popupTitle: '复制试卷',
            popupVisible: true,
            popupModalList: [{name: '试卷名称', type: 'input', key: 'examName', required: true, placeholder: '请输入试卷名称'},],
            popupData: item,
            popupType: 'copyPaper',
            popupModalData: {}
        })
    }

    /**
     * 编辑试卷
     * @param {当前是新增还是编辑试卷}
     * @param {当前操作的数据} item
     */
    addEditPaper = (type, item) => {
        this.setState({
            paperType: type,
            popupData: item,
            addEditPaperVisible: true
        })
    }

    /**
     * 删除试卷
     * @param {当前操作的数据} item
     */
    deletePaper = (item) => {
        Modal.confirm({
            title: '删除试卷',
            content: '确定删除该试卷?',
            onOk: () => {
                dataServer.getData(deletePaperPort + item.id).then((res) => {
                    message.success('删除试卷成功');
                    this.requestList();
                })
            }
        })
    }

    /**
     * 弹窗点击确定
     * @param {弹窗中的数据} data
     */
    okCallaBack = (data) => {
        this.setState({okLoading: true});
        // 声明请求参数
        let reqData = {
            name: data.examName, id: this.state.popupData.id
        }
        dataServer.postData(copyPaperPort,reqData).then((res) => {
            message.success('试卷复制成功');
            this.requestList();
            this.cancelCallBack();
        })
    }

    /**
     * 关闭弹窗
     */
    cancelCallBack = () => {
        this.setState({
            popupVisible: false,
            okLoading: false,
        })
    }

    /**
     * 编辑新增试卷回调函数
     */
    paperCallBack = () => {
        this.setState({
            addEditPaperVisible: false
        })
    }

    /** 方法组件 */
    // 表格中的状态栏
    renderTypeHtml = (text, record) => {
        switch (text) {
            case 0:
                return '未完成';
            case 1:
                return '已完成';
            case 2:
                return '已发布';
            default: return '通过审核';
        }
    }

    // 表格中的操作项
    renderOperateHtml = (text, record) => {
        return <Space>
            <Button className="color1F67A1" onClick={this.copyPaper.bind(this, record)} type="link">复制</Button>
            <Button className="color1F67A1" onClick={this.addEditPaper.bind(this, 'edit', record)} type="link">编辑</Button>
            <Button type="text" danger onClick={this.deletePaper.bind(this, record)}>删除</Button>
        </Space>
    }

    render(){
        return (
            <div className="paperManage">
                <TableSearchHeader searchBgColor='#1F67A1' btnList={this.state.searchBtnList} searchList={this.state.searchList} searchClick={this.searchClick}></TableSearchHeader>
                <TableData rowKey='id' pageChange={this.pageChange} currentPage={this.state.page} tableListAll={this.state.tableListAll} tableList={this.state.tableList}>
                    <Table.Column title='序号' render={(text, record, index) => {return index + 1}}></Table.Column>
                    <Table.Column title='试卷名称' dataIndex='name'></Table.Column>
                    <Table.Column title='时长(分钟)' dataIndex='duration'></Table.Column>
                    <Table.Column title='状态' dataIndex='status' render={this.renderTypeHtml}></Table.Column>
                    <Table.Column title='创建人' dataIndex='creator'></Table.Column>
                    <Table.Column title='操作' render={this.renderOperateHtml}></Table.Column>
                </TableData>
                {this.state.popupVisible ? <CommonModal title={this.state.popupTitle} modalList={this.state.popupModalList} okCallaBack={this.okCallaBack} cancelCallBack={this.cancelCallBack} okLoading={this.state.okLoading} detailsModalData={this.state.popupModalData}></CommonModal> : ''}
                {this.state.addEditPaperVisible ? <AddEditPaper paperType={this.state.paperType} paperData={this.state.popupData} paperCallBack={this.paperCallBack}></AddEditPaper> : ''}
            </div>
        )
    }
}

export default PaperManage;
