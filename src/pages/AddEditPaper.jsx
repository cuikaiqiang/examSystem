/*
 * @Author: cuikaiqiang
 * @Date: 2022-04-14 17:01:43
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 17:31:29
 * @FilePath: /examSystem/src/pages/AddEditPaper.jsx
 * @Description:
 */

import React from "react";
import { Modal, Button, InputNumber, Tabs, Pagination } from "antd";
import CommonModal from "../component/CommonModal";
import { questionClassifyPort } from "../network/dataServerUrl";
import { getAddQuestionData, getPaperDetails, getQuestionList } from "../network/requestFunction";
import '../scss/addEditPaper.scss';
import QuestionsItem from "../component/QuestionItem";
import ModalListPage from "../component/ModalListPage";
import { getQuestionLevel, getQUestionType } from "../common/common";

class AddEditPaper extends React.Component{
    static defaultProps = {
        paperType: 'create', // 当前是新增还是编辑试卷
        paperData: '', // 编辑试卷时的试卷基本数据
        paperCallBack: function(){}, // 点击确定和取消的回调函数
    }
    constructor(props){
        super(props);
        this.state = {
            popupWidth: 800, // 弹窗大小
            popupData: {}, // 当前操作的数据是哪个
            popupType: '', // 弹窗中显示的内容 (copyPaper：复制试卷、createPaper：创建试卷)
            popupVisible: false,
            popupTitle: '', // 弹窗显示的标题
            popupModalList: [], // 弹窗中显示的列表数据
            popupModalData: {}, // 弹窗中显示的列表数据选择的数据
            okLoading: false, // 弹窗确定按钮是否加载中
            /** 详情数据 */
            detailsModalList: [], // 详情中显示的列表数据
            detailsModalData: {}, // 详情中显示的列表数据选择的数据
            questionType: getQUestionType(), // 试题类型列表
            selectQuestionType: 1, // 选中的试题类型
            questionScore: 0, // 试卷及格分
            questionAllScore: 0, // 试卷总分
            questionList: [], // 试题列表
            popQuestionScore: 0, // 批量修改的分数
            /** 添加试题相关 */
            addQuestionVisible: false, // 是否显示添加试题弹窗
            addQuestionList: [],// 添加试题列表
            addQuestionListAll: 0, // 试题总数量
            addQuestionPage: 1, // 添加试题分页
            addQuestionLimit: 10, // 每页多少条数据
            selectQuestionIdList: [], // 添加试题中选中的试题
        }
    }

    componentDidMount(){
        // 判断是创建考试还是编辑考试
        if(this.props.paperType == 'create'){
            this.createPaper();
        }else{
            this.paperDetails();
        }
    }

    /** 方法 */
    /**
     * 创建试卷
     */
    createPaper = () => {
        let popupModalList = [
            {name: '试卷名称', type: 'input', key: 'paperName', required: true, placeholder: '请输入试卷名称',},
            {name: '组卷方式', type: 'select', key: 'method', required: true, placeholder: '请选择组卷方式', childList: [{label: '自动组卷', value: 1},{label: '手动组卷', value: 2}]},
            {name: '题库分类', type: 'tree', key: 'questionCategoryList', showKey: 'method', showValue: 1, changeKey: 'questionTypesNumber', required: true, reqDataUrl: questionClassifyPort + 0, fieldNames: {title: 'name', key: 'questionCategoryId', children: 'children'}},
            {name: '等级', key: 'levels', type: 'cascader', showKey: 'method', showValue: 1, changeKey: 'questionTypesNumber', placeholder: '请选择试题等级', childList: getQuestionLevel()},
            {name: '选中分类下题型数量', key: 'questionTypesNumber', showKey: 'method', showValue: 1, type: 'questionTypesNumber', childList: [{name:'选择题',value:1},{name:'多选题',value:2},{name:'判断题',value:3},{name:'填空题',value:4}]},
            {name: '题型', key: 'questionTypes', type: 'questionTypes', required: true, showKey: 'method', showValue: 1, changeKey: 'paperPoint', childList: [{name:'选择题',value:1},{name:'多选题',value:2},{name:'判断题',value:3},{name:'填空题',value:4}]},
            {name: '总分', type: 'input', key: 'paperPoint', showKey: 'method', showValue: 1, required: true, disabled: true, placeholder: '请输入总分'},
            {name: '及格分数', type: 'input', key: 'passPoint', required: true, placeholder: '请输入及格分数'},
            {name: '时长', type: 'input', key: 'time', required: true, inputType: 'number', placeholder: '请输入考试时长'},
        ], popupModalData = {
            method: 1
        }
        this.setState({
            popupWidth: 800,
            popupTitle: '创建试卷',
            popupVisible: true,
            popupModalList,
            popupData: {},
            popupType: 'createPaper',
            popupModalData
        })
    }

    /**
     * 试卷详情
     */
    paperDetails = async() => {
        let res = await getPaperDetails(this.props.paperData.id);
        this.setState({
            popupWidth: 1200,
            popupTitle: '试卷详情',
            popupVisible: true,
            detailsModalList: [
                {name: '试卷名称', type: 'input', key: 'name', placeholder: '请输入试卷名称',},
                {name: '时长', type: 'input', inputType: 'number', addonAfter: '分钟', key: 'duration', placeholder: '请输入时长',},
            ],
            detailsModalData: {
                name: res.name,
                duration: res.duration
            },
            questionList: res.tableList,
            questionScore: res.passPoint,
            questionAllScore: res.totalPoint
        })
    }

    /**
     * 创建试卷弹窗确定
     * @param {弹窗中的数据} data
     */
     popupCreatePaper = (data) => {
        let questionTypes = data.questionTypes || {}; // 获取填写的题型相关数据
        data.questionTypeNum = questionTypes.typesNumber; // 获取每种题型多少道题
        data.questionTypePoint = questionTypes.typesPoint; // 获取每种题型每道题多少分
        // 判断总分和及格分的大小
        if(Number(data.paperPoint) < Number(data.passPoint)){
            message.error('及格分数不能大于总分')
            return false;
        }
        this.props.paperCallBack(true);
    }

    /**
     * 弹窗点击确定
     * @param {弹窗中的数据} data
     */
     okCallaBack = (data) => {
        this.setState({okLoading: true});
        switch (this.state.popupType) {
            case 'createPaper':
                this.popupCreatePaper(data);break;
        }
    }

    /**
     * 关闭弹窗
     */
    cancelCallBack = () => {
        this.props.paperCallBack(false);
    }

    /**
     * 修改名称和时长
     * @param {修改过的值} data
     */
    changeModalData = (data) => {
        this.setState({
            detailsModalData: data
        })
    }

    /**
     * 计算总分数
     */
    calculateAllScope = () => {
        // 声明总分
        let allScope = 0, tableList = this.state.questionList; // 获取全部的试题列表
        // 循环全部的试题列表
        for(let i = 0; i < tableList.length; i++){
            allScope += (tableList[i].questionPoint || 0);
        };
        this.setState({questionAllScore: allScope})
    }

    /**
     * 弹窗中修改分数
     * @param {当前dom} e
     */
    popupChangeScore = (value) => {
        this.setState({
            popQuestionScore: value
        })
    }

    /**
     * 批量修改试题分数
     */
    batchChangeScore = () => {
        Modal.confirm({
            centered: true,
            title: '批量修改分数',
            icon: '',
            content: <InputNumber onChange={this.popupChangeScore} autoFocus={true} style={{width: '100%'}}></InputNumber>,
            onOk: () => {
                let tableList = this.state.questionList; // 获取全部的试题列表
                // 循环全部的试题列表
                for(let i = 0; i < tableList.length; i++){
                    // 判断当前循环的试题类型是否为当前选中的试题类型
                    if(tableList[i].questionTypeId == this.state.selectQuestionType){
                        tableList[i].questionPoint = this.state.popQuestionScore;
                    }
                };
                this.setState({questionList: tableList}, () => {this.calculateAllScope();})
            }
        })
    }

    /**
     * 选择试题的分类
     * @param {试题选择的分类} key
     */
    tabsChange = (key) => {
        this.setState({
            selectQuestionType: key
        })
    }

    /**
     * 点击添加试题按钮
     */
    clickAddQuestion = () => {
        let selectQuestionIdList = [];
        selectQuestionIdList = this.state.questionList.map((item) => { return item.questionId });
        this.setState({
            selectQuestionIdList
        }, () => { this.requestAddQuestionData();})
    }

    /**
     * 请求添加试题数据
     */
    requestAddQuestionData = async() => {
        let reqData = {
            page: this.state.addQuestionPage,
            limit: this.state.addQuestionLimit,
            questionTypeId: this.state.selectQuestionType,
            questionCategoryIds: [],
            levelKey: '',
            levelValue: '',
        }
        let res = await getQuestionList(reqData);
        this.setState({
            addQuestionList: res.tableList,
            addQuestionListAll: res.total || 0,
            addQuestionVisible: true
        })
    }

    /**
     * 添加试题切换分页
     * @param {当前页码} page
     * @param {每页多少条数据} pageSize
     */
    addQuestionPageChange = (page, pageSize) => {
        this.setState({
            addQuestionPage: page,
            addQuestionLimit: pageSize
        }, () => {this.requestAddQuestionData()})
    }

    /**
     * 点击添加试题弹窗中的试题数据
     * @param {当前点击的数据} item
     */
    addQuestionClickQuestion = (item) => {
        let idList = this.state.selectQuestionIdList;
        if(idList.includes(item.id)){
            let index = idList.indexOf(item.id);
            idList.splice(index, 1);
        }else{
            idList.push(item.id);
        }
        this.setState({
            selectQuestionIdList: idList
        })
    }

    /**
     * 判断当前试题是否选中了
     * @param {当前数据} item
     */
    judgeQuestionSelected = (item) => {
        let idList = this.state.selectQuestionIdList;
        return idList.some((id) => {
            return item.id == id;
        })
    }

    /**
     * 添加试题弹窗点击确定
     */
    addQuestionOkCallaBack = async() => {
        let res = await getAddQuestionData(this.state.selectQuestionIdList);
        this.setState({
            questionList: res,
            addQuestionVisible: false
        })
    }

    /**
     * 关闭添加试题弹窗
     */
    addQuestionCancelCallBack = () => {
        this.setState({addQuestionVisible: false})
    }

    /** 组件 */
    // 试卷分数区域
    renderPaperScoreHtml = () => {
        return <div className="paperScore">
            <div className="paperScoreLeft">
                <div className="paperScoreLeftItem">总分：{this.state.questionAllScore}</div>
                <div className="paperScoreLeftItem">
                    及格分：<InputNumber value={this.state.questionScore} size="small"></InputNumber>
                </div>
            </div>
            <div className="paperScoreRight">
                <Button className="scoreBtn" type="primary" onClick={this.batchChangeScore}>批量修改分数</Button>
                <Button className="scoreBtn" type="primary" onClick={this.clickAddQuestion}>添加试题</Button>
            </div>
        </div>
    }

    // 试卷分类区域
    renderPaperClassifyHtml = () => {
        return <Tabs defaultActiveKey={this.state.selectQuestionType} type="card" tabBarGutter={10} onChange={this.tabsChange}>
            {this.state.questionType.map((item) => {
                return <Tabs.TabPane tab={item.label} key={item.value}></Tabs.TabPane>
            })}
        </Tabs>
    }

    // 试卷试题列表区域
    renderPaperQuestionListHtml = () => {
        return this.state.questionList.map((item, index) => {
            return item.questionTypeId == this.state.selectQuestionType ? <QuestionsItem isShowBtn={false} isShowScore={true}
                key={item.questionId} itemIndex={index} itemData={item}></QuestionsItem> : ''
        })
    }

    // 显示的编辑试卷页面
    renderEditPaperHtml = () => {
        return <div className="paperDetails">
            <div className="paperTitle"></div>
            <div className="paperDuration"></div>
            <ModalListPage modalList={this.state.detailsModalList} modalData={this.state.detailsModalData} changeModalData={this.changeModalData}></ModalListPage>
            {this.renderPaperScoreHtml()}
            {this.renderPaperClassifyHtml()}
            {this.renderPaperQuestionListHtml()}
        </div>
    }

    // 添加试题页面
    renderAddQuestionHtml = () => {
        return <>{this.state.addQuestionList.map((item, index) => {
                return <QuestionsItem isSelected={this.judgeQuestionSelected.call(this, item)} clickQuestion={this.addQuestionClickQuestion} isShowBtn={false} key={item.id} itemIndex={index} itemData={item}></QuestionsItem>
            })}
            <Pagination className="tableDataPagination" total={this.state.addQuestionListAll}
                pageSize={this.state.addQuestionLimit}
                current={this.state.addQuestionPage}
                onChange={this.addQuestionPageChange}
                showSizeChanger={false}></Pagination>
        </>
    }

    render(){
        return <>
            {/* 添加试题弹窗 */}
            {this.state.addQuestionVisible ? <CommonModal title='添加试题' okCallaBack={this.addQuestionOkCallaBack} cancelCallBack={this.addQuestionCancelCallBack} okLoading={this.state.okLoading}>
                {this.renderAddQuestionHtml()}
            </CommonModal> : ''}
            {/* 编辑创建试题页面 */}
            {this.state.popupVisible ? <CommonModal popWidth={this.state.popupWidth} title={this.state.popupTitle} modalList={this.state.popupModalList} okCallaBack={this.okCallaBack} cancelCallBack={this.cancelCallBack} okLoading={this.state.okLoading} detailsModalData={this.state.popupModalData}>
                {this.renderEditPaperHtml()}
            </CommonModal> : ''}
        </>
    }
}

export default AddEditPaper;
