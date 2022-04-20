/*
 * @Author: cuikaiqiang
 * @Date: 2022-03-09 14:36:09
 * @LastEditors: cuikaiqiang
 * @LastEditTime: 2022-04-07 11:15:12
 * @FilePath: /examSystem/src/component/TableData.jsx
 * @Description:
 */

import React from "react";
import { Table, Pagination } from "antd";
import '@/scss/tableData.scss';

class TableData extends React.Component{
    static defaultProps = {
        isLoading: false, // 是正在加载中
        rowKey: 'id', // 表格行的key取值
        tableList: [], // 展示的列表数据
        isShowPagination: true, // 是否显示分页
        tableListAll: 1, // 总共有多少条数据
        pageSize: 10, // 每页多少条数据
        currentPage: 1, // 当前是第几页
        pageChange: function(){}
    }
    constructor(props){
        super(props);
        this.state = {}
    }
    render(){
        return (
            <div className="tableData">
                <Table loading={this.props.isLoading}
                    dataSource={this.props.tableList}
                    rowKey={this.props.rowKey}
                    pagination={false}>
                    {this.props.children}
                </Table>
                {this.props.isShowPagination && this.props.tableList.length > 0 ?
                    <Pagination className="tableDataPagination" total={this.props.tableListAll}
                        pageSize={this.props.pageSize}
                        current={this.props.currentPage}
                        onChange={this.props.pageChange}
                        showSizeChanger={false}></Pagination> : ''}
            </div>
        )
    }
}
export default TableData;
