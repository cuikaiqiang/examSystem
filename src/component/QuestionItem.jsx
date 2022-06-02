/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-21 15:50:43
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-20 16:51:10
 * @FilePath: /examSystem/src/component/QuestionItem.jsx
 * @Description:
 */
import React from 'react';
import { Modal, InputNumber, Button } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    CheckCircleFilled,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import '../scss/questionItem.scss';
import { deleteQuestions } from '../network/requestFunction';

class QuestionsItem extends React.Component {
    static defaultProps = {
        editQuestion: function () {}, // 编辑试题
        requestData: function () {}, // 重新请求数据
        deleteScoreQuestion: function () {}, // 和分数一块显示的删除按钮
        clickQuestion: function () {}, // 点击试题
        itemIndex: '', // 当前是第几个试题
        itemData: {}, // 试题内容
        isShowBtn: true, // 是否显示操作按钮
        isShowScore: false, // 是否显示分数
        isSelected: false, // 当前是否为选中状态
    };
    constructor(props) {
        super(props);
        this.state = {};
    }

    /** 方法区域 */
    /**
     * 编辑试题
     */
    editQuestion = () => {
        this.props.editQuestion(this.props.itemData);
    };

    /**
     * 删除试题
     */
    deleteQuestion = () => {
        let that = this;
        Modal.confirm({
            title: '确定删除此试题?',
            icon: <ExclamationCircleOutlined />,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                deleteQuestions(that.props.itemData, () => {
                    message.success('试题删除成功');
                    this.props.requestData();
                });
            },
        });
    };

    /**
     * 和分数一块显示的删除按钮
     */
    deleteScoreQuestion = () => {
        this.props.deleteScoreQuestion(this.props.itemData);
    };

    /** 组件方法 */
    // 选项区域显示
    renderOption() {
        let answer = this.props.itemData.answer,
            choiceList = this.props.itemData.content.choiceList ?? {},
            option = Object.keys(choiceList);
        return (
            <div className="questionOption">
                {option.map((item, index) => {
                    return (
                        <div key={index} className="questionOptionItem">
                            <CheckCircleFilled
                                className={{
                                    questionOptionPitch: answer.includes(item),
                                }}
                            />
                            {item}：{choiceList[item]}
                        </div>
                    );
                })}
            </div>
        );
    }

    render() {
        return (
            <div
                className={[
                    'questionItem',
                    this.props.isSelected ? 'questionItemSelected' : '',
                ].join(' ')}
                onClick={() => this.props.clickQuestion(this.props.itemData)}
            >
                <div className="questionHeader">
                    <div className="questionType">
                        {this.props.itemData.questionTypeName}
                    </div>
                    <div className="questionTime">
                        {this.props.itemData.createTime}
                    </div>
                    <div className="questionType questionLevel">
                        {this.props.itemData.levels}
                    </div>
                    {this.props.isShowBtn ? (
                        <div className="questionBtn">
                            <EditOutlined onClick={this.editQuestion} />{' '}
                            <DeleteOutlined onClick={this.deleteQuestion} />
                        </div>
                    ) : (
                        ''
                    )}
                    {this.props.isShowScore ? (
                        <div className="questionScore">
                            <InputNumber
                                size="small"
                                value={this.props.itemData.questionPoint || 0}
                            ></InputNumber>
                            <Button
                                className="questionScoreDelete"
                                size="small"
                                onClick={this.deleteScoreQuestion}
                                type="primary"
                            >
                                删除试题
                            </Button>
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <div className="questionTitle">
                    {this.props.itemIndex + 1}.{this.props.itemData.name}
                </div>
                {this.renderOption()}
                <div className="questionTitle questionAnswer">
                    答案：{this.props.itemData.answer}
                </div>
            </div>
        );
    }
}

export default QuestionsItem;
