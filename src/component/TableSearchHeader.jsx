/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-09 09:03:53
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-14 15:13:49
 * @FilePath: /examSystem/src/component/TableSearchHeader.jsx
 * @Description:
 */

import React from "react";
import { Input, Button, Select, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons"
import '@/scss/tableHeader.scss';

class TableSearchHeader extends React.Component{
    // 配置传递参数的默认值
    static defaultProps = {
        isShowSearch: true, // 是否显示搜索按钮
        searchBgColor: '', // 搜索按钮的背景颜色
        searchClick: function(){},
        searchList: [],
        btnList: [
            // name     按钮显示的文字
            // icon     按钮显示的图标
            // fun      按钮调用的方法
            // bgColor  背景颜色
        ],
    }
    constructor(props){
        super(props);
        this.state = {
            searchData: {}
        }
    }

    // 初始化声明周期
    componentDidMount(){}

    /// 方法
    /**
     * 输入框输入内
     * @param {当前操作的数据} item
     * @param {当前输入组件} e
     */
    inputChange = (item, e) => {
        let searchData = this.state.searchData;
        searchData[item.key] = e.target.value;
        this.setState({searchData})
    }

     /**
     * 时间选择器选择时间
     * @param {当前操作的数据} item
     * @param {当前选择的时间} date
     * @param {字符串类型的当前选择时间} dateString
     */
    dataPickerChange = (item, data, dataString) => {
        let searchData = this.state.searchData;
        searchData[item.key] = dataString;
        this.setState({searchData})
    }

    /**
     * 选择框选择数据
     * @param {当前操作的数据} item
     * @param {选择的key值} keys
     */
    selectSelect = (item, keys) => {}

    /**
     * 搜索点击确定
     */
    searchClick = () => {
        this.props.searchClick(this.state.searchData);
    }

    /**
     * 按钮点击
     * @param {当前操作的数据} item
     */
    clickBtn = (item) => {
        // 判断当前按钮是否存在点击事件
        if(item['fun']){
            item['fun']();
        }
    }

    /** 组件显示区域 */
    /**
     * 显示的输入框组件
     * @param {当前操作的数据} item
     * @returns 输入框组件
     */
    renderInputHtml = (item) => {
        return <Input size="large" placeholder={item.placeholder} onChange={this.inputChange.bind(this, item)}/>;
    }

    // 显示的选择输入框
    /**
     * 显示的选择输入框
     * @param {当前操作的数据} item
     * @returns 选择框组件
     */
    renderSelectHtml = (item) => {
        let fieldNames = item.fieldNames || {},
            mode = item.mode || 'tags';
        return <Select onSelect={this.selectSelect.bind(this, item)} allowClear fieldNames={fieldNames} mode={mode} options={item.options} placeholder={item.placeholder} size="large" showSearch></Select>
    }

    /**
     * 显示选择日期的选择框
     * @param {当前操作的数据} item
     * @returns 日期选择框组件
     */
    renderDataPickerHtml = (item) => {
        return <DatePicker onChange={this.dataPickerChange.bind(this, item)} allowClear placeholder={item.placeholder} picker={item.picker || 'date'} />
    }

    // 分类显示的组件
    renderHtml = (item) =>{
        switch (item.type) {
            case 'select':
                return this.renderSelectHtml(item);
            case 'dataPicker':
                return this.renderDataPickerHtml(item);
            default: return this.renderInputHtml(item);
        }
    }

    // 显示搜索按钮
    renderShowSearchBtnHtml = () => {
        return this.props.isShowSearch ? <Button size="large" style={{backgroundColor: this.props.searchBgColor, borderColor: this.props.searchBgColor}}
            type="primary" onClick={this.searchClick}><SearchOutlined />搜索</Button> : ''
    }

    // 显示的按钮
    renderBtnListHtml = () => {
        return this.props.btnList.map((item, index) => {
            return <Button size="large" style={{backgroundColor: item.bgColor, borderColor: item.bgColor}} key={index}
                type="primary" icon={item.icon} onClick={this.clickBtn.bind(this, item)}>{item.name}</Button>
        })
    }

    render(){
        return (
            <div className="tableSearchHeader">
                {this.props.searchList.map((item, index) => {
                    return <div key={index} className="tableSearchItem">
                        {this.renderHtml(item)}
                    </div>
                })}
                {this.renderShowSearchBtnHtml()}
                {this.renderBtnListHtml()}
            </div>
        )
    }
}

export default TableSearchHeader;
