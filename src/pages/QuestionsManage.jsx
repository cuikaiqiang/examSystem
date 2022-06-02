/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 16:23:44
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-22 09:24:41
 * @FilePath: /examSystem/src/pages/QuestionsManage.jsx
 * @Description:
 */

import React from 'react';
import {
    Tree,
    Table,
    Spin,
    Empty,
    Pagination,
    Space,
    Button,
    Modal,
    message,
} from 'antd';
import { PlusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import TableData from '../component/TableData';
import QuestionsItem from '../component/QuestionItem';
import {
    getClassifyList,
    getClassifyTree,
    getQuestionList,
    getClassifyDetails,
    getQuestionDetails,
} from '../network/requestFunction';
import CommonModal from '../component/CommonModal';
import TableSearchHeader from '../component/TableSearchHeader';
import '../scss/questionsManage.scss';
import dataServer from '../network/dataServer';
import {
    addClassifyPort,
    addQuestionPort,
    deleteClassifyPort,
    editClassifyPort,
    editQuestionPort,
    questionClassifyPort,
} from '../network/dataServerUrl';
import { getQuestionLevel, getQUestionType } from '../common/common';
import ImportQuestion from './ImportQuestion';

class QuestionsManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            classifyTreeData: [], // 分类树结构数据
            isLoading: true, // 是否正在加载中
            selectClassifyItem: { childrenType: 1 }, // 选中的分类(childrenType: 0：没有子级、1：子级为分类类型、2：子级为试题  nodeType: 大于0时为特殊字段分类，等于0时为普通字段)
            page: 1, // 每页多少数据
            limit: 10, // 每页几条数据
            tableList: [], // 请求到的列表数据
            tableListAll: 0, // 全部有多多少条数据
            /** 弹窗数据 */
            popupData: {}, // 当前操作的数据是哪个
            popupType: '', // 弹窗中显示的内容
            popupVisible: false, // 是否显示弹窗
            popupTitle: '', // 弹窗显示的标题
            popupModalList: [], // 弹窗中显示的列表数据
            popupModalData: {}, // 弹窗中显示的列表数据选择的数据
            okLoading: false, // 弹窗确定按钮是否加载中
            /** 导入试题弹窗 */
            importPopupVisible: false,
        };
    }

    // 初始化声明周期
    componentDidMount() {
        this.requestClassifyTree();
        this.requestTableList();
    }

    /** 方法 */
    /**
     * 初始化请求树类型结构
     */
    requestClassifyTree = async () => {
        let classifyTree = await getClassifyTree(0);
        this.setState({
            classifyTreeData: classifyTree,
        });
    };

    /**
     * 获取请求地址和参数
     * @returns 返回请求参数
     */
    getRequestUrl = () => {
        let selectClassifyItem = this.state.selectClassifyItem, // 获取当期选中的分类
            reqData = { page: this.state.page, limit: this.state.limit }; // 获取请求数据的基本字段
        // 判断当前分类下是否存在数据了
        if (!selectClassifyItem.childrenType) return false;
        // 当前分类下存在分类则将添加父级id字段
        if (selectClassifyItem.childrenType == 1) {
            reqData.parentId = selectClassifyItem.questionCategoryId || 0;
            // 当前分类下存在试题 则将当前分类的id传递
        } else {
            reqData.questionCategoryId =
                selectClassifyItem.questionCategoryId || 0;
        }
        return reqData;
    };

    /**
     * 请求列表数据
     */
    requestTableList = async () => {
        let reqData = this.getRequestUrl(),
            tableList = [],
            tableListAll = 0,
            selectClassifyItem = this.state.selectClassifyItem; // 获取当期选中的分类;
        this.setState({ isLoading: true }); // 加载loading
        // 判断是加载分类还是加载试题
        if (selectClassifyItem.childrenType == 1) {
            let res = await getClassifyList(reqData);
            tableList = res;
            tableListAll = res.length;
        } else {
            let res = await getQuestionList(reqData);
            tableList = res.tableList;
            tableListAll = res.total || 0;
        }
        this.setState({
            tableList,
            tableListAll,
            isLoading: false,
        });
    };

    /**
     * 修改页数
     * @param {当前页数} page
     * @param {每页多少条数据} pageSize
     */
    pageChange = (page, pageSize) => {
        this.setState(
            {
                page: page,
                limit: pageSize,
            },
            () => {
                this.requestTableList();
            },
        );
    };

    /**
     * 选择树形节点
     * @param {树节点选择的key} selectedKeys
     * @param {当前组件} e
     */
    treeSelect = (selectedKeys, e) => {
        let selectClassifyItem = this.state.selectClassifyItem; // 获取当前选中的分类数据
        // 判断当前点击的分类是为已经选中的分类
        if (
            e.node.questionCategoryId == selectClassifyItem.questionCategoryId
        ) {
            selectClassifyItem = { childrenType: 1 };
        } else {
            selectClassifyItem = e.node;
        }
        this.setState(
            {
                selectClassifyItem,
                page: 1,
                tableListAll: 0,
                tableList: [],
            },
            () => {
                this.requestTableList();
            },
        );
    };

    /**
     * 添加或者编辑试题分类
     * @param {操作类型} type
     * @param {当前操作的是哪个数据} item
     */
    classifyOperation = async (type, item) => {
        // 弹窗标题           弹窗类型          弹窗的数据            获取选中的分类                                是否禁用
        let popupTitle = '',
            popupType = '',
            popupModalData = {},
            selectItem = this.state.selectClassifyItem,
            disabled = false;
        // 判断是添加分类还是编辑分类
        if (type == 'add') {
            popupTitle = '添加分类';
            popupType = 'addClassify';
            popupModalData = { isDel: 1 };
        } else {
            popupTitle = '编辑分类';
            popupType = 'editClassify';
            popupModalData = await getClassifyDetails(item.questionCategoryId);
        }
        if (selectItem.nodeType == 1) {
            popupModalData.type = 3;
            disabled = true;
        } else if (selectItem.childrenType == 1) {
            popupModalData.type = 2;
            disabled = true;
        }
        this.setState({
            popupVisible: true,
            popupModalList: [
                {
                    name: '分类名称',
                    type: 'input',
                    key: 'name',
                    required: true,
                    placeholder: '请输入分类名称',
                },
                {
                    name: '是否可删除',
                    type: 'radio',
                    key: 'isDel',
                    childList: [
                        { label: '可删除', value: 1 },
                        { label: '不可删除', value: 0 },
                    ],
                },
                {
                    name: '节点类型',
                    type: 'radio',
                    disabled: disabled,
                    key: 'type',
                    childList: [
                        { label: '机构（省公司、厂级）', value: 1 },
                        { label: '题库类型', value: 2 },
                        { label: '部门', value: 3 },
                    ],
                },
            ], // 弹窗中显示的列表数据
            popupModalData, // 弹窗中显示的列表数据选择的数据
            popupTitle,
            popupType,
        });
    };

    /**
     * 删除题库分类
     * @param {当前操作的数据} item
     */
    deleteClassify = (item) => {
        Modal.confirm({
            title: '删除分类',
            content: '确定删除该分类?',
            onOk: () => {
                dataServer
                    .getData(deleteClassifyPort + item.questionCategoryId)
                    .then((res) => {
                        message.success('删除分类成功');
                        this.requestClassifyTree();
                        this.requestTableList();
                    });
            },
        });
    };

    /**
     * 弹窗添加或者编辑题库分类
     * @param {弹窗中的数据} data
     */
    popupClassifyConfirm = (data) => {
        let reqData = JSON.parse(JSON.stringify(data)), // 深拷贝弹窗数据
            reqUrl = '',
            messageTitle = ''; // 声明请求参数和提示语
        // 判断是新增分类还是编辑分类
        if (this.state.popupType == 'addClassify') {
            reqUrl = addClassifyPort;
            reqData.parentId = this.state.selectClassifyItem.questionCategoryId;
            messageTitle = '新增分类成功';
        } else {
            reqUrl = editClassifyPort;
            messageTitle = '编辑分类成功';
        }
        dataServer.postData(reqUrl, reqData).then((res) => {
            message.success(messageTitle);
            this.requestClassifyTree();
            this.requestTableList();
            this.cancelCallBack();
        });
    };

    /**
     * 新增编辑试题
     * @param {操作类型} type
     * @param {当前操作的数据} item
     */
    questionOperation = async (type, item) => {
        // 声明弹窗标题        弹窗类型         弹窗中的数据
        let popupTitle = '',
            popupType = '',
            popupModalData = {};
        // 判断当前是添加试题还是编辑试题
        if (type == 'add') {
            popupTitle = '添加试题';
            popupType = 'addQuestion';
            popupModalData = {
                difficulty: 1,
                questionTypeId: 1,
            };
        } else {
            popupTitle = '编辑试题';
            popupType = 'editQuestion';
            popupModalData = await getQuestionDetails(item.id);
        }
        this.setState({
            popupVisible: true,
            popupModalList: [
                {
                    name: '难易度',
                    type: 'select',
                    key: 'difficulty',
                    required: true,
                    placeholder: '请选择难易度',
                    childList: [
                        { label: '简单', value: 1 },
                        { label: '中等', value: 2 },
                        { label: '困难', value: 3 },
                    ],
                },
                {
                    name: '试题等级',
                    type: 'radioList',
                    key: 'levels',
                    required: true,
                    childList: getQuestionLevel(),
                },
                {
                    name: '试题类型',
                    type: 'radio',
                    key: 'questionTypeId',
                    childList: getQUestionType(),
                },
                {
                    name: '题库分类',
                    type: 'tree',
                    key: 'questionCategoryItemsList',
                    reqDataUrl: questionClassifyPort + 0,
                    fieldNames: {
                        title: 'name',
                        key: 'questionCategoryId',
                        children: 'children',
                    },
                },
                {
                    name: '试题内容',
                    type: 'input',
                    inputType: 'textarea',
                    key: 'name',
                    required: true,
                    placeholder: '请输入试题内容',
                },
                {
                    name: '选项',
                    type: 'optionInputList',
                    key: 'optionList',
                    changeKey: ['answer', 'answerCheck'],
                    showKey: 'questionTypeId',
                    showValue: [1, 2],
                    required: true,
                    placeholder: '请输入选项内容',
                },
                {
                    name: '正确答案',
                    type: 'radio',
                    key: 'answer',
                    required: true,
                    showKey: 'questionTypeId',
                    showValue: 1,
                    childListField: 'questionOptionList',
                },
                {
                    name: '正确答案',
                    type: 'checkBox',
                    key: 'answerCheck',
                    required: true,
                    showKey: 'questionTypeId',
                    showValue: 2,
                    childListField: 'questionOptionList',
                },
                {
                    name: '正确答案',
                    type: 'radio',
                    key: 'answer',
                    required: true,
                    showKey: 'questionTypeId',
                    showValue: 3,
                    childList: [
                        { label: '正确', value: 'T' },
                        { label: '错误', value: 'F' },
                    ],
                },
                {
                    name: '正确答案',
                    type: 'inputList',
                    key: 'answerFill',
                    required: true,
                    showKey: 'questionTypeId',
                    showValue: 4,
                    placeholder: '请输入正确答案',
                },
                {
                    name: '来源',
                    type: 'input',
                    key: 'referenceName',
                    placeholder: '请输入试题来源',
                },
                {
                    name: '考点',
                    type: 'input',
                    key: 'examingPoint',
                    placeholder: '请输入试题考点',
                },
                {
                    name: '关键字',
                    type: 'input',
                    key: 'keyword',
                    placeholder: '请输入试题关键字',
                },
                {
                    name: '题目解析',
                    type: 'input',
                    inputType: 'textarea',
                    key: 'analysis',
                    placeholder: '请输入试题解析',
                },
            ], // 弹窗中显示的列表数据
            popupModalData, // 弹窗中显示的列表数据选择的数据
            popupTitle,
            popupType,
        });
    };

    /**
     * 提交试题处理
     * @param {试题详情数据} questionData
     * @returns 处理过的详情数据
     */
    disposeQuestionConfirmData = (questionData) => {
        // 声明content的值并给他赋值对用的数据
        let content = {
            title: questionData.name,
            titleImg: '',
            choiceList: questionData.optionList,
            choiceImgList: '',
        };
        questionData.content = JSON.stringify(content);
        // 题库分类数据
        let questionCategoryList = questionData.questionCategoryItemsList || [];
        if (questionCategoryList.length > 0) {
            questionData.questionCategoryItems =
                ',' + questionCategoryList.join(',') + ',';
        }
        // 如果当前选择的是多选题 则需要修改他的答案
        if (questionData.questionTypeId == 2) {
            questionData.answer = questionData.answerCheck.join('');
            // 如果当前选择的是填空题 则修改他的答案
        } else if (questionData.questionTypeId == 4) {
            questionData.answer = JSON.stringify(questionData.answerFill);
        }
        // 获取等级数据               提取等级对象中的key                 后台需要的等级数据
        let levels = questionData.levels,
            levelsKey = Object.keys(levels),
            strLevels = ',';
        for (let i = 0; i < levelsKey.length; i++) {
            strLevels += levelsKey[i] + '=' + levels[levelsKey[i]] + ',';
        }
        questionData.levels = strLevels;
        return questionData;
    };

    /**
     * 导入试题
     */
    importQuestionData = () => {
        this.setState({
            importPopupVisible: true,
            popupType: 'import',
        });
    };

    /**
     * 弹窗中的试题点击确定
     * @param {弹窗中的数据} questionData
     */
    popupQuestionConfirm = (questionData) => {
        let reqData = JSON.parse(JSON.stringify(questionData)), // 深拷贝弹窗数据
            reqUrl = '',
            messageTitle = ''; // 声明请求参数和提示语
        // 判断是新增分类还是编辑分类
        if (this.state.popupType == 'addQuestion') {
            reqUrl = addQuestionPort;
            reqData.questionCategoryId =
                this.state.selectClassifyItem.questionCategoryId;
            messageTitle = '新增试题成功';
        } else {
            reqUrl = editQuestionPort;
            messageTitle = '编辑试题成功';
        }
        reqData = this.disposeQuestionConfirmData(reqData);
        dataServer.postData(reqUrl, reqData).then((res) => {
            message.success(messageTitle);
            this.requestTableList();
            this.cancelCallBack();
        });
    };

    /**
     * 弹窗点击确定
     * @param {弹窗中的数据} data
     */
    okCallaBack = (data) => {
        this.setState({ okLoading: true });
        switch (this.state.popupType) {
            case 'addClassify':
            case 'editClassify':
                this.popupClassifyConfirm(data);
                break;
            case 'editQuestion':
            case 'addQuestion':
                this.popupQuestionConfirm(data);
                break;
        }
    };

    /**
     * 关闭弹窗
     */
    cancelCallBack = () => {
        this.setState({
            popupVisible: false,
            okLoading: false,
            importPopupVisible: false,
        });
    };

    /** 组件相关方法 */
    // 顶部显示的按钮
    headerBtnShowHtml = () => {
        let btnList = [],
            selectItem = this.state.selectClassifyItem;
        // 判断当前是否为特殊要求的分类
        if (selectItem.nodeType > 0) {
            // 判断当前是否为特殊分类这一级
            if (selectItem.nodeType == 1) {
                btnList = [
                    {
                        name: '添加部门',
                        icon: <PlusCircleOutlined />,
                        bgColor: '#59BCE8',
                        fun: this.classifyOperation.bind(this, 'add'),
                    },
                ];
                // 判断当前是否为特殊分类下的部门
            } else if (selectItem.nodeType == 2) {
                btnList = [
                    {
                        name: '添加分类',
                        icon: <PlusCircleOutlined />,
                        bgColor: '#59BCE8',
                        fun: this.classifyOperation.bind(this, 'add'),
                    },
                    {
                        name: '导入试题',
                        icon: <UploadOutlined />,
                        bgColor: '#59BCE8',
                        fun: this.importQuestionData,
                    },
                ];
                // 特殊分类下的第三级显示添加试题
            } else {
                btnList = [
                    {
                        name: '添加试题',
                        icon: <PlusCircleOutlined />,
                        bgColor: '#59BCE8',
                        fun: this.questionOperation.bind(this, 'add'),
                    },
                ];
            }
        } else if (selectItem.questionCategoryId) {
            // 判断子级不是试题类型
            if (selectItem.childrenType != 2) {
                btnList.push({
                    name: '添加分类',
                    icon: <PlusCircleOutlined />,
                    bgColor: '#59BCE8',
                    fun: this.classifyOperation.bind(this, 'add'),
                }),
                    btnList.push({
                        name: '导入试题',
                        icon: <UploadOutlined />,
                        bgColor: '#59BCE8',
                        fun: this.importQuestionData,
                    });
            }
            // 判断子级不是分类类型
            if (selectItem.childrenType != 1) {
                btnList.push({
                    name: '添加试题',
                    icon: <PlusCircleOutlined />,
                    bgColor: '#59BCE8',
                    fun: this.questionOperation.bind(this, 'add'),
                });
            }
        }
        if (btnList.length > 0) {
            return (
                <TableSearchHeader
                    isShowSearch={false}
                    btnList={btnList}
                ></TableSearchHeader>
            );
        }
    };

    // 试题列表
    renderMainShowQuestionList = () => {
        return (
            <>
                <div className="questionMainList"></div>
                {this.state.tableList.map((item, index) => {
                    return (
                        <QuestionsItem
                            key={item.id}
                            editQuestion={this.questionOperation.bind(
                                this,
                                'edit',
                            )}
                            requestData={this.requestTableList}
                            itemIndex={index}
                            itemData={item}
                        ></QuestionsItem>
                    );
                })}
                <Pagination
                    className="tableDataPagination"
                    total={this.state.tableListAll}
                    pageSize={10}
                    current={this.state.page}
                    onChange={this.pageChange}
                    showSizeChanger={false}
                ></Pagination>
            </>
        );
    };

    // table表格中分类类型显示的数据
    renderClassifyTypeShowData = (type) => {
        switch (type) {
            case 1:
                return '机构（省公司、厂级）';
            case 2:
                return '分类';
            case 3:
                return '部门';
            default:
                return '';
        }
    };

    // 题库分类操作显示的按钮
    renderClassifyOperateHtml = (text, record) => {
        return (
            <Space>
                {record.nodeType == 1 || record.parentId == 0 ? (
                    ''
                ) : (
                    <Button
                        onClick={this.classifyOperation.bind(
                            this,
                            'edit',
                            record,
                        )}
                        type="primary"
                    >
                        编辑
                    </Button>
                )}
                {record.isDel ? (
                    <Button
                        onClick={this.deleteClassify.bind(this, record)}
                        type="primary"
                        danger
                    >
                        删除
                    </Button>
                ) : (
                    ''
                )}
            </Space>
        );
    };

    // 内容区域显示的是分类还是试题
    renderMainShowHtml = () => {
        switch (this.state.selectClassifyItem.childrenType) {
            case 1:
                return (
                    <TableData
                        rowKey="questionCategoryId"
                        tableListAll={this.state.tableListAll}
                        isShowPagination={false}
                        tableList={this.state.tableList}
                    >
                        <Table.Column
                            title="分类id"
                            dataIndex="questionCategoryId"
                        ></Table.Column>
                        <Table.Column
                            title="分类名称"
                            dataIndex="name"
                        ></Table.Column>
                        <Table.Column
                            title="分类类型"
                            dataIndex="type"
                            render={(type) => {
                                return this.renderClassifyTypeShowData(type);
                            }}
                        ></Table.Column>
                        <Table.Column
                            title="操作"
                            render={this.renderClassifyOperateHtml}
                        ></Table.Column>
                    </TableData>
                );
            case 2:
                return (
                    <div className="questionMain">
                        {this.state.tableList.length > 0 ? (
                            this.renderMainShowQuestionList()
                        ) : (
                            <div className="questionsManageEmpty">
                                <Empty />
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="questionsManageEmpty">
                        <Empty />
                    </div>
                );
        }
    };

    render() {
        return (
            <div className="questionsManage">
                <div className="questionsManageLeft">
                    <Tree
                        fieldNames={{
                            title: 'name',
                            key: 'questionCategoryId',
                        }}
                        onSelect={this.treeSelect}
                        treeData={this.state.classifyTreeData}
                    />
                </div>
                <div className="questionsManageRight">
                    {this.headerBtnShowHtml()}
                    <div className="questionsManageTable">
                        <Spin spinning={this.state.isLoading}>
                            {this.renderMainShowHtml()}
                        </Spin>
                    </div>
                </div>
                {this.state.popupVisible ? (
                    <CommonModal
                        title={this.state.popupTitle}
                        modalList={this.state.popupModalList}
                        okCallaBack={this.okCallaBack}
                        cancelCallBack={this.cancelCallBack}
                        okLoading={this.state.okLoading}
                        detailsModalData={this.state.popupModalData}
                    ></CommonModal>
                ) : (
                    ''
                )}
                {this.state.importPopupVisible ? (
                    <ImportQuestion
                        parentId={
                            this.state.selectClassifyItem.questionCategoryId
                        }
                        okCallaBack={this.okCallaBack}
                        cancelCallBack={this.cancelCallBack}
                    ></ImportQuestion>
                ) : (
                    ''
                )}
            </div>
        );
    }
}

export default QuestionsManage;
