/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 09:24:00
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 14:52:35
 * @FilePath: /examSystem/src/common/common.js
 * @Description:
 */

/**
 * 获取试题类型
 * @returns 返回试题类型
 */
export const getQUestionType = () => {
    return [
        {label: '单选题', value: 1},
        {label: '多选题', value: 2},
        {label: '判断题', value: 3},
        {label: '填空题', value: 4},
    ]
}

/**
 * 获取试题等级
 * @returns 返回试题等级
 */
export const getQuestionLevel = () => {
    return [
        {label:'A类',value:'A',children: [{value: '不限', label:'不限'},{value: '了解', label:'了解'},{value: '熟悉', label:'熟悉'},{value: '掌握', label:'掌握'}]},
        {label:'B类',value:"B",children: [{value: '不限', label:'不限'},{value: '了解', label:'了解'},{value: '熟悉', label:'熟悉'},{value: '掌握', label:'掌握'}]},
        {label:'C类',value:"C",children: [{value: '不限', label:'不限'},{value: '了解', label:'了解'},{value: '熟悉', label:'熟悉'},{value: '掌握', label:'掌握'}]},
        {label:'D类',value:"D",children: [{value: '不限', label:'不限'},{value: '了解', label:'了解'},{value: '熟悉', label:'熟悉'},{value: '掌握', label:'掌握'}]},
        {label:'E类',value:"E",children: [{value: '不限', label:'不限'},{value: '了解', label:'了解'},{value: '熟悉', label:'熟悉'},{value: '掌握', label:'掌握'}]}
    ]
}
