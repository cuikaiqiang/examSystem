/*
 * @Author: cuikaiqiang
 * @Date: 2022-04-21 10:01:15
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-22 16:29:54
 * @FilePath: /examSystem/src/pages/ImportQuestion.jsx
 * @Description:
 */

import React from 'react';
import { Tabs, Input, Pagination, Radio, Checkbox } from 'antd';
import { PlusCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { getQUestionType } from '../common/common';
import CommonModal from '../component/CommonModal';
import dataServer from '../network/dataServer';
import {
    importQuestionExcel,
    importQuestionWord,
} from '../network/dataServerUrl';
import { disposeQuestionData } from '../network/requestFunction';
import '../scss/importQuestionArea.scss';

class ImportQuestion extends React.Component {
    static defaultProps = {
        parentId: '', // 父级分类id
        okCallaBack: function () {}, // 点击确定按钮
        cancelCallBack: function () {}, // 点击取消按钮
    };
    constructor(props) {
        super(props);
        this.state = {
            popupType: '', // 弹窗中显示的内容
            popupVisible: false,
            popupTitle: '', // 弹窗显示的标题
            popupModalList: [], // 弹窗中显示的列表数据
            popupModalData: {}, // 弹窗中显示的列表数据选择的数据
            okLoading: false, // 弹窗确定按钮是否加载中
            /** 导入的试题列表数据 */
            importQuestionList: [], // 导入的试题列表
            selectQuestionType: 1, // 当前选择是那种类型的数据
            showQuestionList: [], // 显示在页面上的试题列表
            showQuestionAll: 0, // 显示的试题有多少条数据
            currentPage: 1, // 当前页数
            pageSize: 50, // 每页多少条数据
        };
    }

    componentDidMount() {
        this.initImportData();
    }

    /** 方法 */
    /**
     * 初始化导入弹窗页面
     */
    initImportData = () => {
        this.setState({
            popupTitle: '导入试题',
            popupVisible: true,
            popupModalList: [
                {
                    name: '节点类型',
                    type: 'radio',
                    disabled: true,
                    key: 'type',
                    childList: [
                        { label: '机构（省公司、厂级）', value: 1 },
                        { label: '题库类型', value: 2 },
                        { label: '部门', value: 3 },
                    ],
                },
                {
                    name: '试卷文件',
                    type: 'upload',
                    key: 'file',
                    fileBtnList: [
                        {
                            btnName: '选取Word',
                            fileType: '.doc, .docx, .wps',
                            uploadType: 'word',
                        },
                        {
                            btnName: '选取Excel',
                            fileType: '.xls, .xlsx',
                            uploadType: 'excel',
                        },
                    ],
                },
            ],
            popupType: 'import',
            popupModalData: { type: 2 },
        });
    };

    /**
     * 获取子组件方法
     * @param {子组件本身} ref
     */
    onRef = (ref) => {
        this.popChild = ref;
    };

    /**
     * 选择试题的分类
     * @param {试题选择的分类} key
     */
    tabsChange = (key) => {
        this.setState(
            {
                selectQuestionType: key,
                currentPage: 1,
            },
            () => {
                this.calculateShowQuestionList();
            },
        );
    };

    pageChange = (currentPage, pageSize) => {
        this.setState(
            {
                currentPage,
                pageSize,
            },
            () => {
                this.calculateShowQuestionList();
            },
        );
    };

    /**
     * 修改试题内容
     * @param {当前是第几个} ind
     * @param {当前修改的类型} type
     * @param {当前组件的值} data
     */
    questionChangeData = (ind, type, key, data) => {
        let importQuestionList = this.state.importQuestionList, // 获取全部的导入数据
            selectQuestionType = this.state.selectQuestionType, // 获取当前显示的那种类型的试题
            currentQuestionList = importQuestionList[selectQuestionType] || [], // 获取当前显示的全部试题列表
            showQuestionList = this.state.showQuestionList, // 获取页面上显示的数据
            currentInd =
                (this.state.currentPage - 1) * this.state.pageSize + ind; // 获取当前是第几个试题
        // 判断当前修改的是否为试题名称
        if (type == 'name') {
            currentQuestionList[currentInd].name = data.target.value;
            showQuestionList[ind].name = data.target.value;
            // 判断当前修改的是否为单选题答案
        } else if (type == 'radio') {
            currentQuestionList[currentInd].answer = data.target.value;
            showQuestionList[ind].answer = data.target.value;
            // 判断当前修改的是否为多选题答案
        } else if (type == 'checkbox') {
            currentQuestionList[currentInd].answer = data;
            showQuestionList[ind].answer = data;
        } else if (type == 'option') {
            let changeItem = showQuestionList[ind], // 当前修改的是哪个数据
                changeItemContent = changeItem.content || {}, // 获取当前修改数据的content
                changeItemOption = changeItemContent.choiceList || {}; // 获取当前修改数据的选项数据
            changeItemOption[key] = data.target.value;
            changeItemContent.choiceList = changeItemOption;
            changeItem.content = changeItemContent;
            currentQuestionList[currentInd] = changeItem;
            showQuestionList[ind] = changeItem;
        }
        importQuestionList[selectQuestionType] = currentQuestionList;
        this.setState({
            showQuestionList,
            importQuestionList,
        });
    };

    /**
     * 添加删除选项
     * @param {当前操作的是第几个} ind
     * @param {当前操作的类} type
     */
    addDeleteOptionList = (ind, type, key) => {
        let importQuestionList = this.state.importQuestionList, // 获取全部的导入数据
            selectQuestionType = this.state.selectQuestionType, // 获取当前显示的那种类型的试题
            currentQuestionList = importQuestionList[selectQuestionType] || [], // 获取当前显示的全部试题列表
            showQuestionList = this.state.showQuestionList, // 获取页面上显示的数据
            currentInd =
                (this.state.currentPage - 1) * this.state.pageSize + ind, // 获取当前是第几个试题
            changeItem = showQuestionList[ind], // 当前修改的是哪个数据
            changeItemContent = changeItem.content || {}, // 获取当前修改数据的content
            changeItemOption = changeItemContent.choiceList || {}; // 获取当前修改数据的选项数据
        if (type == 'add') {
            let keysLength = Object.keys(changeItemOption).length;
            changeItemOption[String.fromCharCode(65 + keysLength)] = '';
        } else {
            delete changeItemOption[key]; // 删除点击的选项
            let keysLength = Object.keys(changeItemOption), // 获取剩余的选项
                answerListChange = {}; // 声明新的选项数据
            // 循环还剩下的选项数据 并安装从A开始重新赋值
            for (let i = 0; i < keysLength.length; i++) {
                let letter = String.fromCharCode(65 + i);
                answerListChange[letter] = changeItemOption[keysLength[i]];
            }
            changeItem.answer = '';
            changeItemOption = answerListChange;
        }
        changeItemContent.choiceList = changeItemOption;
        changeItem.content = changeItemContent;
        showQuestionList[ind] = changeItem;
        currentQuestionList[currentInd] = changeItem;
        importQuestionList[selectQuestionType] = currentQuestionList;
        this.setState({
            showQuestionList,
            importQuestionList,
        });
    };

    /**
     * 获取显示在页面上的试题
     */
    calculateShowQuestionList = () => {
        let importQuestionList = this.state.importQuestionList, // 获取全部的导入数据
            selectQuestionType = this.state.selectQuestionType, // 获取当前显示的那种类型的试题
            currentQuestionList = importQuestionList[selectQuestionType] || [], // 获取当前显示的全部试题列表
            currentPage = this.state.currentPage, // 获取当前页数
            pageSize = this.state.pageSize, // 获取每页多少数据
            startInd = (currentPage - 1) * pageSize, // 声明起始点位置
            endInd = currentPage * pageSize, // 结束点位置
            showQuestionList = [];
        // 判断是否已经到结尾了
        if (endInd > currentQuestionList.length) {
            endInd = currentQuestionList.length;
        }
        // 循环获取当前显示在页面上的数据
        for (let i = startInd; i < endInd; i++) {
            showQuestionList.push(currentQuestionList[i]);
        }
        this.setState({
            showQuestionList,
            showQuestionAll: currentQuestionList.length,
        });
    };

    /**
     * 处理请求到的试题列表数据
     * @param {返回的试题数据} dataList
     */
    disposeImportBackData = (dataList) => {
        // 获取全部的试题key
        let typeKey = Object.keys(dataList);
        for (let i = 0; i < typeKey.length; i++) {
            let keyQuestionList = dataList[typeKey[i]];
            for (let j = 0; j < keyQuestionList.length; j++) {
                let disposeItem = disposeQuestionData(keyQuestionList[j]);
                if (disposeItem.questionTypeId == 3) {
                    disposeItem.answer =
                        disposeItem.answer == '正确' ? 'T' : 'F';
                }
                keyQuestionList[j] = disposeItem;
            }
            dataList[typeKey[i]] = keyQuestionList;
        }
        this.setState(
            {
                popupType: 'questionList',
                popupModalList: [],
                importQuestionList: dataList,
                selectQuestionType: 1,
                currentPage: 1,
            },
            () => {
                this.calculateShowQuestionList();
            },
        );
    };

    /**
     * 弹窗点击上传试题文件
     * @param {弹窗中的数据} popData
     */
    popupImportQuestion = (popData) => {
        let reqUrl = '',
            formData = new FormData();
        // 判断当前上传的是Word还是Excel
        if (popData.uploadType == 'word') {
            reqUrl = importQuestionWord;
        } else {
            reqUrl = importQuestionExcel + this.props.parentId;
        }
        // 将弹窗中的数据全部转换为formData
        for (let key in popData) {
            let popItem = popData[key];
            if (key == 'file') {
                popItem = popItem[0];
            }
            formData.append(key, popItem);
        }
        dataServer.postData(reqUrl, formData).then((res) => {
            this.disposeImportBackData(res.dataList);
        });
    };

    popupQuestionList = () => {
        console.log(123456);
        this.setState(
            {
                popupTitle: '创建试卷和考试',
                popupModalList: [
                    { name: '试卷设置', type: 'title' },
                    {
                        name: '单个试题分数',
                        type: 'input',
                        inputType: 'number',
                        key: 'onePoint',
                        required: true,
                        placeholder: '请输入试题内容',
                        changeKey: 'paperPoint',
                    },
                    {
                        name: '总分',
                        type: 'input',
                        key: 'paperPoint',
                        required: true,
                        disabled: true,
                        placeholder: '请输入总分',
                    },
                    {
                        name: '及格分数',
                        type: 'input',
                        inputType: 'number',
                        key: 'passPoint',
                        required: true,
                        placeholder: '请输入及格分数',
                    },
                    {
                        name: '时长',
                        type: 'input',
                        key: 'duration',
                        required: true,
                        inputType: 'number',
                        placeholder: '请输入考试时长',
                    },
                    { name: '考试设置', type: 'title' },
                    {
                        name: '试题类型',
                        type: 'radio',
                        key: 'isAddExam',
                        childList: [
                            { label: '是', value: 1 },
                            { label: '否', value: 0 },
                        ],
                    },
                    {
                        name: '请选择时间',
                        type: 'selectTimeSection',
                        key: 'examTime',
                        showKey: 'isAddExam',
                        showValue: 1,
                        required: true,
                        placeholder: '请选择时间',
                    },
                ],
                popupType: 'createPaper',
                popupModalData: { isAddExam: 1 },
            },
            () => {
                this.popChild.init();
            },
        );
    };

    /**
     * 弹窗点击确定
     * @param {弹窗中的数据} popData
     */
    okCallaBack = (popData) => {
        let popupType = this.state.popupType;
        if (popupType == 'import') {
            this.popupImportQuestion(popData);
        } else if (popupType == 'questionList') {
            this.popupQuestionList();
        }
    };

    /** 组件区域 */
    // 试题分类区域
    renderQuestionListClassifyHtml = () => {
        let questionType = getQUestionType();
        return (
            <Tabs
                defaultActiveKey={this.state.selectQuestionType}
                type="card"
                tabBarGutter={10}
                onChange={this.tabsChange}
            >
                {questionType.map((item) => {
                    return (
                        <Tabs.TabPane
                            tab={item.label}
                            key={item.value}
                        ></Tabs.TabPane>
                    );
                })}
            </Tabs>
        );
    };

    /**
     * 答案列表的选项
     * @param {当前是哪个数据} item
     * @param {当前是第几个} ind
     * @param {当前数据的key} key
     * @param {全部的选项数据} choiceList
     */
    renderQuestionItemAnswerOptionHtml = (item, ind, key, choiceList) => {
        return (
            <div className="importQuestionAnswerItem">
                <div className="importQuestionAnswerItemLeft">{key}：</div>
                <Input
                    className="importQuestionAnswerInput"
                    key={key}
                    value={choiceList[key]}
                    disabled={item.questionTypeId == 3}
                    allowClear
                    suffix={
                        <MinusCircleFilled
                            onClick={this.addDeleteOptionList.bind(
                                this,
                                ind,
                                'delete',
                                key,
                            )}
                            style={{ fontSize: '18px', color: '#F56C6C' }}
                        />
                    }
                    onChange={this.questionChangeData.bind(
                        this,
                        ind,
                        'option',
                        key,
                    )}
                    placeholder="请输入选项"
                ></Input>
            </div>
        );
    };

    /**
     * 显示答案列表
     * @param {当前操作的数据} item
     * @param {当前操作的是第几个} ind
     */
    renderQuestionItemAnswerHtml = (item, ind) => {
        let content = item.content || {},
            choiceList = content.choiceList || {},
            optionList = Object.keys(choiceList);
        // 判断当前是否为判断题
        if (item.questionTypeId == 3) {
            choiceList = { T: '正确', F: '错误' };
            optionList = ['T', 'F'];
        }
        return (
            <div className="importQuestionAnswer">
                <div className="importQuestionAnswerLeft">答案列表：</div>
                {item.questionTypeId == 4 ? (
                    ''
                ) : item.questionTypeId == 2 ? (
                    <Checkbox.Group
                        onChange={this.questionChangeData.bind(
                            this,
                            ind,
                            'checkbox',
                            '',
                        )}
                        className="importQuestionAnswerRight"
                        value={item.answer}
                    >
                        {optionList.map((key) => (
                            <Checkbox key={key} value={key}>
                                {this.renderQuestionItemAnswerOptionHtml(
                                    item,
                                    ind,
                                    key,
                                    choiceList,
                                )}
                            </Checkbox>
                        ))}
                        <PlusCircleFilled
                            onClick={this.addDeleteOptionList.bind(
                                this,
                                ind,
                                'add',
                            )}
                            style={{ fontSize: '18px', color: '#000' }}
                        />
                    </Checkbox.Group>
                ) : (
                    <Radio.Group
                        onChange={this.questionChangeData.bind(
                            this,
                            ind,
                            'radio',
                            '',
                        )}
                        className="importQuestionAnswerRight"
                        value={item.answer}
                    >
                        {optionList.map((key) => (
                            <Radio key={key} value={key}>
                                {this.renderQuestionItemAnswerOptionHtml(
                                    item,
                                    ind,
                                    key,
                                    choiceList,
                                )}
                            </Radio>
                        ))}
                        <PlusCircleFilled
                            onClick={this.addDeleteOptionList.bind(
                                this,
                                ind,
                                'add',
                                '',
                            )}
                            style={{ fontSize: '18px', color: '#000' }}
                        />
                    </Radio.Group>
                )}
            </div>
        );
    };

    /**
     * 单个试题数据
     * @param {当前数据} item
     * @param {当前是第几个数据} ind
     * @returns
     */
    renderQuestionItemDataHtml = (item, ind) => {
        return (
            <div key={ind} className="importQuestionItem">
                <div className="importQuestionTitle">
                    <div className="importQuestionTitleLeft">
                        {ind + 1}、标题：
                    </div>
                    <Input.TextArea
                        className="importQuestionTitleRIght"
                        onChange={this.questionChangeData.bind(
                            this,
                            ind,
                            'name',
                            '',
                        )}
                        value={item.name}
                        allowClear
                        placeholder="请输入试题名称"
                    ></Input.TextArea>
                </div>
                {this.renderQuestionItemAnswerHtml(item, ind)}
            </div>
        );
    };

    // 全部的试题列表
    renderQuestionListDataHtml = () => {
        return (
            <div className="importQuestionList">
                {this.state.showQuestionList.map((item, ind) => {
                    return this.renderQuestionItemDataHtml(item, ind);
                })}
            </div>
        );
    };

    /**
     * 试题列表
     */
    renderQuestionListHtml = () => {
        return (
            <div className="importQuestionArea">
                {this.renderQuestionListClassifyHtml()}
                {this.renderQuestionListDataHtml()}
                <Pagination
                    className="tableDataPagination"
                    total={this.state.currentPage}
                    pageSize={this.state.pageSize}
                    current={this.state.currentPage}
                    onChange={this.pageChange}
                    showSizeChanger={false}
                ></Pagination>
            </div>
        );
    };

    render() {
        console.log(this.state.popupModalList);
        return (
            <>
                {this.state.popupVisible ? (
                    <CommonModal
                        onRef={this.onRef}
                        popWidth={800}
                        title={this.state.popupTitle}
                        modalList={this.state.popupModalList}
                        okCallaBack={this.okCallaBack}
                        cancelCallBack={this.props.cancelCallBack}
                        okLoading={this.state.okLoading}
                        detailsModalData={this.state.popupModalData}
                    >
                        {this.renderQuestionListHtml()}
                    </CommonModal>
                ) : (
                    ''
                )}
            </>
        );
    }
}

export default ImportQuestion;
