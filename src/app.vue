<template>
  <div id="app">
    <el-container>
      <el-aside class="aside" width="240px">
        <img id="logoimg" src="@/assets/img/logo.png">

        <el-col :span="24">
          <el-menu
            ref="menu"
            :default-active="currentMenuPath"
            :unique-opened="true"
            class="aside-menu"
            :router="true"
            background-color="#383838"
            text-color="#fff"
            active-text-color="#ffd04b"
          >
            <div id="aside-logo"></div>

            <template v-for="menuItem of menuWithRoutePath">
              <el-menu-item v-if="!menuItem.group" :key="menuItem.id" :index="menuItem.path">
                <i v-if="menuItem.icon" :class="menuItem.icon"></i>
                <span slot="title">{{menuItem.label}}</span>
              </el-menu-item>

              <el-submenu v-if="menuItem.group" :key="menuItem.id" :index="menuItem.url">
                <template slot="title">
                  <i v-if="menuItem.icon" :class="menuItem.icon"></i>
                  <span slot="title">{{menuItem.label}}</span>
                </template>
                <el-menu-item-group>
                  <el-menu-item
                    v-for="menuGroupItem of menuItem.group"
                    :key="menuGroupItem.id"
                    :index="menuGroupItem.path"
                  >{{menuGroupItem.label}}</el-menu-item>
                </el-menu-item-group>
              </el-submenu>
            </template>
          </el-menu>
        </el-col>
      </el-aside>

      <el-container>
        <el-header class="title" height="80px">
          <span class="titletext">{{depName}}食品生产经营监管信息化平台</span>

          <div id="headmenu">
            <el-popover
              placement="bottom"
              title="通知和消息"
              width="400"
              trigger="manual"
              v-model="visible"
            >
              <el-alert
                @click.native="openNotice(item.id)"
                @close="closeNotice(item.id)"
                style="cursor:pointer;"
                class="notice"
                v-for="item of notice"
                :key="item.id"
                :title="item.title"
                :type="item.type"
                :description="item.content"
                show-icon
              ></el-alert>
              <el-badge
                icon="el-icon-bell"
                :hidden="notice.length<=0"
                circle
                slot="reference"
                :max="99"
                :value="notice.length"
                class="item"
              >
                <el-button icon="el-icon-bell" circle @click="visible = !visible"></el-button>
              </el-badge>
            </el-popover>

            <span>
              <el-dropdown>
                <el-button round>{{staff.name}}</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="logout">注销登录</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </div>
        </el-header>

        <el-main class="main" id="main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import menu from "@/menu.js";
import { logout } from './api/action';

export default {
  name: "app",

  data() {
    return {
      depName: process.env.VUE_APP_CITY_NAME,
      currentMenuPath: null,
      visible: false,

      notice: this.$store.state.notice,
      staff: this.$store.state.currentUser
    };
  },

  beforeMount() {
    this.routePathChange(this.$route.path);
  },

  beforeRouteUpdate(to, from, next) {
    this.routePathChange(to.path);
    next();
  },

  computed: {
    menuWithRoutePath() {
      return menu.getMenuWithPath();
    }
  },

  methods: {
    routePathChange(urlPath) {
      let menuPath = "";
      let paths = urlPath.split("/").filter(t => t.trim().length > 0);

      let match = this.menuWithRoutePath.find(m => m.url === paths[0]);
      if (match) {
        menuPath += `/${paths[0]}`;
      }

      if (match && match.group && paths[1]) {
        let group = match.group.find(g => g.url == paths[1]);
        if (group) {
          menuPath += `/${paths[1]}`;
        }
      }

      this.currentMenuPath = menuPath;
    },

    openNotice() {},

    closeNotice(nid) {
      let i = this.$store.state.notice.findIndex(t => t.id === nid);
      this.$store.state.notice.splice(i, 1);
    },

    async logout() {
      await logout()
      this.$store.commit("logout");
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped lang="scss">
#logoimg {
  width: 40%;
  margin: 25px 0;
  margin-left: 65px;
}

.is-active {
  background-color: #409eff !important;
  color: #fff !important;
}

.aside {
  overflow-y: hidden;
  background: #383838;
  border: none;
  min-height: 100vh;
  box-shadow: 3px 0px 4px rgba(0, 21, 41, 0.08);
  z-index: 1000;
}

.title {
  background: #fff;
  box-shadow: 0 4px 3px 0px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  z-index: 999;

  .titletext {
    padding-left: 10px;
    font-weight: 400;
    font-size: 30px;
    line-height: 80px;
    color: #383838;
  }

  #headmenu {
    display: flex;
    align-items: center;

    & > span {
      margin: 0 5px;
    }
  }
}

.notice {
  margin-top: 10px;
}

.aside-menu {
  border-right: none;
}

#aside-logo {
  border-radius: 4px;
  height: 10px;
  color: #fff;
  text-align: center;
}

.main {
  padding-left: 30px;
  position: relative;
}
</style>
