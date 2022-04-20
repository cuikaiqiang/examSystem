/*
 * @Author: cuikaiqiang
 * @Date: 2022-04-07 10:43:57
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 17:03:57
 * @FilePath: /examSystem/src/component/ModalListPage.jsx
 * @Description:
 */
import React from "react";
import moment from 'moment';
import { Input, Select, DatePicker, TimePicker, Button, Switch, Tree, Cascader, InputNumber, Radio, Checkbox } from "antd";
import { PlusCircleFilled, MinusCircleFilled } from "@ant-design/icons";
import '../scss/modalListPage.scss';
import { getQuestionTypesNumber } from "../network/requestFunction";

class ModalListPage extends React.Component{
    static defaultProps = {
        modalData: {}, // 弹窗中选择的数据
        changeModalData: function(){}, // 修改弹窗中的数据
        modalList: [
            // required         当前是否为必填项
            // name             当前需要填写名称
            // key              当前需要填写的key
            // type             当前组件的类型
            // linkage          当前组件的关联项
            // reqDataUrl       当前组件是否需要请求数据
            // reqDataKey       当前组件请求数据的参数
            // placeholder      当前组件的提示语
            // disabled         当前组件是否禁用
            // childList        当前组件的选择项
            // childListField   当前组件的选择项占用的key
            // fieldNames       显示的标题和value
            // changeKey        当前组件会修改的其他key值
            // showKey          当前项根据那个key显示
            // showValue        key的值是多少的时候显示
            /** input独有 */
            // addonAfter       后置标签
            // addonBefore      前置标签
            // prefix           前缀图标
            // suffix           后缀图标
            // inputType        输入框类型
            // rows         textarea输入框行数
            /** select独有 */
            /** cascader独有 */
            // multiple         是否支持多选
            /** selectPaper独有 */
            // btnClick         点击按钮事件
            /** switch开关独有 */
            // checked          switch选中时的文字
            // unChecked        switch关闭时的文字
            /** 选择时间独有 */
            // timeType         时间选择器类型
            /** 树形控件独有 */

        ],
    }
    constructor(props){
        super(props);
        this.state = {
            questionOptionList: [{label: 'A', value: 'A'},{label: 'B', value: 'B'},{label: 'C', value: 'C'},{label: 'D', value: 'D'}]
        }
    }

    /** 方法函数 */
    /**
     * 禁止选择数据时间
     * @param {当前时间} current
     * @returns 当前时间是否可选
     */
    disabledDate = (current) => {
        return current && current < moment().endOf('day');
    }

    /**
     * 获取当前项下的子元素
     * @param {当前操作的数据} item
     */
    getChildListData = (item) => {
        let childList = []; // 声明子元素数据
        // 判断当前项是否显示为特殊的子元素数据
        if(item.childListField){
            childList = this.state.questionOptionList || [];
        }else{
            childList = item.childList || [];
        }
        return childList;
    }

    /**
     * 判断当前项是否显示
     * @param {当前操作的数据} item
     * @returns 是否显示
     */
    judgeItemShow = (item) => {
        // 判断当前项是否根据其他值显示隐藏
        if(item.showKey){
            // 获取当前项的根据值
            let showKeyData = this.props.modalData[item.showKey] || '',
                showValue = item.showValue;
            // 判断当前显示值的类型
            if(showValue instanceof Array){
                // 判断当前值是否存在并且是否和当前项显示时的值一样
                if(showKeyData && showValue.includes(showKeyData)){
                    return true;
                }else{
                    return false;
                }
            }else{
                // 判断当前值是否存在并且是否和当前项显示时的值一样
                if(showKeyData && showKeyData == showValue){
                    return true;
                }else{
                    return false;
                }
            }
        }else{
            return true;
        }
    }

    /**
     * 修改其他key的通用方法
     * @param {当前操作的数据} item
     * @param {弹窗中已经选择或者填写的数据}
     * @returns 修改过的弹窗中选择或者填写的数据
     */
    changeKeyGeneral = async(item, modalData) => {
        // 判断当前项是修改的那个key值
        if(item.changeKey == 'questionTypesNumber'){
            modalData[item.changeKey] = await getQuestionTypesNumber(modalData);
        }else{
            // 获取当前修改的key
            let changeKey = item.changeKey;
            // 判断是否修改多个key
            if(changeKey instanceof Array){
                // 循环全部需要修改的key 并将每一项都重置为空
                for(let i = 0; i < changeKey.length; i++){
                    modalData[changeKey[i]] = '';
                }
            }else{
                // 将修改的key重置为空
                modalData[changeKey] = '';
            }
        }
        return modalData
    }

    /**
     * 通用选择数据(select、switch、tree、cascader)
     * @param {当前操作的数据} item
     * @param {选择或者输入的值} value
     */
    generalDataChange = async(item, value) => {
        console.log(value)
        let modalData = this.props.modalData; // 获取弹窗已经填写的数据
        modalData[item.key] = value; // 给当前项的key赋值
        // 判断当前项是否存在修改其他的可以、值
        if(item.changeKey){
            modalData = await this.changeKeyGeneral(item, modalData);
        }
        this.props.changeModalData(modalData, item);
    }

    /**
     * 通用返回当前dom的选择数据
     * @param {当前操作的数据} item
     * @param {当前dom} e
     */
    generalDomChange = (item, e) => {
        // 获取全部已经填写的数据
        let modalData = this.props.modalData;
        // 当前项赋值
        modalData[item.key] = e.target.value;
        this.props.changeModalData(modalData, item);
    }

    /**
     * input输入内容
     * @param {当前操作的数据} item
     * @param {当前组件} e
     */
    inputChange = (item, type, e) => {
        // 获取全部的填写数据
        let modalData = this.props.modalData;
        // 判断当前输入框的类型 进行不同的赋值
        if(type == 'number'){
            modalData[item.key] = e;
        }else{
            modalData[item.key] = e.target.value;
        }
        this.props.changeModalData(modalData, item);
    }

    /**
     * 时间选择器选择时间
     * @param {当前操作的数据} item
     * @param {当前选择的时间} date
     * @param {字符串类型的当前选择时间} dateString
     */
    datePickerSectionChange = (item, date, dateString) => {
        // 获取全部的填写数据
        let modalData = this.props.modalData;
        // 对当前项进行赋值
        modalData[item.key] = dateString;
        this.props.changeModalData(modalData, item);
    }

    /**
     * 修改题型数量
     * @param {当前操作的数据} item
     * @param {当前操作的子数据} itemChild
     * @param {当前数据需要修改的数据} changeKey
     * @param {当前输入的值} val
     */
    inputQuestionTypeChange = (item, itemChild, changeKey, val) => {
        let modalData = this.props.modalData, // 获取全部的填写数据
            itemData = modalData[item.key] || {}, // 获取当前项填写的数据
            itemChangeKeyData = itemData[changeKey] || []; // 获取当前小项填写的数据
        // 对当前项进行赋值
        itemChangeKeyData[itemChild.value] = val;
        itemData[changeKey] = itemChangeKeyData;
        modalData[item.key] = itemData;
        // 判断是否需要修改其他的key值
        if(item.changeKey){
            modalData[item.changeKey] = this.questionTypeChangeKey(item, itemData);
        }
        this.props.changeModalData(modalData);
    }

    /**
     * 修改题型数量和分数触发的修改数据
     * @param {当前操作的数据} item
     * @param {当前的数据的key值} itemData
     * @returns 返回总分数
     */
    questionTypeChangeKey = (item, itemData) => {
        let totalPoint = 0, // 声明总分
            childList = this.getChildListData(item), // 获取当前项的子元素
            typesNumber = itemData.typesNumber || [], // 获取试题每种类型多少条数据
            typesPoint = itemData.typesPoint || []; // 获取每种试题类型每道题多少分
        // 循环试题类型列表
        for(let i = 0; i < childList.length; i++){
            let childItem = childList[i]; // 获取当前循环项
            // 判断当前项的数量和分数是否全部填写了
            if(typesNumber[childItem.value] && typesPoint[childItem.value]){
                totalPoint += (typesNumber[childItem.value] * typesPoint[childItem.value]);
            }
        }
        return totalPoint;
    }

    /**
     * 单选列表选择数据(试题等级)
     * @param {当前操作的数据} item
     * @param {当前数据的选择数据的key} key
     * @param {当前dom} e
     */
    radioListChange = (item, key, e) => {
        let modalData = this.props.modalData, // 获取全部的填写数据
            itemData = modalData[item.key] || {}; // 获取当期项填写的数据
        // 对当前项进行赋值
        itemData[key] = e.target.value;
        modalData[item.key] = itemData;
        this.props.changeModalData(modalData);
    }

    /**
     * 输入框列表输入数据(填空题答案)
     * @param {当前操作的数据} item
     * @param {当前操作的是几个} ind
     * @param {当前dom} e
     */
    inputListChange = (item, ind, e) => {
        let modalData = this.props.modalData, // 获取全部的填写数据
            itemData = modalData[item.key] || []; // 获取当前项的填写数据
        // 对当前项进行赋值
        itemData[ind] = e.target.value;
        modalData[item.key] = itemData;
        this.props.changeModalData(modalData);
    }

    /**
     * 添加删除输入框列表数据
     * @param {当前操作的数据} item
     * @param {当前操作类型} type
     * @param {当前操作的是第几个} ind
     */
    addDeleteInputListData = (item, type, ind) => {
        let modalData = this.props.modalData, // 获取全部的填写数据
            itemData = modalData[item.key] || ['']; // 获取当前项的填写数据
        // 判断当前操作是删除还是新增 进行不同的值操作
        if(type == 'delete'){
            itemData.splice(ind, 1)
        }else{
            itemData.push('');
        }
        // 如果填写的数据是否为空 如果为空则默认添加一项空的数据
        if(itemData.length <= 0) itemData = [''];
        modalData[item.key] = itemData;
        this.props.changeModalData(modalData);
    }

    /**
     * 选项输入框输入内容
     * @param {当前操作项} item
     * @param {当前输入框修改的key} key
     * @param {当前dom} e
     */
    optionInputListChange = (item, key, e) => {
        let modalData = this.props.modalData, // 获取全部的填写数据
            itemData = modalData[item.key] || {}; // 获取当前项的填写数据
        itemData[key] = e.target.value;
        modalData[item.key] = itemData;
        this.props.changeModalData(modalData);
    }

    /**
     * 添加删除选项数据
     * @param {当前操作的数据} item
     * @param {当前操作类型} type
     * @param {当前操作的是第几个} ind
     */
    addDeleteOptionInputListData = async(item, type, ind) => {
        let modalData = this.props.modalData, // 获取全部的填写数据
            itemData = modalData[item.key] || {}, // 获取当前项的填写数据
            questionOptionList = this.state.questionOptionList || []; // 获取选项列表
        // 判断当前是删除选项还是新增选项
        if(type == 'delete'){
            let delKey = questionOptionList[ind].value, // 获取当前删除的选项key
                newQuestionOptionList = [], // 声明新的选项论列表
                newItemData = {}; // 声明新的当前项填写数据
            // 删除当前选项
            questionOptionList.splice(ind, 1);
            // 循环处理过的选项数据
            for(let i = 0; i < questionOptionList.length; i++){
                // 获取当前循环中的字母
                let letter = String.fromCharCode(65 + i);
                // 给新的选项列表添加选项
                newQuestionOptionList.push({label: letter, value: letter});
                // 判断当前项是否在删除项之前 如果是则直接赋值 否则将选项值加一之后赋值
                if(delKey > letter){
                    newItemData[letter] = itemData[letter];
                }else{
                    let oldLetter = String.fromCharCode(66 + i);
                    newItemData[letter] = itemData[oldLetter];
                }
            }
            // 选项数据重新赋值
            questionOptionList = newQuestionOptionList;
            modalData[item.key] = newItemData;
            // 判断当前项是否修改其他数据
            if(item.changeKey){
                modalData = await this.changeKeyGeneral(item, modalData)
            }
        }else{
            // 获取需要新增选项的序号
            let letter = String.fromCharCode(65 + questionOptionList.length);
            questionOptionList.push({label: letter, value: letter})
        }
        this.setState({
            questionOptionList,
        }, () => { this.props.changeModalData(modalData) })
    }

    /** 组件方法 */
    // 输入框组件
    renderInputHtml = (item) => {
        // 判断返回填写数字的组件
        if(item.inputType == 'number'){
            return <InputNumber addonAfter={item.addonAfter} value={this.props.modalData[item.key]} addonBefore={item.addonBefore} prefix={item.prefix} suffix={item.suffix} type={item.inputType} disabled={item.disabled || false} placeholder={item.placeholder} onChange={this.inputChange.bind(this, item, 'number')}></InputNumber>
        // 判断返回textarea组件
        }else if(item.inputType == 'textarea'){
            return <Input.TextArea value={this.props.modalData[item.key]} rows={item.rows || 4} allowClear disabled={item.disabled || false} placeholder={item.placeholder} onChange={this.inputChange.bind(this, item, 'other')}></Input.TextArea>
        // 其他的全部返回输入框组件
        }else{
            return <Input addonAfter={item.addonAfter} value={this.props.modalData[item.key]} addonBefore={item.addonBefore} prefix={item.prefix} suffix={item.suffix} type={item.inputType} allowClear disabled={item.disabled || false} placeholder={item.placeholder} onChange={this.inputChange.bind(this, item, 'other')}></Input>
        }
    }

    // 选择框组件
    renderSelectHtml = (item) => {
        let childList = this.getChildListData(item); // 获取当前项的子元素
        return <Select allowClear disabled={item.disabled} options={childList} value={this.props.modalData[item.key]} placeholder={item.placeholder} onChange={this.generalDataChange.bind(this, item)}></Select>
    }

    // 选择时间讲过
    renderSelectTimerHtml = (item) => {
        let itemValue = moment(this.props.modalData[item.key], 'HH:mm:ss'); // 获取当前项填写的时间数据
        // 根据不同的timeType返回不同的时间组件
        switch (item.timeType) {
            case 'timer':
                return <TimePicker allowClear onChange={this.datePickerSectionChange.bind(this, item)} disabled={item.disabled} value={itemValue}></TimePicker>
            default: <DatePicker allowClear disabled={item.disabled} onChange={this.datePickerSectionChange.bind(this, item)} picker={item.timeType || 'date'} />
        }
    }

    // 选择时间区间
    renderSelectTimeSectionHtml = (item) => {
        return <DatePicker.RangePicker disabledDate={this.disabledDate} allowClear disabled={item.disabled} onChange={this.datePickerSectionChange.bind(this, item)} showTime={{ defaultValue: [moment('08:30:00', 'HH:mm:ss'), moment('18:00:00', 'HH:mm:ss')]}} showNow></DatePicker.RangePicker>
    }

    // 选择试卷
    renderSelectPaperHtml = (item) => {
        return <div className="selectPaper">
            {this.renderSelectHtml(item)}
            <Button className="selectPaperBtn" type="primary" onClick={item.btnClick}>创建试卷</Button>
        </div>
    }

    // switch组件
    renderSwitchHtml = (item) => {
        return <Switch checkedChildren={item.checked || ''} unCheckedChildren={item.unChecked || ''} onChange={this.generalDataChange.bind(this, item)} disabled={item.disabled} checked={this.props.modalData[item.key]} />
    }

    // 树形控件
    renderTreeHtml = (item) => {
        let fieldNames = item.fieldNames || {title: 'title', key: 'key', children: 'children'},
            childList = this.getChildListData(item);
        return <Tree checkable treeData={childList} fieldNames={fieldNames} onCheck={this.generalDataChange.bind(this, item)} disabled={item.disabled}  />
    }

    // 级联选择器
    renderCascaderHtml = (item) => {
        let fieldNames = item.fieldNames || {label: 'label', value: 'value', children: 'children'},
            childList = this.getChildListData(item);
        return <Cascader allowClear disabled={item.disabled} multiple={item.multiple || false} onChange={this.generalDataChange.bind(this, item)} fieldNames={fieldNames} options={childList} placeholder={item.placeholder} expandTrigger="hover" />
    }

    // radio 选择
    renderRadioHtml = (item) => {
        let childList = this.getChildListData(item);
        return <Radio.Group disabled={item.disabled} value={this.props.modalData[item.key]} onChange={this.generalDomChange.bind(this, item)}>
            {childList.map((itemChild, ind) => {
                return <Radio key={ind} value={itemChild.value}>{itemChild.label}</Radio>
            })}
        </Radio.Group>
    }

    // checkBox选择
    renderCheckBoxHtml = (item) => {
        let childList = this.getChildListData(item);
        return <Checkbox.Group disabled={item.disabled} options={childList} value={this.props.modalData[item.key] || []} onChange={this.generalDomChange.bind(this, item)}></Checkbox.Group>
    }

    /** 独有特殊的组件 */
    // 当前分类下存在的题型数量
    renderQuestionTypesNumberHtml = (item) => {
        let childList = this.getChildListData(item),
            typeNumber = this.props.modalData[item.key] || {};
        return <div className="questionTypeNumber">{childList.map((itemChild, ind) => {
                return <div key={ind} className="questionTypeNumberItem">{itemChild.name}：{typeNumber[itemChild.value] || 0}道</div>
            })}
        </div>
    }

    // 试卷中各种题型数量
    renderQuestionTypesHtml = (item) => {
        let childList = this.getChildListData(item), // 获取当前项的全部子元素
            itemData = this.props.modalData[item.key] || {}, // 获取当前项填写的数据
            typesNumber = itemData.typesNumber || [], // 获取每种题型各多少条数据
            typesPoint = itemData.typesPoint || []; // 获取每种题型每道题多少分
        return <div className="questionTypes">
            {childList.map((itemChild, ind) => {
                return <div key={ind} className="questionTypesItem">
                    <div className="questionTypesItemText">{itemChild.name}：</div>
                    <InputNumber className="questionTypesItemInput" type='number' addonAfter='道' value={typesNumber[itemChild.value]} disabled={item.disabled || false} placeholder='请输入数量' onChange={this.inputQuestionTypeChange.bind(this, item, itemChild, 'typesNumber')}></InputNumber>
                    <div className="questionTypesItemText questionTypesItemTextPoint">每道题：</div>
                    <InputNumber className="questionTypesItemInput" type='number' addonAfter='分' value={typesPoint[itemChild.value]} disabled={item.disabled || false} placeholder='请输入分数' onChange={this.inputQuestionTypeChange.bind(this, item, itemChild, 'typesPoint')}></InputNumber>
                </div>
            })}
        </div>
    }

    // 试题中的试题等级
    renderRadioListHtml = (item) => {
        let childList =this.getChildListData(item),
            itemData = this.props.modalData[item.key] || {};
        return <>{childList.map((childItem) => {
            let children = childItem.children;
            return <div className="modalRadioList" key={childItem.value}>
                {childItem.label}：
                <Radio.Group disabled={item.disabled} value={itemData[childItem.value]} onChange={this.radioListChange.bind(this, item, childItem.value)}>
                    {children.map((childrenItem) => {
                        return <Radio key={childrenItem.value} value={childrenItem.value}>{childrenItem.label}</Radio>
                    })}
                </Radio.Group>
            </div>
        })}</>
    }

    // 填空题答案区域
    renderInputListHtml = (item) => {
        let itemData = this.props.modalData[item.key] || [];
        if(itemData.length <= 0) itemData = [''];
        return <div className="modalInputList">
            <div className="modalInputLeft">{itemData.map((itemChild, ind) => {
                return <Input className="modalInputListInput" key={ind} value={itemChild}  suffix={<MinusCircleFilled onClick={this.addDeleteInputListData.bind(this, item, 'delete', ind)} style={{fontSize: '18px', color: '#F56C6C'}} />} allowClear disabled={item.disabled} placeholder={item.placeholder} onChange={this.inputListChange.bind(this, item, ind)}></Input>
            })}</div>
            <div className="modalInputRight">
                <PlusCircleFilled onClick={this.addDeleteInputListData.bind(this, item, 'add')} style={{fontSize: '18px', color: '#000'}} />
            </div>
        </div>
    }

    // 试题选项区域
    renderOptionInputListHtml = (item) => {
        let itemData = this.props.modalData[item.key] || {},
            childList = this.state.questionOptionList;
        return <div className="modalInputList modalOptionInputList">
            <div className="modalInputLeft">{childList.map((itemChild, ind) => {
                return <div key={ind} className="modalInputLeftItem">
                        {itemChild.label}：
                        <Input className="modalOptionInputListInput" key={ind} value={itemData[itemChild.value]}  suffix={<MinusCircleFilled onClick={this.addDeleteOptionInputListData.bind(this, item, 'delete', ind)} style={{fontSize: '18px', color: '#F56C6C'}} />} allowClear disabled={item.disabled} placeholder={item.placeholder} onChange={this.optionInputListChange.bind(this, item, itemChild.value)} />
                    </div>
            })}</div>
            <div className="modalInputRight">
                <PlusCircleFilled onClick={this.addDeleteOptionInputListData.bind(this, item, 'add')} style={{fontSize: '18px', color: '#000'}} />
            </div>
        </div>
    }

    // 右侧显示的数据
    renderModalRightHtml = (item) => {
        switch (item.type) {
            case 'select':
                return this.renderSelectHtml(item);
            case 'selectTimeSection':
                return this.renderSelectTimeSectionHtml(item);
            case 'selectPaper':
                return this.renderSelectPaperHtml(item);
            case 'switch':
                return this.renderSwitchHtml(item);
            case 'selectTimer':
                return this.renderSelectTimerHtml(item);
            case 'tree':
                return this.renderTreeHtml(item);
            case 'cascader':
                return this.renderCascaderHtml(item);
            case 'questionTypesNumber':
                return this.renderQuestionTypesNumberHtml(item);
            case 'questionTypes':
                return this.renderQuestionTypesHtml(item);
            case 'radio':
                return this.renderRadioHtml(item);
            case 'checkBox':
                return this.renderCheckBoxHtml(item);
            case 'radioList':
                return this.renderRadioListHtml(item);
            case 'inputList':
                return this.renderInputListHtml(item);
            case 'optionInputList':
                return this.renderOptionInputListHtml(item);
            default: return this.renderInputHtml(item)
        }
    }

    render(){
        return <div className="modalListPage">
            {this.props.modalList.map((item, index) => {
                return this.judgeItemShow(item) ? <div key={index} className="modalListItem">
                    <div className="modalListLeft">
                        {item.required ? <div className="modalRequired">*</div> : ''}
                        {item.name}：
                    </div>
                    <div className="modalListRight">{this.renderModalRightHtml(item)}</div>
                </div> : '';
            })}
        </div>
    }
}

export default ModalListPage;
