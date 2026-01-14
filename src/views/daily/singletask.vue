<template>
  <el-row id="daily_singletask">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="/daily">日常检查</el-breadcrumb-item>
      <el-breadcrumb-item :to="`/daily/${plan._id}`">{{plan.title}}</el-breadcrumb-item>
      <el-breadcrumb-item :to="`/daily/${plan._id}/${task._id}`">{{task.title}}（任务）</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row class="title action">
      {{task.title}}（当前任务
      <span v-if="task.progress">，进度{{task.progress[0]}}/{{task.progress[1]}}</span>）
    </el-row>

    <el-row type="flex" :gutter="15">
      <el-col :span="5">
        <el-radio-group v-model="search.checked" size="small">
          <el-radio-button :label="1">显示全部</el-radio-button>
          <el-radio-button :label="2">仅已检查</el-radio-button>
          <el-radio-button :label="3">仅未检查</el-radio-button>
        </el-radio-group>
      </el-col>

      <el-col :span="4">
        <el-input
          v-model="search.text"
          size="small"
          clearable
          placeholder="搜索单位名称/结果等"
          prefix-icon="el-icon-search"
        ></el-input>
      </el-col>

      <el-col :span="4">
        <el-select size="small" v-model="search.result" clearable placeholder="按检查结果筛选">
          <el-option
            v-for="(name,index) in recordResult()"
            :key="index+1"
            :label="name"
            :value="index+1"
          ></el-option>
        </el-select>
      </el-col>

      <el-col :span="8">
        <el-date-picker
          v-model="search.daterange"
          size="small"
          clearable
          type="daterange"
          range-separator="至"
          start-placeholder="检查日期"
          end-placeholder="截止日期"
        ></el-date-picker>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <el-table
          :data="pageData"
          :row-class-name="tableRowClassName"
          v-loading="loading"
          size="medium"
          style="width: 100%;margin-bottom:20px;"
        >
          <el-table-column label="单位名称" min-width="180px" sortable>
            <template slot-scope="scope">
              <el-tag v-if="!scope.row.checked" type="warning" size="mini">
                <strong>尚未检查</strong>
              </el-tag>
              {{scope.row.$biz.name}}
            </template>
          </el-table-column>
          <el-table-column label="检查人员" sortable>
            <template slot-scope="scope">
              <div v-if="scope.row.$record.staff1">
                主检查人：
                <el-tag size="mini">{{scope.row.$record.$staff1.name}}</el-tag>
              </div>
              <div v-if="scope.row.$record.staff2">
                协同检查：
                <el-tag size="mini">{{scope.row.$record.$staff2.name}}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="$record.date" label="检查日期" align="center" sortable></el-table-column>
          <el-table-column align="center" label="检查结果">
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.checked"
                size="small"
                :type="getResultType(scope.row.$record.result)"
              >{{recordResult(scope.row.$record.result)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="处理方式">
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.checked"
                size="small"
                :type="getResultType(scope.row.$record.handle)"
              >{{recordHandle(scope.row.$record.handle)}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column align="center" label="操作" min-width="100px">
            <template slot-scope="scope">
              <el-button
                @click.native="$router.push(`/daily/${plan._id}/${task._id}/${scope.row.$biz._id}`)"
                size="mini"
                type="primary"
              >{{scope.row.checked?`查看`:`录入`}}记录</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row>
      <el-pagination
        background
        @size-change="t=>taskBizTable.pageSize=t"
        :current-page.sync="taskBizTable.page"
        :page-sizes="taskBizTable.pageSizes"
        :page-size="taskBizTable.pageSize"
        layout="total, prev, pager, next, sizes"
        :total="tableData.length"
      ></el-pagination>
    </el-row>
  </el-row>
</template>

<script>
import { list, recordResult, recordHandle } from "@/api/record.js";
import { biz } from "@/api/biz.js";
import { task } from "@/api/task.js";
import { plan } from "@/api/plan.js";
import { staff } from "@/api/staff.js";

export default {
  name: "daily_singletask",

  data() {
    return {
      plan: {},
      task: {},

      bizData: [],
      staffData: [],
      recordData: [],

      loading: true,

      search: {
        text: "",
        daterange: [],
        result: "",
        checked: 1
      },
      taskBizTable: {
        page: 1,
        pageSize: 10,
        pageSizes: [10, 25, 50, 100]
      },

      recordResult,
      recordHandle
    };
  },

  async beforeMount() {
    await this.init();
  },

  async beforeRouteUpdate(to, from, next) {
    next();
    await this.init();
  },

  methods: {
    async init() {
      this.loading = true;

      const planId = this.$route.params.planid;
      const taskId = this.$route.params.taskid;
      this.plan = (await plan(planId)).data;
      this.task = (await task(taskId)).data;

      this.staffData = (await staff()).data;
      this.bizData = (await biz()).data;
      let recordList = (await list(taskId)).data;

      let records = [];
      this.task.taskbiz.forEach(bizId => {
        const isChecked = this.task.completebiz.includes(bizId);
        let recordInfo = isChecked
          ? recordList.find(t => t._biz === bizId)
          : {};
        let bizInfo = this.bizData.find(t => t._id === bizId);

        if (isChecked) {
          recordInfo.$staff1 = recordInfo.staff1
            ? this.staffData.find(t => t._id === recordInfo.staff1)
            : {};
          recordInfo.$staff2 = recordInfo.staff2
            ? this.staffData.find(t => t._id === recordInfo.staff2)
            : {};
        }

        records.push({
          $biz: bizInfo,
          $record: recordInfo,
          checked: isChecked
        });
      });
      this.recordData = records;

      this.loading = false;
    },

    tableRowClassName({ row }) {
      return row.checked ? "" : "notchecked";
    },

    getResultType(type) {
      return ["info", "success", "warning", "danger"][type];
    }
  },

  computed: {
    tableData() {
      let tableData = this.recordData;

      if (this.search.checked !== 1) {
        tableData = tableData.filter(
          t => t.checked === (this.search.checked === 2)
        );
      }

      if (this.search.result && this.search.result !== "") {
        tableData = tableData.filter(t => t.result === this.search.result);
      }

      if (
        this.search.daterange &&
        (this.search.daterange[0] || this.search.daterange[1])
      ) {
        tableData = tableData.filter(t => {
          let dt = new Date(t.date);
          return (
            dt.getTime() >= this.search.daterange[0].getTime() &&
            dt.getTime() <= this.search.daterange[1].getTime()
          );
        });
      }

      return tableData;
    },

    pageData() {
      return this.tableData.slice(
        (this.taskBizTable.page - 1) * this.taskBizTable.pageSize,
        this.taskBizTable.page * this.taskBizTable.pageSize
      );
    }
  }
};
</script>

<style lang="scss">
#daily_singletask {
  .notchecked {
    background: #f0f9eb !important;
  }
}
</style>
