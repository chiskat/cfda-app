<template>
  <el-row id="base_singletemplate">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="/base/template">基础信息</el-breadcrumb-item>
      <el-breadcrumb-item to="/base/template">模板管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{title}} （量化评级）</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row class="title">{{title}} （量化评级）</el-row>

    <el-form label-position="left" style="margin-top:20px;" label-width="100px">
      <el-row style="font-size:18px;margin-bottom:15px;" class="section">模板详情</el-row>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="模板名称：" required>
            <el-input :disabled="!edit" v-model="current.name" placeholder="请输入模板名称"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="创建人：">
            <el-input disabled v-model="staff.name"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="所属科室：">
            <el-input disabled v-model="dep.name"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item prop="date" label="制定日期：">
            <el-date-picker
              disabled
              style="width:100%"
              type="date"
              v-model="createDate"
              value-format="yyyy-M-d"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item prop="date" label="模板类别：">
            <el-tag size="medium">{{current.kind == "daily" ? "日常检查" : "风险量化检查"}}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="激活状态：">
            <el-radio-group :disabled="!edit" v-model="current.state">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item prop="productaddr" label="备注:">
            <el-input
              :disabled="!edit"
              v-model="current.tips"
              :rows="6"
              type="textarea"
              placeholder="请输入备注信息"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row style="font-size:18px;margin-bottom:15px;" class="section">模板内容</el-row>
    </el-form>

    <cfda-risk-template v-model="current.content" :edit="edit"></cfda-risk-template>

    <el-row>
      <el-col :span="24">
        <el-button
          v-if="edit"
          @click="editOK"
          icon="el-icon-check"
          type="primary"
        >{{isNew ? "完成创建" : "完成编辑"}}</el-button>
        <el-button v-if="!edit" @click="edit=true" icon="el-icon-edit-outline" type="primary">编辑模板</el-button>
        <el-button
          v-if="edit && !isNew"
          @click="editCancel"
          style="margin-left:20px;"
          icon="el-icon-refresh"
        >取消并还原</el-button>
        <router-link to="/base/template">
          <el-button style="margin-left:20px;">返回模板管理</el-button>
        </router-link>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { copy, date } from "@/utils/utils.js";
import { staff } from "@/api/staff.js";
import { dep } from "@/api/dep.js";
import { template, emptyTemplate } from "@/api/template";

export default {
  name: "base_singlerisktemplate",

  data() {
    return {
      title: "",
      edit: null,
      isNew: null,

      current: emptyTemplate("risk"),
      origin: emptyTemplate("risk"),

      dep: {},
      staff: {},
      createDate: date()
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
      const tid = this.$route.params.templateid;
      this.isNew = tid === "new";
      this.edit = tid === "new";

      if (!this.isNew) {
        this.origin = (await template(tid)).data;
        this.createDate = this.origin.date;
      }

      this.dep = (await dep(
        this.isNew ? this.$store.state.currentUser.dep : this.origin.dep
      )).data;
      this.staff = (await staff(
        this.isNew ? this.$store.state.currentUser._id : this.origin.staff
      )).data;

      if (this.isNew) {
        this.origin.dep = this.dep._id;
        this.origin.staff = this.staff._id;
        this.origin.date = this.createDate;
      }

      this.current = copy(this.origin);
      this.title = this.isNew ? "新建量化评级模板" : this.origin.name;
    },

    async editOK() {
      this.origin = (await template(this.current)).data;

      if (this.isNew) {
        this.$router.push(`/base/risktemplate/${this.origin._id}`);
      } else {
        this.init();
      }
    },

    editCancel() {
      this.current = copy(this.origin);
      this.title = this.origin.name;
      this.edit = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 0;
}
</style>
