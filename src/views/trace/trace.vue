<template>
  <el-row id="trace_trace">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item>全局总览</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row class="title">全局总览</el-row>

    <div id="banner">
      <span>
        <div class="text">
          当前计划数目:
          <span class="bold">{{count.plan.current}}</span>
        </div>
        <div class="button">
          <el-button @click.native="$router.push('/plan')" type="text" size="small">前往计划列表</el-button>
        </div>
        <el-progress
          :width="count.opt.width"
          :stroke-width="count.opt.stroke"
          type="circle"
          :percentage="getPrecent(count. plan.current/count.plan.total)"
        ></el-progress>
      </span>

      <span>
        <div class="text">
          当前所有任务:
          <span class="bold">{{count.task.computed}} / {{count.task.current}}</span>
        </div>
        <div class="button">
          <el-button @click.native="$router.push('/plan')" type="text" size="small">前往查看计划</el-button>
        </div>
        <el-progress
          color="#8e71c7"
          :width="count.opt.width"
          :stroke-width="count.opt.stroke"
          type="circle"
          :percentage="getPrecent(count.task.computed/count.task.current)"
        ></el-progress>
      </span>

      <span class="text">
        <div>
          检查经营个体数目:
          <span class="bold">{{count.biz.computed}} / {{count.biz.current}}</span>
        </div>
        <div class="button">
          <el-button @click.native="$router.push('/base/biz')" type="text" size="small">企业单位列表</el-button>
        </div>
        <el-progress
          color="#FF6633"
          :width="count.opt.width"
          :stroke-width="count.opt.stroke"
          type="circle"
          :percentage="getPrecent(count.biz.computed/count.biz.current)"
        ></el-progress>
      </span>

      <span class="text">
        <div>
          量化评级进度:
          <span class="bold">{{count.risk.computed}} / {{count.risk.current}}</span>
        </div>
        <div class="button">
          <el-button @click.native="$router.push('/risk')" type="text" size="small">前往量化评级</el-button>
        </div>
        <el-progress
          color="#33CC00"
          :width="count.opt.width"
          :stroke-width="count.opt.stroke"
          type="circle"
          :percentage="getPrecent(count.risk.computed/count.risk.current)"
        ></el-progress>
      </span>
    </div>

    <el-row>
      <el-col :span="22">
        <el-tabs v-model="tab">
          <el-tab-pane label="所有计划与任务" name="plan">
            <el-row>
              <el-col :span="24">
                <el-table v-loading="loading" :data="planPageData" size="medium">
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <div v-for="task of scope.row.$task" :key="task._id" class="task">
                        <span>
                          <el-tag
                            size="mini"
                            :type="getKindStateType(task.state)"
                          >{{taskState(task.state)}}</el-tag>
                          {{task.title}}
                        </span>
                        <span class="taskdetail">
                          <span>
                            进度：
                            <el-tag size="mini">{{task.progress[0]}}/{{task.progress[1]}}</el-tag>
                          </span>
                          <span>
                            分派时间：
                            <el-tag size="mini">{{task.date}}</el-tag>
                          </span>
                          <el-button
                            style="padding:0;"
                            size="mini"
                            type="text"
                            @click.native="$router.push(`/daily/${scope.row._id}/${task._id}`)"
                          >前往查看</el-button>
                        </span>
                      </div>
                    </template>
                  </el-table-column>

                  <el-table-column prop="title" label="标题" width="320px" sortable></el-table-column>
                  <el-table-column prop="$staff.name" label="制定人" sortable></el-table-column>
                  <el-table-column prop="$dep.name" label="制定单位" sortable></el-table-column>
                  <el-table-column prop="date" width="160px" label="制定日期" align="center"></el-table-column>
                  <el-table-column label="执行期限" align="center">
                    <template slot-scope="scope">
                      <div>
                        <el-tag size="mini">{{scope.row.limit[0]}}</el-tag>
                      </div>
                      <div>
                        <el-tag size="mini">{{scope.row.limit[1]}}</el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" align="center" sortable>
                    <template slot-scope="scope">
                      <el-tag
                        :type="getPlanStateType(scope.row.state)"
                        size="small"
                      >{{planState(scope.row.state)}}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="操作">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        @click="$router.push(`/${scope.row.kind}/${scope.row._id}`)"
                        type="primary"
                      >查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>

            <el-row>
              <el-pagination
                background
                @size-change="t=>planPageTable.pageSize=t"
                :current-page.sync="planPageTable.page"
                :page-sizes="planPageTable.pageSizes"
                :page-size="planPageTable.pageSize"
                layout="total, prev, pager, next, sizes"
                :total="planPageData.length"
              ></el-pagination>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="量化评级进度" name="risk">
            <el-row class="action" :gutter="15">
              <el-col :span="8">
                <el-select size="small" v-model="currentPlan" placeholder="选择一个检查计划">
                  <el-option
                    v-for="item in riskPlan"
                    :key="item._id"
                    :value="item._id"
                    :label="item.title"
                  ></el-option>
                </el-select>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-table
                  v-loading="loading"
                  :data="riskPageData"
                  size="medium"
                  style="width: 100%;margin-bottom:20px;"
                >
                  <el-table-column prop="$biz.name" label="单位名称" sortable></el-table-column>
                  <el-table-column prop="$dep.name" label="行政区域" sortable></el-table-column>
                  <el-table-column prop="$biz.lic.code" label="许可证编号"></el-table-column>
                  <el-table-column label="单位类型" sortable>
                    <template
                      v-if="scope.row.isChecked"
                      slot-scope="scope"
                    >{{riskKind(scope.row.$risk.kind)}}</template>
                  </el-table-column>
                  <el-table-column label="检查结果" sortable>
                    <template v-if="scope.row.isChecked" slot-scope="scope">
                      <el-tag
                        :type="getResultType(scope.row.$risk.level)"
                        size="medium"
                      >{{scope.row.$risk.point}} | {{riskLv(scope.row.$risk.level)}}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="$staff.name" label="检查人员" sortable></el-table-column>
                  <el-table-column prop="$risk.date" label="检查时间" align="center" sortable></el-table-column>
                  <el-table-column align="center" label="操作" min-width="100px">
                    <template slot-scope="scope">
                      <el-button
                        v-if="scope.row.isChecked"
                        @click.native="$router.push(`/risk/${scope.row.$biz._id}/${scope.row.$risk._plan}/${currentYear}`)"
                        size="mini"
                        type="primary"
                      >查看结果</el-button>
                      <el-button
                        v-else-if="currentYear>=new Date().getFullYear()"
                        @click.native="$router.push(`/risk/${scope.row.$biz._id}/${currentPlan}/${currentYear}`)"
                        size="mini"
                        type="primary"
                        :disabled="!currentPlan"
                      >{{currentPlan?"录入检查结果":"未选计划"}}</el-button>
                      <el-tag v-else type="info" size="mini">往年未完成检查</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>

            <el-row>
              <el-pagination
                background
                @size-change="t=>riskPageTable.pageSize=t"
                :current-page.sync="riskPageTable.page"
                :page-sizes="riskPageTable.pageSizes"
                :page-size="riskPageTable.pageSize"
                layout="total, prev, pager, next, sizes"
                :total="riskPageData.length"
              ></el-pagination>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { plan, planState } from "@/api/plan.js";
import { list as TaskList, taskState } from "@/api/task.js";
import { biz } from "@/api/biz.js";
import { staff } from "@/api/staff.js";
import { risk, riskKind, riskLv } from "@/api/risk.js";
import { dep } from "@/api/dep.js";

export default {
  name: "trace_trace",

  data() {
    return {
      tab: "plan",
      loading: true,

      staffData: [],
      depData: [],
      planData: [],
      riskData: [],
      bizData: [],

      currentPlan: null,
      currentYear: new Date().getFullYear(),
      riskPlan: [],

      planState,
      taskState,
      riskKind,
      riskLv,

      count: {
        opt: {
          width: 110,
          stroke: 4
        },
        plan: {
          total: 25,
          current: 3
        },
        task: {
          current: 20,
          computed: 7
        },
        biz: {
          current: 783,
          computed: 530
        },
        risk: {
          current: 1280,
          computed: 530
        }
      },

      planPageTable: {
        page: 1,
        pageSize: 10,
        pageSizes: [10, 25, 50, 100]
      },

      riskPageTable: {
        page: 1,
        pageSize: 10,
        pageSizes: [10, 25, 50, 100]
      }
    };
  },

  filters: {
    format(num) {
      return Number(num.toFixed(2));
    }
  },

  async beforeMount() {
    await this.init();
  },

  methods: {
    async init() {
      this.loading = true;

      this.staffData = (await staff()).data;
      this.depData = (await dep()).data;

      let planList = (await plan()).data;
      planList = planList.filter(t => t.kind !== "risk");
      await planList.forEach(async plan => {
        plan.$dep = this.depData.find(t => t._id === plan.dep);
        plan.$staff = this.staffData.find(t => t._id === plan.staff);
        plan.$task = (await TaskList(plan._id)).data;
      });
      this.planData = planList;

      this.riskPlan = (await plan(null, `kind=risk`)).data;
      let risks = (await risk(null, `year=${this.currentYear}`)).data;
      let riskBiz = (await biz(null, `kind=4`)).data;

      let riskList = [];
      riskBiz.forEach(b => {
        let r = risks.find(t => t._biz === b._id);
        let item = {
          $biz: b,
          $dep: this.depData.find(t => t._id === b.dep)
        };
        if (r) {
          item.isChecked = true;
          item.$staff = this.staffData.find(t => t._id === r.staff);
          item.$risk = r;
        } else {
          item.isChecked = false;
        }
        riskList.push(item);
      });
      this.riskData = riskList;

      this.loading = false;
    },

    getPrecent(val) {
      val *= 100;
      return Number(val.toFixed(2));
    },

    getResultType(lv) {
      return ["info", "success", "success", "warning", "danger"][lv];
    },

    getPlanStateType: state =>
      ["info", "warning", "primary", "primary", "success", "", ""][state],

    getKindType(kind) {
      return {
        daily: "primary",
        special: "warning",
        risk: "danger"
      }[kind];
    },

    getKindStateType: state =>
      ["", "warning", "primary", "success", "danger"][state]
  },

  computed: {
    planPageData() {
      return this.planData.slice(
        (this.planPageTable.page - 1) * this.planPageTable.pageSize,
        this.planPageTable.page * this.planPageTable.pageSize
      );
    },

    riskPageData() {
      return this.riskData.slice(
        (this.riskPageTable.page - 1) * this.riskPageTable.pageSize,
        this.riskPageTable.page * this.riskPageTable.pageSize
      );
    }
  }
};
</script>

<style lang="scss" scoped>
#banner {
  display: flex;

  & > span {
    padding: 10px;
    margin-right: 35px;
    margin-bottom: 15px;
  }

  .text {
    color: grey;
    font-size: 13px;
  }

  .bold {
    font-size: 17px;
    font-weight: bold;
    color: #000;
  }

  .button {
    margin-bottom: 15px;
  }
}

.task {
  padding: 8px;
  margin: 8px;
  background: #f3f3f3;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;

  .taskdetail {
    width: 460px;
    display: flex;
    justify-content: space-around;
  }
}
</style>
