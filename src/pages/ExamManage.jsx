/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 15:08:37
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 15:54:47
 * @FilePath: /examSystem/src/pages/ExamManage.jsx
 * @Description:
 */

import React from "react";
import { history } from "umi";
import { Button, Table, Image as ImageData, Modal, message } from "antd";
import { SettingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import TableHeader from "../component/TableSearchHeader";
import TableData from "../component/TableData";
import CommonModal from "../component/CommonModal";
import dataServer from "../network/dataServer";
import { getExamPageList, getStatisticsData, getStatisticsHistogramData, getStatisticsAutoData, getWeekSettingData, getStatisticsAptitudeData } from "../network/requestFunction";
import { deleteExamByIdPort, lookQRcodePort, stopExamPort, activateExamPort, examPaperListPort, createExamClassifyPort, qualificationCategoryPort, updateSettingWeekPort, createExamPort } from "../network/dataServerUrl";
import '../scss/examManage.scss';

class ExamManage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            examType: '', // 当前页面是什么类型的考试页面
            searchBtnList: [], // 顶部搜索区域显示显示的按钮
            searchList: [], // 全部的搜索条件
            searchData: {},
            page: 1, // 考试列表当前页数
            limit: 10, // 考试列表每页多少条数据
            examList: [], // 考试列表数据
            examListAll: 0, // 全多少条数据
            /** 弹窗相关内容 */
            popupData: {}, // 弹窗中操作的数据
            popupWidth: 800, // 弹窗的宽度
            popupVisible: false, // 是否显示弹窗
            popupTitle: '', // 弹窗显示的标题
            popupFooter: undefined, // 是否显示底部按钮
            popupType: 'statistics', // 弹窗中显示的内容 (statistics：统计、aptitude：资质统计、settingExam：每周考试设置、creationExam：创建考试、QECode：查看二维码、activate：激活考试)
            popupModalList: [], // 弹窗中显示的列表数据
            popupModalData: {}, // 弹窗中显示的列表数据选择的数据
            okLoading: false, // 弹窗确定按钮是否加载中
            /** 统计数据 */
            statisticsPage: 1, // 统计当前页数
            statisticsLimit: 10, // 每页多少条数据
            statisticsList: [], // 考试列表数据
            statisticsListAll: 0, // 全多少条数据
            /** 二维码 */
            QRCodeUrl: '', // 考试二维码地址
        }
    }
    componentDidMount(){
        // 监听路由变化
        history.listen((location) => {
            let pathname = location.pathname, // 获取路由地址
               examType = this.props.match.params.type; // 获取路由传参
            // 判断当前路由是否为考试管理页面 并且传递的参数不是当前页面已经存在的参数
            if(pathname.indexOf('/examManage') != -1 && this.state.examType != examType){
                this.setState({
                    examType
                }, () => {
                    this.init();
                });

            }
        })
    }

    /** 方法函数 */
    /**
     * 初始化方法
     */
    init = () => {
        let searchBtnList = [], // 声明按钮列表
            searchList = [{type: 'input', key: 'examName', placeholder: '请输入考试名称'},]; // 搜索条件列表
        // 判断当前是什么类型的考试 显示不同的操作按钮
        switch (this.state.examType) {
            case '1': // 每周答题
                searchBtnList = [{name: '设置', icon: <SettingOutlined />, bgColor: '#6DA4D0', fun: this.settingExam},]
                break;
            case '4': // 资格考试
                searchBtnList = [
                    {name: '创建考试', icon: <PlusCircleOutlined />, bgColor: '#59BCE8', fun: this.createExam},
                    {name: '资质统计', bgColor: '#66b1ff', fun: this.aptitudeStatistics},
                ]
                break;
            // 其他考试
            default: searchBtnList = [{name: '创建考试', icon: <PlusCircleOutlined />, bgColor: '#59BCE8', fun: this.createExam},]
                break;
        }
        // 每周答题、专项答题、集中抽考添加年份搜索条件
        if(['1','2','3'].includes(this.state.examType)){
            searchList.push({type: 'dataPicker', key: 'year', placeholder: '请选择年份',  picker: 'year'});
        }
        this.setState({searchBtnList, searchList, searchData: {}})
        this.requestExamList();
    }

    /**
     * 初始化考试页面相关数据
     */
    requestExamList = async() => {
        // 声明请求参数
        let reqData = this.state.searchData || {}, res = {};
        reqData.page = this.state.page,
        reqData.limit = this.state.limit;
        reqData.businessType = this.state.examType;
        res = await getExamPageList(reqData);
        this.setState({
            examList: res.records || [],
            examListAll: res.total
        })
    }

    /**
     * 顶部点击搜索
     * @param {点击搜索输入的值} data
     */
    headerSearchClick = (data) => {
        this.setState({
            searchData: data,
            page: 1
        }, () => {this.requestExamList()})
    }

    /**
     * 每周考试设置时间
     */
    settingExam = async() => {
        let popupModalList = [
            {name: '是否开启', key: 'isOpen', type: 'switch', checked: '开启', unChecked: '关闭', required: true,},
            {name: '周次', key: 'day', type: 'select', required: true, placeholder: '请选择周次', childList: [{label: '周一', value: 1},{label: '周二', value: 2},{label: '周三', value: 3},{label: '周四', value: 4},{label: '周五', value: 5},{label: '周六', value: 6},{label: '周天', value: 7}]},
            {name: '时间', key: 'timer', type: 'selectTimer', timeType: 'timer', required: true,}
        ], res = await getWeekSettingData({});
        this.setState({
            popupVisible: true,
            popupWidth: 800,
            popupTitle: '创建考试',
            popupType: 'settingExam',
            popupModalList: popupModalList,
            popupModalData: res,
        })
    }

    /**
     * 创建考试
     */
    createExam = () => {
        let popupModalList = [
            {name: '考试标题', type: 'input', key: 'examName', required: true, placeholder: '请输入考试标题'},
        ];
        // 根据不同的考试类型创建不同的考试
        switch (this.state.examType) {
            case '2':
                popupModalList.push({name: '分类', key: 'questionCategoryId', type: 'select', fieldNames: {value: 'questionCategoryId', label: 'name'}, reqDataUrl: createExamClassifyPort + '?parentId=3', required: true, placeholder: '请选择分类',},)
                break;
            case '4':
                popupModalList.push({name: '类别选择', key: 'categoryId', type: 'select', required: true, fieldNames: {value: 'questionCategoryId', label: 'name'}, reqDataUrl: qualificationCategoryPort, linkage: 2, placeholder: '请选择类别'})
                popupModalList.push({name: '部门选择', key: 'questionCategoryId', type: 'select', required: true, fieldNames: {value: 'questionCategoryId', label: 'name'}, reqDataUrl: createExamClassifyPort + '?parentId=', reqDataKey: 'categoryId', linkage: 3, placeholder: '请选择部门'})
                popupModalList.push({name: '资格选择', key: 'childrenQuestionCategoryId', type: 'select', required: true, fieldNames: {value: 'questionCategoryId', label: 'name'}, reqDataUrl: createExamClassifyPort + '?parentId=', reqDataKey: 'questionCategoryId', placeholder: '请选择资格'})
                break;
        }
        popupModalList.push({name: '选择试卷', type: 'selectPaper', key: 'examPaperId', required: true, placeholder: '请输入试卷', reqDataUrl: examPaperListPort, btnClick: this.selectPaperBtn},);
        popupModalList.push({name: '请选择时间', type: 'selectTimeSection', key: 'examTime', required: true, placeholder: '请选择时间'},);
        this.setState({
            popupVisible: true,
            popupWidth: 800,
            popupTitle: '创建考试',
            popupType: 'creationExam',
            popupModalList: popupModalList,
            popupModalData: {}
        })
    }

    /**
     * 创建试卷
     */
    selectPaperBtn = () => {}

    /**
     * 考试列表切换分页
     * @param {当前页数} page
     * @param {每页多少条数据} pageSize
     */
    pageChange = (page, pageSize) => {
        this.setState({
            page,
            limit: pageSize
        }, () => {this.requestExamList();})
    }

    /**
     * table显示的key值
     * @param {当前处理的数据} record
     * @returns 需要的值
     */
    showTableKey = (record) => {
        switch (this.state.examType) {
            default: return record.examId
        }
    }

    /**统计表格显示key值
     * table显示的key值
     * @param {当前处理的数据} record
     * @returns 需要的值
     */
    statisticsTableKey = (record) => {
        if(this.state.popupType == 'aptitude'){
            return record.id;
        }
        switch (this.state.examType) {
            case '2':
                return record.id;
            default: return record.histId
        }
    }

    /**
     * 资质统计
     */
    aptitudeStatistics = () => {
        this.setState({
            statisticsPage: 1,
            statisticsLimit: 10,
            popupTitle: '资格考试状元榜'
        }, () => {
            this.requestAptitudeStatistics();
        })

    }

    /**
     * 获取资质统计数据
     */
    requestAptitudeStatistics = async() => {
        let reqData = {page: this.state.statisticsPage, limit: this.state.statisticsLimit},
            res = await getStatisticsAptitudeData(reqData);
        this.setState({
            statisticsList: res.records || [],
            statisticsListAll: res.total,
            popupVisible: true,
            popupWidth: 800,
            popupType: 'aptitude',
            popupFooter: undefined,
            popupModalList: [],
            popupModalData: {}
        })

    }

    /**
     * 查看统计数据
     * @param {当前操作的数据} item
     */
    lookStatisticsData = (item) => {
        this.setState({
            statisticsPage: 1,
            statisticsLimit: 10,
            popupData: item,
            popupTitle: item.examName + '统计数据',
        }, () => {this.requestStatisticsData()})
    }

    /**
     * 获取统计数据
     */
    requestStatisticsData = async() => {
        // 获取当亲考试类型、声明请求参数、声明请求返回数据
        let examType = this.state.examType, reqData = { page: this.state.statisticsPage, limit: this.state.statisticsLimit }, res = {};
        // 自动分发考试
        if(examType === '9'){
            res = await getStatisticsAutoData(this.state.examType, reqData);
        // 专项答题、资格考试、技能认证考试、入厂资格考试、职业技能考试
        }else if(['2', '4', '7', '8', '10'].includes(examType)){
            reqData.examId = this.state.popupData.examId;
            res = await getStatisticsData(reqData);
        // 其他考试
        }else{
            res = await getStatisticsHistogramData();
        }
        this.disposeStatisticsData(res);
    }

    /**
     * 处理其他通用考试统计内容：资格考试、技能认证考试、自动分发考试、入厂资格考试、职业技能考试
     * @param {需要处理的数据} res
     * @returns 处理完成的数据
     */
    disposeStatisticsOtherData = (res) => {
        let dataList = res.records || [], // 获取统计数据
            companyName = ''; // 声明公司名称
        // 循环获取到的统计数据并将其中的通过状态格式化
        for(let i = 0; i < dataList.length; i++){
            dataList[i].isPassName = dataList[i].isPass == 1 ? '通过' : '未通过';
            // 如果当前是自动分发考试 则将其中的同一个公司的人员合并
            if(this.state.examType == 9){
                if(dataList[i].deptName == companyName){
                    dataList[i].deptName = '';
                }else {
                    companyName = dataList[i].deptName;
                }
            }
        }
        return dataList;
    }

    /**
     * 处理请求到的统计数据
     * @param {需要处理的数据} res
     */
    disposeStatisticsData = (res) => {
        // 声明统计列表数据、全部有多少条统计数据、获取当期考试类型
        let dataList = [], dataListAll = 0, examType = this.state.examType;
        // 资格考试、技能认证考试、自动分发考试、入厂资格考试、职业技能考试
        if(['4','7','8','9','10'].includes(examType)){
            dataList = this.disposeStatisticsOtherData(res);
            dataListAll = res.total || 1;
        }else{
            dataList = res;
            dataListAll = res.length || 1;
        }
        this.setState({
            statisticsList: dataList,
            statisticsListAll: dataListAll,
            popupVisible: true,
            popupWidth: 800,
            popupType: 'statistics',
            popupFooter: undefined,
            popupModalList: [],
            popupModalData: {}
        })
    }

    /**
     * 统计点击分页
     * @param {当前页数} page
     * @param {每页多少条数据} pageSize
     */
    statisticsPageChange = (page, pageSize) => {
        this.setState({
            statisticsPage: page,
            statisticsLimit: pageSize,
        }, () => {
            if(this.state.popupType == 'statistics'){
                this.requestStatisticsData();
            }else{
                this.requestAptitudeStatistics();
            }
        })
    }

    /**
     * 查看二维码
     * @param {当前操作的数据} item
     */
    lookQRCode = (item) => {
        this.setState({
            QRCodeUrl: dataServer.baseURL + lookQRcodePort + item.examId,
            popupVisible: true,
            popupWidth: 300,
            popupTitle: '查看二维码',
            popupFooter: null,
            popupType: 'QECode',
            popupModalList: [],
            popupModalData: {}
        })
    }

    /**
     * 下载二维码
     */
    downloadQRCode = () => {
        let image = new Image();
        // 解决跨域 Canvas 污染问题
        image.setAttribute("crossOrigin", "anonymous");
        image.onload = function() {
          let canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          let context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, image.width, image.height);
          let url = canvas.toDataURL("image/png"); //得到图片的base64编码数据
          let a = document.createElement("a"); // 生成一个a元素
          let event = new MouseEvent("click"); // 创建一个单击事件
          a.download = "QEcode"; // 设置图片名称
          a.href = url; // 将生成的URL设置为a.href属性
          a.dispatchEvent(event); // 触发a的单击事件
        };
        image.src = this.state.QRCodeUrl;
    }

    /**
     * 激活考试
     * @param {当前操作的数据} item
     */
    activateExam = (item) => {
        this.setState({
            popupData: item,
            popupVisible: true,
            popupWidth: 800,
            popupTitle: '激活考试',
            popupType: 'activate',
            popupModalList: [{name: '请选择时间', type: 'selectTimeSection', key: 'examTime', placeholder: '请选择时间'}],
            popupModalData: {}
        })
    }

    /**
     * 关闭考试
     * @param {当前操作的数据} item
     */
    closeExam = (item) => {
        Modal.confirm({
            title: '关闭考试',
            content: '确定结束该考试?',
            centered: true,
            onOk: ()=>{
                dataServer.getData(stopExamPort + item.examId, {}).then((res) => {
                    message.success('结束考试成功');
                    this.requestExamList();
                })
            }
        })
    }

    /**
     * 删除考试
     * @param {当前操作的数据} item
     */
    deleteExam = (item) => {
        Modal.confirm({
            title: '删除考试',
            content: '确定删除该考试?',
            onOk: () => {
                dataServer.getData(deleteExamByIdPort + item.examId, {}).then((res) => {
                    message.success('删除考试成功');
                    this.requestExamList();
                })
            }
        })
    }

    /**
     * 激活考试
     * @param {弹窗中的数据} data
     * @returns
     */
    popupActivateExam = (data) => {
        // 声明请求参数     获取考试时间
        let reqData = {}, examTime = data.examTime || '';
        // 判断是否已经选择了考试时间
        if(!examTime || examTime.length <= 0){
            message.error('请选择考试时间')
            return false;
        }
        reqData = {
            examId: this.state.popupData.examId,
            effTime: examTime[0],
            expTime: examTime[1],
        }
        dataServer.postData(activateExamPort, reqData).then((res) => {
            message.success('激活考试成功');
            this.requestExamList();
            this.cancelCallBack();
        })
    }

    /**
     * 每周考试设置时间
     * @param {弹窗中的数据} data
     */
    popupSettingWeek = (data) => {
        let timerList = data.timer.split(':'),
            extra = {type: 2, day: data.day, hour: timerList[0],minute: timerList[1],second: timerList[2]},
            reqData = {
                taskId: data.taskId,
                extra: JSON.stringify(extra),
                state: data.isOpen ? 1 : 0,
            };
        dataServer.postData(updateSettingWeekPort, reqData).then((res) => {
            message.success('每周答题时间设置成功');
            this.cancelCallBack();
        })
    }

    /**
     * 创建考试
     * @param {弹窗中的数据} data
     */
    popupCreateExam = (data) => {
        let reqData = data || {};
        if([3,4,7,8].includes(Number(this.state.examType))){
            reqData.examType = 2; // 考试类型(正式、模拟)
        }else {
            reqData.examType = 3; // 考试类型(正式、模拟)
        }
        reqData.effTime = data.examTime[0]; // 考试开始时间
        reqData.expTime = data.examTime[1]; // 考试结束时间
        reqData.businessType = Number(this.state.examType);
        dataServer.postData(createExamPort, reqData).then((res) => {
            message.success('创建考试成功');
            this.cancelCallBack();
            this.requestExamList();
        })
    }

    /**
     * 弹窗点击确定
     * @param {弹窗中的数据} data
     */
    okCallaBack = (data) => {
        this.setState({okLoading: true});
        let popupType = this.state.popupType;
        // 判断是否为激活考试
        if(popupType == 'activate'){
            this.popupActivateExam(data);
        // 判断是否为每周考试设置时间
        }else if(popupType == 'settingExam'){
            this.popupSettingWeek(data);
        // 判断是否为创建考试
        }else if(popupType == 'creationExam'){
            this.popupCreateExam(data);
        }
    }

    // 关闭弹窗
    cancelCallBack = () => {
        this.setState({
            popupVisible: false,
            okLoading: false,
        })
    }

    /** 组件方法 */
    // table表格显示的考卷名称
    renderTableExamNameHtml = () => {
        let examType = this.state.examType; // 获取当期是那种考试
        // 自动分发考试不存在考卷
        if(examType != 9){
            return <Table.Column key='examPaper' title='考卷' dataIndex='examPaperName' render={(text) => {return <Button className="color1F67A1 lineFeed" type="text">{text}</Button>}}></Table.Column>;
        }
    }

    // table表格显示的统计
    renderTableStatisticsHtml = () => {
        return <Table.Column key='statistics' title='答题情况' render={(text, record) => {return <Button onClick={this.lookStatisticsData.bind(this, record)} className="color1F67A1" type="text">统计数据</Button>}}></Table.Column>;
    }

    // table表格的操作项
    renderTableOPerateHtml = () => {
        let examType = this.state.examType; // 获取当期是那种考试
        // 每周开始不存在操作
        if(examType != 1){
            return <Table.Column key='operate' title='操作' fixed='right' render={(text, record) => {
                return <>
                    {/* 专项考试没有查看二维码 */}
                    {examType != 2 ? <Button onClick={this.lookQRCode.bind(this, record)} className="color1F67A1" type="text">查看二维码</Button> : ''}
                    {/* 只有自定分发开始存在设置规则 */}
                    {examType == 9 ? <Button className="color1F67A1" type="text">设置规则</Button> : ''}
                    {record.status == 1 ?
                        <Button onClick={this.closeExam.bind(this, record)} danger type="text">关闭考试</Button>:
                        <Button onClick={this.activateExam.bind(this, record)} className="color41bb19" type="text">激活考试</Button>}
                    {/* 只有关闭的考试 并且 当前考试不是专项答题的时候显示删除考试 */}
                    {record.status != 1 && examType != 2 ? <Button onClick={this.deleteExam.bind(this, record)} danger type="text">删除考试</Button> : ''}

                </>
            }}></Table.Column>;
        }
    }

    // table表格显示内容
    renderTableHtml = () => {
        let tableColumList = [], examType = this.state.examType; // 声明table显示的内容列表、获取当前是那种类型的考试
        // 每周考试显示月份、周次、时间
        if(examType == 1){
            tableColumList.push(<Table.Column key='month' title='月份' dataIndex='month'></Table.Column>)
            tableColumList.push(<Table.Column key='weekName' title='周次' dataIndex='weekName'></Table.Column>)
            tableColumList.push(<Table.Column key='effectiveDate' title='时间' dataIndex='effectiveDate'></Table.Column>)
        }else{
            tableColumList.push(<Table.Column key='examName' title='考试名称' dataIndex='examName'></Table.Column>)
            // 资格考试存在部门名称和资格名称
            if(examType == 4){
                tableColumList.push(<Table.Column key='questionCategoryName' title='部门名称' dataIndex='questionCategoryName'></Table.Column>)
                tableColumList.push(<Table.Column key='qualificationName' title='资格名称' dataIndex='qualificationName'></Table.Column>)
            }
            tableColumList.push(<Table.Column key='createTime' title='发布时间' dataIndex='createTime'></Table.Column>)
            tableColumList.push(<Table.Column key='validity' title='考试有效期' dataIndex='effectiveDate'></Table.Column>)
            // 入厂资格考试存在项目名称
            if(examType == 7){
                tableColumList.push(<Table.Column key='projectName' title='项目名称' dataIndex='projectName'></Table.Column>)
            }
        }
        // 考卷
        tableColumList.push(this.renderTableExamNameHtml());
        // 统计数据
        tableColumList.push(this.renderTableStatisticsHtml());
        // 操作
        tableColumList.push(this.renderTableOPerateHtml());
        return <>{tableColumList}</>
    }

    // 统计数据表格显示内容
    renderStatisticsTableHtml = () => {
        if(this.state.popupType == 'aptitude'){
            return <>
                <Table.Column title='姓名' dataIndex='nick_name'></Table.Column>
                <Table.Column title='岗位资质(个)' dataIndex='postCount'></Table.Column>
                <Table.Column title='作业类别(个)' dataIndex='categoryCount'></Table.Column>
                <Table.Column title='总资质(个)' dataIndex='toatal'></Table.Column>
            </>
        }
        switch (this.state.examType) {
            case '2': // 专项答题
                return <>
                    <Table.Column title='参考单位' dataIndex='name'></Table.Column>
                    <Table.Column title='参考人数' dataIndex='num'></Table.Column>
                    <Table.Column title='参考率(%)' dataIndex='reference_rate'></Table.Column>
                    <Table.Column title='正确率(%)' dataIndex='correct_rate'></Table.Column>
                </>
            case '9': // 自动分发考试
                return <>
                    <Table.Column title='参考单位' dataIndex='deptName'></Table.Column>
                    <Table.Column title='参考人员' dataIndex='nickName'></Table.Column>
                    <Table.Column title='得分' dataIndex='pointGet'></Table.Column>
                    <Table.Column title='是否通过' dataIndex='isPassName'></Table.Column>
                </>
            // 其他考试：资格考试、技能认证考试、入厂资格考试、职业技能考试
            default: return <>
                <Table.Column title='参考人员' dataIndex='nick_name'></Table.Column>
                <Table.Column title='得分' dataIndex='point_get'></Table.Column>
                <Table.Column title='是否通过' dataIndex='isPassName'></Table.Column>
            </>
        }
    }

    // 弹窗中显示的内容
    renderPopupShowHtml = () => {
        switch (this.state.popupType) {
            case 'QECode':
                return <div className="examManageLookQEcode">
                    <ImageData src={this.state.QRCodeUrl} />
                    <Button type="primary" shape="round" onClick={this.downloadQRCode}>下载二维码</Button>
                </div>
            default: return <TableData rowKey={this.statisticsTableKey} isShowPagination={this.state.examType != 2} tableList={this.state.statisticsList} pageSize={this.state.statisticsLimit}
                tableListAll={this.state.statisticsListAll} currentPage={this.state.statisticsPage} pageChange={this.statisticsPageChange}>
                {this.renderStatisticsTableHtml()}
            </TableData>
        }
    }

    render(){
        return <div className="examManage">
            <TableHeader searchBgColor='#1F67A1' btnList={this.state.searchBtnList} searchList={this.state.searchList} searchClick={this.headerSearchClick}></TableHeader>
            <TableData rowKey={this.showTableKey} tableList={this.state.examList} tableListAll={this.state.examListAll} pageSize={this.state.limit}
                currentPage={this.state.page} pageChange={this.pageChange}>
                {this.renderTableHtml()}
            </TableData>
            {this.state.popupVisible ? <CommonModal title={this.state.popupTitle} popWidth={this.state.popupWidth} modalList={this.state.popupModalList} footer={this.state.popupFooter} okCallaBack={this.okCallaBack} cancelCallBack={this.cancelCallBack} detailsModalData={this.state.popupModalData} okLoading={this.state.okLoading}>
                {this.renderPopupShowHtml()}
            </CommonModal> : ''}

        </div>
    }
}

export default ExamManage;
