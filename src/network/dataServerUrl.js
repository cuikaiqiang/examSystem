/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-08 09:24:35
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-14 16:39:55
 * @FilePath: /examSystem/src/network/dataServerUrl.js
 * @Description:
 */

const examPrefix = 'exam/';

export const updateSettingWeekPort = examPrefix + 'smart/task/updatByTaskId'; // 更新每周考试设置
export const createExamPort = examPrefix + 'operationExam/create'; // 创建考试
export const lookQRcodePort = examPrefix + 'operationExam/qrcode/'; // 查看考试二维码
export const stopExamPort = examPrefix + 'operationExam/stop/'; // 停止考试
export const activateExamPort = examPrefix + 'operationExam/restart'; // 激活考试
export const deleteExamByIdPort = examPrefix + 'operationExam/deleteExamById/'; // 删除考试
export const examPaperListPort = examPrefix + 'operationExamPaper/findList'; // 试卷列表
export const copyPaperPort = examPrefix + 'operationExamPaper/copy'; // 复制试卷
export const deletePaperPort = examPrefix + 'operationExamPaper/delete/'; // 删除试卷
export const createExamClassifyPort = examPrefix + 'questionType/children'; // 专项答题分类
export const qualificationCategoryPort = examPrefix + 'questionType/special'; // 资格考试类别
export const questionClassifyPort = examPrefix + 'questionType/getQuestionTreeListPaperByParentId/'; // 题库分类
export const addClassifyPort = examPrefix + 'questionType/add'; // 新增分类
export const editClassifyPort = examPrefix + 'questionType/update'; // 编辑分类
export const deleteClassifyPort = examPrefix + 'questionType/delete/'; // 删除题库分类
