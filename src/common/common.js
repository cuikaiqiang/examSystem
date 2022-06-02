/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 09:24:00
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-20 17:19:39
 * @FilePath: /examSystem/src/common/common.js
 * @Description:
 */

/**
 * 获取试题类型
 * @returns 返回试题类型
 */
export const getQUestionType = () => {
    return [
        { label: '单选题', value: 1 },
        { label: '多选题', value: 2 },
        { label: '判断题', value: 3 },
        { label: '填空题', value: 4 },
    ];
};

/**
 * 获取试题等级
 * @returns 返回试题等级
 */
export const getQuestionLevel = () => {
    return [
        {
            label: 'A类',
            value: 'A',
            children: [
                { value: '不限', label: '不限' },
                { value: '了解', label: '了解' },
                { value: '熟悉', label: '熟悉' },
                { value: '掌握', label: '掌握' },
            ],
        },
        {
            label: 'B类',
            value: 'B',
            children: [
                { value: '不限', label: '不限' },
                { value: '了解', label: '了解' },
                { value: '熟悉', label: '熟悉' },
                { value: '掌握', label: '掌握' },
            ],
        },
        {
            label: 'C类',
            value: 'C',
            children: [
                { value: '不限', label: '不限' },
                { value: '了解', label: '了解' },
                { value: '熟悉', label: '熟悉' },
                { value: '掌握', label: '掌握' },
            ],
        },
        {
            label: 'D类',
            value: 'D',
            children: [
                { value: '不限', label: '不限' },
                { value: '了解', label: '了解' },
                { value: '熟悉', label: '熟悉' },
                { value: '掌握', label: '掌握' },
            ],
        },
        {
            label: 'E类',
            value: 'E',
            children: [
                { value: '不限', label: '不限' },
                { value: '了解', label: '了解' },
                { value: '熟悉', label: '熟悉' },
                { value: '掌握', label: '掌握' },
            ],
        },
    ];
};

/**
 * 判断当前项是否显示
 * @param {当前操作的数据} item
 * @returns 是否显示
 */
export const judgeItemShow = (item, modalData) => {
    // 判断当前项是否根据其他值显示隐藏
    if (item.showKey) {
        // 获取当前项的根据值
        let showKeyData = modalData[item.showKey] || '',
            showValue = item.showValue;
        // 判断当前显示值的类型
        if (showValue instanceof Array) {
            // 判断当前值是否存在并且是否和当前项显示时的值一样
            if (showKeyData && showValue.includes(showKeyData)) {
                return true;
            } else {
                return false;
            }
        } else {
            // 判断当前值是否存在并且是否和当前项显示时的值一样
            if (showKeyData && showKeyData == showValue) {
                return true;
            } else {
                return false;
            }
        }
    } else {
        return true;
    }
};
