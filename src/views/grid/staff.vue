<template>
  <el-row id="grid_staff">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="/grid/staff">网格化管理</el-breadcrumb-item>
      <el-breadcrumb-item>行政人员管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row class="title">行政人员管理</el-row>
    <el-row class="action" :gutter="15">
      <el-col :span="4">
        <router-link to="staff/new">
          <el-button type="primary" size="small" icon="el-icon-plus">新增行政人员</el-button>
        </router-link>
      </el-col>
    </el-row>

    <el-row type="flex" :gutter="15">
      <el-col :span="6">
        <el-input
          clearable
          size="small"
          v-model="search.text"
          placeholder="搜索姓名/岗位/单位名等"
          prefix-icon="el-icon-search"
        ></el-input>
      </el-col>

      <el-col :span="5">
        <el-cascader
          clearable
          :show-all-levels="false"
          size="small"
          :props="{label:'name',value:'_id'}"
          v-model="search.dep"
          :options="cascadeDepData"
          placeholder="按网格筛选"
          change-on-select
        ></el-cascader>
      </el-col>
    </el-row>

    <el-row style="margin-top: -10px;">
      <el-col :span="24">
        <el-table v-loading="loading" :data="pageData" size="medium" style="width: 100%">
          <el-table-column prop="name" label="人员姓名" sortable></el-table-column>
          <el-table-column label="性别" sortable>
            <template slot-scope="scope">{{staffSex(scope.row.sex)}}</template>
          </el-table-column>
          <el-table-column prop="$dep.name" label="所属机构" sortable></el-table-column>
          <el-table-column prop="$dep._rel.length" label="机构级别" sortable></el-table-column>
          <el-table-column prop="job" label="职务" sortable></el-table-column>
          <el-table-column label="状态" align="center" sortabl>
            <template slot-scope="scope">
              <el-tag
                size="small"
                :type="getStateType(scope.row.state)"
              >{{staffState(scope.row.state)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="100px">
            <template slot-scope="scope">
              <el-button
                @click.native="$router.push(`staff/${scope.row._id}`)"
                size="mini"
                type="primary"
              >查看 / 编辑</el-button>
              <el-button @click="deleteDialog=scope.row" size="mini" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row>
      <el-pagination
        @size-change="t=>staffTable.pageSize=t"
        background
        :current-page.sync="staffTable.page"
        :page-sizes="staffTable.pageSizes"
        :page-size="staffTable.pageSize"
        layout="total, prev, pager, next, sizes"
        :total="tableData.length"
      ></el-pagination>
    </el-row>

    <el-dialog title="确认删除" v-if="deleteDialog" :visible="true" width="30%">
      <span>确定要删除机构职员 {{deleteDialog.name}} 吗？</span>
      <br>
      <span>该职员参与的所有业务仍然会保留。此操作无法复原。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog=null" type="normal">取消</el-button>
        <el-button @click="deleteStaff()" type="danger">确定</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { staff, del, staffSex, staffState } from "@/api/staff.js";
import { dep } from "@/api/dep.js";

export default {
  name: "grid_staff",

  data() {
    return {
      depData: [],
      cascadeDepData: [],
      staffData: [],

      loading: true,

      search: {
        text: "",
        dep: []
      },
      staffTable: {
        page: 1,
        pageSize: 10,
        pageSizes: [10, 25, 50, 100]
      },

      deleteDialog: null,
      staffSex,
      staffState
    };
  },

  async beforeMount() {
    await this.init();
  },

  methods: {
    async init() {
      this.loading = true;
      this.depData = (await dep()).data;
      this.cascadeDepData = (await dep(null, 'cascade=1')).data;
      let staffList = (await staff()).data;

      staffList.forEach(staff => {
        staff["$dep"] = this.depData.find(t => t._id === staff.dep);
      });
      this.staffData = staffList;
      this.loading = false;
    },

    getStateType: state => ["danger", "success"][state],

    async deleteDep() {
      if (!this.deleteDialog) {
        return;
      }
      await del(this.deleteDialog._id);
      this.deleteDialog = null;
      this.init();
    }
  },

  computed: {
    tableData() {
      let tableData = this.staffData;

      if (this.search.text && this.search.text.trim().length > 0) {
        let searchText = this.search.text;
        tableData = tableData.filter(
          t => t.name.includes(searchText) || t.job.includes(searchText)
        );
      }

      if (this.search.dep && this.search.dep.length > 0) {
        let areaSearch = this.search.dep.slice(-1)[0];
        tableData = tableData.filter(t => t.$dep._rel.includes(areaSearch));
      }

      return tableData;
    },

    pageData() {
      return this.tableData.slice(
        (this.staffTable.page - 1) * this.staffTable.pageSize,
        this.staffTable.page * this.staffTable.pageSize
      );
    }
  }
};
</script>
