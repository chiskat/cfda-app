<template>
  <el-row id="grid_singlestaff">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="/grid/staff">网格化管理</el-breadcrumb-item>
      <el-breadcrumb-item to="/grid/staff">机构职员管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{title}} （行政人员）</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row class="title">{{title}} （行政人员）</el-row>

    <el-form
      :rules="rules"
      ref="current"
      :model="current"
      label-position="left"
      style="margin-top:20px;"
      label-width="140px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="人员姓名:" prop="name">
            <el-input :disabled="!edit" v-model="current.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别:" prop="sex">
            <el-radio-group :disabled="!edit" v-model="current.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态:" prop="state">
            <el-radio-group :disabled="!edit" size="small" v-model="current.state">
              <el-radio :label="1">激活</el-radio>
              <el-radio :label="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="职务:" prop="job">
            <el-input :disabled="!edit" v-model="current.job" placeholder="请输入人员职务"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属行政级别:">
            <el-cascader
              :disabled="!edit"
              :show-all-levels="false"
              v-model="dep"
              :props="{label:'name',value:'_id'}"
              :options="cascadeDepData"
              placeholder="选择层级"
              change-on-select
            ></el-cascader>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="isNew" :gutter="20">
        <el-col :span="12">
          <el-form-item label="账户密码:" prop="pwd" required>
            <el-input :disabled="!edit" show-password v-model="pwd" placeholder="请输入密码"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row>
      <el-col :span="24">
        <el-button @click="edit=true" v-if="!edit" icon="el-icon-edit" type="primary">编辑该人员</el-button>
        <el-button
          @click="editOK"
          v-if="edit"
          icon="el-icon-check"
          type="primary"
        >{{isNew?"完成新建":"完成编辑"}}</el-button>
        <el-button @click="editCancel" v-if="edit&&!isNew" icon="el-icon-close">取消并还原</el-button>
        <router-link to="/grid/staff">
          <el-button style="margin-left:20px;">返回行政人员管理</el-button>
        </router-link>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { dep } from "@/api/dep.js";
import { staff, emptyStaff } from "@/api/staff.js";
import { copy } from "@/utils/utils.js";

export default {
  name: "grid_singlestaff",

  data() {
    return {
      title: "",

      isNew: null,
      edit: null,

      dep: [],
      cascadeDepData: [],

      current: emptyStaff(),
      origin: emptyStaff(),
      pwd: "",

      rules: {
        name: [
          {
            required: true,
            message: "必须输入人员姓名",
            trigger: ["blur", "change"]
          }
        ],
        sex: [
          {
            required: true,
            message: "必须设置人员性别",
            trigger: ["blur", "change"]
          }
        ],
        state: [
          {
            required: true,
            message: "必须设置人员状态",
            trigger: ["blur", "change"]
          }
        ],
        job: [
          {
            required: true,
            message: "必须输入人员职务",
            trigger: ["blur", "change"]
          }
        ]
      }
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
      const staffId = this.$route.params.staffid;
      this.isNew = staffId === "new";
      this.edit = staffId === "new";

      this.cascadeDepData = (await dep(null, 'cascade=1')).data;
      if (!this.isNew) {
        this.origin = (await staff(staffId)).data;
        this.dep = (await dep(this.origin.dep)).data._rel;
      } else {
        this.dep = this.cascadeDepData[0]._rel;
      }

      this.title = this.isNew ? "新增行政人员" : this.origin.name;
      this.current = copy(this.origin);
    },

    async editOK() {
      this.origin = (await staff(
        Object.assign({ pwd: this.pwd }, this.current)
      )).data;
      if (this.origin._id === this.$store.state.currentUser._id) {
        this.$store.commit("auth", this.origin);
      }

      if (this.isNew) {
        this.$router.push(`/grid/staff/${this.origin._id}`);
      } else {
        this.init();
      }
    },

    editCancel() {
      this.current = copy(this.origin);
      this.edit = false;
    }
  },

  computed: {
    result() {
      let resultStaff = copy(this.current);
      resultStaff.dep = this.dep.slice(-1)[0];

      return resultStaff;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 0;
}
</style>

