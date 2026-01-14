<template>
  <div>
    <div id="report_main">
      <div class="title">
        <h3>{{province}}{{city}}{{biz.name}}食品药品监督管理局</h3>
        <h1>食品生产经营日常监督检查结果记录表</h1>
        <p>编号:{{current.report.num}}</p>
      </div>

      <table>
        <tr class="info">
          <td class="label">名称:</td>
          <td>{{biz.name}}</td>
          <td class="label">地址:</td>
          <td>{{biz.address}}</td>
        </tr>
        <tr class="info">
          <td class="label">联系人:</td>
          <td>{{biz.contact}}</td>
          <td class="label">联系方式:</td>
          <td>{{biz.phone}}</td>
        </tr>
        <tr class="info">
          <td class="label">许可证编号:</td>
          <td>{{biz.lic?biz.lic.code:""}}</td>
          <td class="label">检查次数:</td>
          <td>本年度第{{current.report.count}}次检查</td>
        </tr>
        <tr>
          <td class="content" colspan="4">
            <p>检查内容：</p>
            <p>
              {{province}}{{city}}食品药品监督管理局检查人员
              <span v-if="staff1">{{staff1.name}}</span>
              <span v-if="staff2">、{{staff2.name}}</span>
              根据《中华人民共和国食品安全法》及其实施条例、《{{plan.template.name}}》的规定，于{{current.date | dateDisplay}}对你单位进行了监督检查。
            </p>

            <p>本次监督检查按照表《{{plan.template.name}}》开展，共检查了{{itemCount.normal.length+itemCount.important.length}}项内容。其中:</p>

            <p>
              重点项{{itemCount.important.length}}项，项目序号分别是：
              <span
                v-for="item of itemCount.important"
                :key="item"
              >
                <span class="reportitem">{{item}}</span>、
              </span>；
            </p>
            <p>
              发现问题
              <strong>{{itemCount.importantProblem.length}}</strong> 项
              <template v-if="itemCount.importantProblem.length>0">
                ，项目序号分别是：
                <span v-for="item of itemCount.importantProblem" :key="item">
                  <span class="reportitem">{{item}}</span>、
                </span>
              </template>
              。
            </p>
            <br>
            <p>
              一般项{{itemCount.normal.length}}项，项目序号分别是：
              <span
                v-for="item of itemCount.normal"
                :key="item"
              >
                <span class="reportitem">{{item}}</span>、
              </span>
              ；
            </p>

            <p>
              发现问题
              <strong>{{itemCount.normalProblem.length}}</strong> 项
              <template v-if="itemCount.normalProblem.length>0">
                ，项目序号分别是：
                <span v-for="item of itemCount.normalProblem" :key="item">
                  <span class="reportitem">{{item}}</span>、
                </span>
              </template>
              。
            </p>
            <br>
          </td>
        </tr>
        <tr>
          <td class="result" colspan="4">
            <p>
              检查结果：
              <span class="resultselected">
                <span :class="{'checked':current.result===1}"></span>
                符合
              </span>
              <span class="resultselected">
                <span :class="{'checked':current.result===2}"></span>
                基本符合
              </span>
              <span class="resultselected">
                <span :class="{'checked':current.result===3}"></span>
                不符合
              </span>
            </p>
            <p>
              结果处理：
              <span class="resultselected">
                <span :class="{'checked':current.handle===1}"></span>
                通过
              </span>
              <span class="resultselected">
                <span :class="{'checked':current.handle===2}"></span>
                书面限期整改
              </span>
              <span class="resultselected">
                <span :class="{'checked':current.handle===3}"></span>
                食品生产经营者立即停止食品生产经营活动
              </span>
            </p>
            <p style="margin-top:10px;">说明：</p>
            <p class="desc">{{current.report.remark}}</p>
          </td>
        </tr>
        <tr class="sign">
          <td colspan="2" style="vertical-align: top;">
            <p>执法人员(签名)：</p>
          </td>
          <td colspan="2">
            <p>被检查单位意见：</p>
            <p style="text-indent:30px">{{current.report.bizopinion}}</p>
            <p style="margin-top:40px;">法人或责任人意见：</p>
            <p style="text-indent:30px">{{current.report.laweropinion}}</p>
            <p style="text-align:right;margin-top:30px;">{{current.date | dateDisplay}}</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template> 

<script>
import { staff } from "@/api/staff.js";

export default {
  name: "cfda-record-report",
  props: ["current", "biz", "task", "plan"],
  data() {
    return {
      province: process.env.VUE_APP_PROVINCE_NAME,
      city: process.env.VUE_APP_CITY_NAME,
      staff1: null,
      staff2: null
    };
  },

  async beforeMount() {
    await this.init();
  },

  async beforeRouteUpdate(to, from, next) {
    next();
    await this.init();
  },

  filters: {
    dateDisplay(d) {
      let dt = new Date(d);
      return `${dt.getFullYear()}年 ${dt.getMonth() + 1}月 ${dt.getDate()}日`;
    }
  },

  methods: {
    async init() {
      if (this.current.staff1 && this.current.staff1.length > 0) {
        this.staff1 = (await staff(this.current.staff1)).data;
      }
      if (this.current.staff2 && this.current.staff2.length > 0) {
        this.staff2 = (await staff(this.current.staff2)).data;
      }
    }
  },

  computed: {
    itemCount() {
      if (!this.current || !this.current.detail || !this.plan) {
        return {};
      }

      let itemCountResult = {
        normal: [],
        important: [],
        normalProblem: [],
        importantProblem: []
      };

      let t = this.plan.template.content;
      let r = this.current.detail;

      for (let i = 0; i < t.length; i++) {
        for (let j = 0; j < t[i].detail.length; j++) {
          let item = t[i].detail[j];
          let result = r[i][j];

          if (result) {
            itemCountResult[item.important ? "important" : "normal"].push(
              `${i + 1}.${j + 1}`
            );

            if (
              (item.type === 1 && result === 2) ||
              (item.type === 2 && result === 3)
            ) {
              itemCountResult[
                item.important ? "importantProblem" : "normalProblem"
              ].push(`${i + 1}.${j + 1}`);
            }
          }
        }
      }

      return itemCountResult;
    }
  }
};
</script>

<style lang="scss" scoped>
#report_main {
  width: 700px;
  margin-top: 20px;

  .reportitem {
    text-decoration: underline;
    text-underline-position: under;
  }

  .title {
    h3 {
      font-size: 22px;
      text-align: center;
      font-weight: normal;
      margin: 5px 0;
    }

    h1 {
      text-align: center;
    }

    p {
      text-align: right;
      margin: 5px 0;
      font-size: 15px;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      border-collapse: collapse;
      border: 1.5px solid #000;
      padding: 5px 8px;
    }

    tr.info {
      td {
        width: 34%;
      }

      .label {
        width: 16%;
      }
    }

    .content {
      p {
        margin: 0 0 8px;
        text-indent: 30px;

        &:first-child {
          text-indent: 0;
        }
      }
    }

    .result {
      p {
        margin: 0;
      }
      .resultselected {
        margin-right: 10px;

        span {
          width: 8px;
          height: 8px;
          border: 1px solid #000;
          display: inline-block;
        }

        .checked {
          background-color: #000;
        }
      }

      .desc {
        text-indent: 30px;
        min-height: 140px;
      }
    }

    .sign {
      p {
        margin: 0;
      }
    }
  }
}
</style>

