<template>
  <el-row id="base_biz">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="/base/biz">基础信息</el-breadcrumb-item>
      <el-breadcrumb-item>食品单位</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row class="title">食品单位管理</el-row>

    <el-row type="flex" class="action" :gutter="15">
      <el-col :span="3">
        <router-link to="biz/new">
          <el-button size="small" type="primary" icon="el-icon-plus">新增食品单位</el-button>
        </router-link>
      </el-col>
    </el-row>

    <el-row type="flex" :gutter="15">
      <el-col :span="6">
        <el-input
          size="small"
          v-model="search.text"
          clearable
          placeholder="搜索单位名称/联系方式/许可证号等"
          prefix-icon="el-icon-search"
        ></el-input>
      </el-col>

      <el-col :span="4">
        <el-cascader
          style="width:100%;"
          size="small"
          clearable
          :show-all-levels="false"
          :props="{label:'name',value:'_id'}"
          v-model="search.area"
          :options="cascadeDepData"
          placeholder="行政区域"
          change-on-select
        ></el-cascader>
      </el-col>

      <el-col :span="3">
        <el-select size="small" v-model="search.kind" clearable placeholder="选择类别">
          <el-option
            v-for="(name,index) in bizKind()"
            :key="index+1"
            :label="name"
            :value="index+1"
          ></el-option>
        </el-select>
      </el-col>

      <el-col :span="3">
        <el-select size="small" v-model="search.category" clearable placeholder="经营种类">
          <el-option v-for="name in bizCategory()" :key="name" :label="name" :value="name"></el-option>
        </el-select>
      </el-col>

      <el-col :span="3">
        <el-select size="small" v-model="search.licence" clearable placeholder="许可证">
          <el-option label="有许可证" :value="true"></el-option>
          <el-option label="暂无" :value="false"></el-option>
        </el-select>
      </el-col>

      <el-col :span="3">
        <el-select size="small" v-model="search.state" clearable placeholder="状态">
          <el-option label="正常" :value="1"></el-option>
          <el-option label="关闭" :value="0"></el-option>
        </el-select>
      </el-col>
    </el-row>

    <el-row style="margin-top: -10px;">
      <el-col :span="24">
        <el-table :data="pageData" v-loading="loading" size="medium" style="width: 100%;">
          <el-table-column prop="name" label="企业名称" min-width="150px" sortable></el-table-column>
          <el-table-column label="类型" sortable>
            <template slot-scope="scope">{{bizKind(scope.row.kind)}}</template>
          </el-table-column>
          <el-table-column label="行政区域" prop="$dep.name" sortable></el-table-column>
          <el-table-column prop="contact" label="联系人" sortable></el-table-column>
          <el-table-column prop="phone" label="联系电话"></el-table-column>
          <el-table-column label="许可证编号">
            <template slot-scope="scope">
              <span v-if="scope.row.lic">{{scope.row.lic.code}}</span>
              <el-tag size="small" type="warning" v-else>暂无许可证</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" sortable>
            <template slot-scope="scope">
              <el-tag
                size="small"
                :type="getStateType(scope.row.state)"
              >{{bizState(scope.row.state)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="110px">
            <template slot-scope="scope">
              <el-button
                @click="$router.push('biz/'+scope.row._id)"
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
        background
        @size-change="t=>bizTable.pageSize=t"
        :current-page.sync="bizTable.page"
        :page-sizes="bizTable.pageSizes"
        :page-size="bizTable.pageSize"
        layout="total, prev, pager, next, sizes"
        :total="tableData.length"
      ></el-pagination>
    </el-row>

    <el-dialog title="确认删除" v-if="deleteDialog" :visible="true" width="30%">
      <span>确定要删除食品单位 {{deleteDialog.name}} 吗？</span>
      <br>
      <span>这将一并删除与之相关的所有检查记录等。此操作无法复原。</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialog=null" type="normal">取消</el-button>
        <el-button @click="deleteBiz()" type="danger">确定</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { biz, del, bizKind, bizCategory, bizState } from "@/api/biz.js";
import { dep } from "@/api/dep.js";

export default {
  name: "base_biz",
  data() {
    return {
      bizData: [],
      depData: [],
      cascadeDepData: [],
      loading: true,

      search: {
        text: "",
        category: "",
        kind: "",
        licence: "",
        state: "",
        area: []
      },
      bizTable: {
        page: 1,
        pageSize: 10,
        pageSizes: [10, 25, 50, 100]
      },

      bizKind,
      bizCategory,
      bizState,

      deleteDialog: null
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
      let bizList = (await biz()).data;

      bizList.forEach(biz => {
        biz["$dep"] = this.depData.find(t => t._id === biz.dep);
      });
      this.bizData = bizList;
      this.loading = false;
    },

    getStateType(state) {
      return ["danger", "success"][state];
    },

    async deleteBiz() {
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
      let tableData = this.bizData;

      if (this.search.text && this.search.text.trim().length > 0) {
        let searchText = this.search.text;
        tableData = tableData.filter(
          t =>
            t.name.includes(searchText) ||
            t.contact.includes(searchText) ||
            t.tel.includes(searchText) ||
            (t.lic && t.lic.code.includes(searchText))
        );
      }

      if (this.search.state && this.search.state != "") {
        tableData = tableData.filter(t => t.state == this.search.state);
      }

      if (this.search.kind && this.search.kind != "") {
        tableData = tableData.filter(t => t.kind === this.search.kind);
      }

      if (this.search.category && this.search.category != "") {
        tableData = tableData.filter(t => t.category === this.search.category);
      }

      if (this.search.licence !== "") {
        if (this.search.licence === true) {
          tableData = tableData.filter(t => t.lic);
        } else {
          tableData = tableData.filter(t => !t.lic);
        }
      }

      if (this.search.area && this.search.area.length > 0) {
        let areaSearch = this.search.area.slice(-1)[0];
        tableData = tableData.filter(biz => (biz.dep._rel || []).includes(areaSearch));
      }

      return tableData;
    },

    pageData() {
      return this.tableData.slice(
        (this.bizTable.page - 1) * this.bizTable.pageSize,
        this.bizTable.page * this.bizTable.pageSize
      );
    }
  }
};
</script>
