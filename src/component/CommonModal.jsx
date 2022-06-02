/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-31 11:49:22
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-22 15:27:11
 * @FilePath: /examSystem/src/component/CommonModal.jsx
 * @Description:
 */
import React from 'react';
import { Modal, message, Spin } from 'antd';
import ModalListPage from './ModalListPage';
import dataServer from '../network/dataServer';
import '../scss/commonModal.scss';
import { judgeItemShow } from '../common/common';

class CommonModal extends React.Component {
    static defaultProps = {
        onRef: function () {}, // 将当前组件传递给父组件
        detailsModalData: {}, // 默认已经选择的数据
        popWidth: 800, // 弹窗宽度
        title: ' 提示', // 弹窗的标题
        cancelText: '取消', // 取消按钮的文字
        okText: '确定', // 确定按钮文字
        okLoading: true, // 确定按钮加载中
        okCallaBack: function () {}, // 确定按钮的回调函数
        cancelCallBack: function () {}, // 取消按钮的回调函数
        footer: undefined, // 底部显示按钮
        modalList: [], // 弹窗默认显示的了列表类型的数据
    };
    constructor(props) {
        super(props);
        this.state = {
            spinLoading: false, // 是否加载中
            copyModalList: [],
            modalData: {}, // 弹窗中已经选择数据
        };
    }

    componentDidMount() {
        this.props.onRef(this);
        this.init();
    }

    /** 方法函数 */
    /**
     * 初始化方法
     */
    init = async () => {
        let modalList = this.props.modalList, // 获取弹窗中的数据列表
            detailsModalData = this.props.detailsModalData; // 获取弹窗中的已经选择的值
        // 判断当前是否存在数据列表
        if (modalList.length > 0) {
            // 设置加载中
            this.setState({ spinLoading: true });
            let copyModalList = this.deepClone1(modalList), // 深拷贝数据列表
                modalData = this.deepClone1(detailsModalData); // 深拷贝已经选择的市监局
            // 循环全部的数据列表
            for (let i = 0; i < copyModalList.length; i++) {
                // 获取当前循环项
                let modalItem = copyModalList[i];
                // 判断当期项是否需要请求数据 并且不需要依据其他项
                if (modalItem.reqDataUrl && !modalItem.reqDataKey) {
                    // 请求子元素数据
                    let childList = await this.requestListData(
                        modalItem.reqDataUrl,
                    );
                    // 如果当前是select数据 则进行特殊处理
                    if (['select', 'selectPaper'].includes(modalItem.type)) {
                        childList = this.disposeSelectData(
                            childList,
                            modalItem,
                        );
                    }
                    modalItem.childList = childList;
                }
                copyModalList[i] = modalItem;
            }
            this.setState({
                spinLoading: false,
                copyModalList,
                modalData,
            });
        }
    };

    /**
     * 处理select数据
     * @param {select选项数据} childList
     * @param {当前是那一条数据} item
     * @returns 处理过的select选项数据
     */
    disposeSelectData = (childList, item) => {
        childList = childList || []; // 获取数据选项
        // 声明数据显示的内容
        let fieldNames = item.fieldNames || { label: 'name', value: 'id' };
        // 循环全部的子元素数据
        for (let i = 0; i < childList.length; i++) {
            // 获取当前循环项数据           声明新的当前循环项
            let childItem = childList[i],
                newChildItem = {};
            // 对当前循环项进行格式化显示
            newChildItem.label = childItem[fieldNames.label];
            newChildItem.value = childItem[fieldNames.value];
            childList[i] = newChildItem;
        }
        return childList;
    };

    /**
     * 深拷贝数据
     * @param {需要深拷贝的数据} obj
     * @returns 深拷贝过的数据
     */
    deepClone1 = (obj) => {
        //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
        var objClone = Array.isArray(obj) ? [] : {};
        //进行深拷贝的不能为空，并且是对象或者是
        if (obj && typeof obj === 'object') {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && typeof obj[key] === 'object') {
                        objClone[key] = this.deepClone1(obj[key]);
                    } else {
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    };

    /**
     * 请求数据
     * @param {请求地址} reqUrl
     * @returns 一个异步Promise方法
     */
    requestListData = (reqUrl) => {
        return new Promise((resolve, reject) => {
            dataServer.getData(reqUrl, {}).then((res) => {
                resolve(res);
            });
        });
    };

    /**
     * 关联下级
     * @param {需要关联的子项数据} item
     */
    linkageChild = async (item) => {
        let copyModalList = this.state.copyModalList, // 获取全部的列表选择项
            linkageItem = copyModalList[item.linkage], // 获取当前关联项
            modalData = this.state.modalData, // 获取当前选择项
            itemKey = modalData[linkageItem.reqDataKey],
            childList = []; // 获取当前数据的子项
        // 判断当前项需要的请求参数是否存在
        if (itemKey) {
            childList = await this.requestListData(
                linkageItem.reqDataUrl + itemKey,
            );
            // 如果当前是select数据 则进行特殊处理
            if (['select', 'selectPaper'].includes(linkageItem.type)) {
                childList = this.disposeSelectData(childList, linkageItem);
            }
        }
        // 对当前项进行赋值
        linkageItem.childList = childList;
        copyModalList[item.linkage] = linkageItem;
        modalData[linkageItem.key] = undefined;
        this.setState({ modalData, copyModalList }, () => {
            // 判断当前项是否还存在关联项
            if (linkageItem.linkage) {
                this.linkageChild(linkageItem);
            }
        });
    };

    /**
     * 修改弹窗中选择数据
     * @param {弹窗中修改的数据} data
     * @param {关联的下级数据} item
     */
    changeModalData = (data, item) => {
        this.setState(
            {
                modalData: data,
            },
            () => {
                if (item && item.linkage) {
                    this.linkageChild(item);
                }
            },
        );
    };

    /**
     * 点击确定
     */
    clickOk = () => {
        let modalData = this.state.modalData, // 获取弹窗中的数据
            copyModalList = this.state.copyModalList; // 获取弹窗中的列表类数据
        // 循环全部的列表类数据
        for (let i = 0; i < copyModalList.length; i++) {
            let modalItem = copyModalList[i], // 获取当前循环项
                itemKeyData = modalData[modalItem.key]; // 获取当前项选择的值
            // 判断当前项是否必填并且不是为空
            if (
                judgeItemShow(modalItem, this.state.modalData) &&
                modalItem.required &&
                !itemKeyData
            ) {
                message.error(modalItem.name + '不能为空');
                return false;
            }
        }
        this.props.okCallaBack(this.state.modalData);
    };

    render() {
        return (
            <Modal
                width={this.props.popWidth}
                className="commonModal"
                destroyOnClose={true}
                centered={true}
                maskClosable={false}
                footer={this.props.footer}
                visible={true}
                onOk={this.clickOk}
                onCancel={this.props.cancelCallBack}
                confirmLoading={this.props.okLoading}
                title={this.props.title}
                cancelText={this.props.cancelText}
                okText={this.props.okText}
            >
                <Spin spinning={this.state.spinLoading}>
                    {this.props.modalList.length > 0 ? (
                        <ModalListPage
                            modalList={this.state.copyModalList}
                            modalData={this.state.modalData}
                            changeModalData={this.changeModalData}
                        ></ModalListPage>
                    ) : (
                        this.props.children
                    )}
                </Spin>
            </Modal>
        );
    }
}

export default CommonModal;
