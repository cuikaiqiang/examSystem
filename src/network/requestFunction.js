/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-21 14:37:54
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-19 09:08:54
 * @FilePath: /examSystem/src/network/requestFunction.js
 * @Description:
 */
import dataServer from './dataServer';
const examPrefix = 'exam/';

/**
 * 登录
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const postExamLogin = async (reqData) => {
    let res = await dataServer.postData(examPrefix + 'user/login', reqData);
    return res;
}

/**
 * 获取用户权限
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getRoleKey = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExam/getRoleKey');
    return res;
}

/**
 * 获取考试列表
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getExamPageList = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExam/page',reqData);
    return res;
}

/**
 * 获取每周考设置详情数据
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getWeekSettingData = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'smart/task/getByTaskId/202106121425562430000002', reqData),
        extra = JSON.parse(res.extra);
    res.day = extra.day;
    res.isOpen = res.state == 1;
    res.timer = extra.hour + ':' + extra.minute + ':' + extra.second;
    return res;
}

/**
 * 获取考试统计数据
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getStatisticsData = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExam/getExamInfo',reqData);
    return res;
}

/**
 * 获取自动分发考试统计数据
 * @param {地址栏中参数} pathParam
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getStatisticsAutoData = async(pathParam, reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExam/getAutoExamScore/' + pathParam, reqData);
    return res;
}

/**
 * 获取柱状图统计数据
 * @param {地址栏中参数} pathParam
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getStatisticsHistogramData = async(pathParam, reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExam/getStatisticsInfo/' + pathParam, reqData);
    return res;
}

/**
 * 获取资质统计数据
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getStatisticsAptitudeData = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExam/getJobCertificateStatistics', reqData);
    return res;
}

/**
 * 获取试卷列表
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getPaperPageList = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationExamPaper/page', reqData);
    return res;
}

/**
 * 获取试卷详情
 * @param {地址栏上传递的参数} pathParam
 * @returns
 */
export const getPaperDetails = async(pathParam) => {
    let res = await dataServer.getData(examPrefix+ 'operationExamPaper/get/' + pathParam);
    let records = JSON.parse(res.content || '[]'), tableList = [];
    for(let i = 0; i < records.length; i++){
        tableList.push(disposeQuestionData(records[i]));
    }
    res.tableList = tableList;
    return res;
}

/**
 * 添加试题点击确定
 * @param {请求参数} reqData
 * @returns
 */
export const getAddQuestionData = async(reqData) => {
    let res = await dataServer.postData(examPrefix + 'operationExamPaper/exampaper-add', reqData);
    let records = res || [], tableList = [];
    for(let i = 0; i < records.length; i++){
        tableList.push(disposeQuestionData(records[i]));
    }
    return tableList;
}

/**
 * 获取选中分类下的题型数量
 * @param {全部的数据} modalData
 * #@returns 请求返回结果
 */
export const getQuestionTypesNumber = async(modalData) => {
    // 获取等级数据
    let levels = modalData.levels || [], reqLevels = '',
        questionCategoryList = modalData.questionCategoryList || []; // 获取选择的分类数据
    // 将等级格式化为后台需要的格式
    if(levels && levels.length != 0){
        reqLevels = levels[0] + '$' + levels[1];
    }
    let res = await dataServer.postData(examPrefix + 'operationQuestion/getQuestionCountByCategoryIds?levels=' + reqLevels, questionCategoryList) || [],
        resList = [];
    for(let i = 0; i < res.length; i++){
        let resItem = res[i];
        resList[resItem.questionTypeId] = resItem.num;
    }
    return resList
}

/**
 * 获取试题分类树
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getClassifyTree = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'questionType/getQuestionTreeListByParentId/' + (reqData || 0));
    return res;
}

/**
 * 获取试题分类列表
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getClassifyList = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'questionType/children', reqData);
    return res || [];
}

/**
 * 获取是分类详情
 * @param {地址栏上传递的参数} pathParam
 * @returns 请求返回结果
 */
export const getClassifyDetails = async(pathParam) => {
    let res = await dataServer.getData(examPrefix + 'questionType/get/' + pathParam, {});
    res.isDel = res.isDel ? 1 : 0;
    return res;
}

/**
 * 获取试题详情
 * @param {地址栏上传递的参数} pathParam
 * @returns 请求返回的结果
 */
export const getQuestionDetails = async(pathParam) => {
    let res = await dataServer.getData(examPrefix + 'operationQuestion/get/' + pathParam, {});
    console.log(res)
    return res;
}

/**
 * 处理获取到的试题数据
 * @param {当前操作的数据} item
 * @returns 处理过的数据
 */
const disposeQuestionData = (item) => {
    let content = JSON.parse(item.content), // 获取content数据
        levelsStr = item.levels, // 获取等级数据
        levelsList = levelsStr ? levelsStr.split(',') : [], // 将等级数据格式化
        levels = []; // 显示的等级数据
    for(let i = 0; i < levelsList.length; i++){
        if(levelsList[i]){
            levels.push(levelsList[i].split('=')[0]);
        }
    }
    item.levels = levels.join('、');
    // 将答案进行格式化处理
    switch (item.questionTypeId){
        case 1:
            item.questionTypeName = '单';
            break;
        case 2:
            item.questionTypeName = '多';
            break;
        case 3:
            item.questionTypeName = '判断';
            item.answer = item.answer == 'T' ? '正确' : '错误';
            break;
        case 4:
            item.questionTypeName = '填空';
            var answer = JSON.parse(item.answer);
            item.answer = answer.join('、')
            break
    }
    item.content = content;
    // 判断当前是是否存在name
    if(!item.name){
        item.name = content.title;
    }
    return item;
}

/**
 * 获取试题列表
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const getQuestionList = async(reqData) => {
    let res = await dataServer.getData(examPrefix + 'operationQuestion/page', reqData),
        records = res.records || [],
        tableList = [];
    for(let i = 0; i < records.length; i++){
        tableList.push(disposeQuestionData(records[i]));
    }
    return { tableList, total: res.total || 0 };
}

/**
 * 删除试题列表
 * @param {请求参数} reqData
 * @returns 请求返回结果
 */
export const deleteQuestions = async(item, callBack) => {
    let res = await dataServer.getData(examPrefix + 'operationQuestion/delete/' + item.id);
    return res;
}
