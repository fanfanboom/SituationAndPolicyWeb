<template>
  <div class="sidebar">
    <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="sidebar.collapse" background-color="#324157"
             text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-submenu :index="item.index" :key="item.index">
            <template #title>
              <i :class="item.icon" class="iconfont"></i>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                <template #title>{{ subItem.title }}</template>
                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                  {{ threeItem.title }}
                </el-menu-item>
              </el-submenu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index">{{ subItem.title }}
              </el-menu-item>
            </template>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon" class="iconfont"></i>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import {computed, onMounted, ref} from "vue";
import {useSidebarStore} from '../store/sidebar'
import {useRoute} from "vue-router";

export default {
  setup() {
    const items = ref([]);
    const items_school = [
      {
        icon: "el-icon-lxsignboard-fill",
        index: "/dashboard",
        title: "系统首页",
      }, {
        icon: "el-icon-lxcostoms-alearance",
        index: "baseInfo",
        title: "基础数据",
        subs: [
          {
            index: "/departments",
            title: "学院信息"
          }, {
            index: "/majors",
            title: "专业信息"
          }, {
            index: "/students",
            title: "学生信息"
          }, {
            index: "/courses",
            title: "课程信息"
          }
        ]
      }, {
        icon: "el-icon-lxcustomization",
        index: "scoreSubmits",
        title: "成绩提交",
        subs: [{
          index: "/teachingClasses",
          title: "教学班",
        }]
      }, {
        icon: "el-icon-lxconditions",
        index: "systemManage",
        title: "系统管理",
        subs: [{
          index: "/userManage",
          title: "用户管理"
        }, {
          index: "/user",
          title: "个人中心"
        }]
      }
    ];
    const items_teacher = [
      {
        icon: "el-icon-lxsignboard-fill",
        index: "/dashboard",
        title: "系统首页",
      }, {
        icon: "el-icon-lxcustomization",
        index: "scoreSubmits",
        title: "成绩管理",
        subs: [{
          index: "/teacherTeachingClasses",
          title: "我的教学班",
        }]
      },{
        icon: "el-icon-lxconditions",
        index: "systemManage",
        title: "系统管理",
        subs: [{
          index: "/userManage",
          title: "用户管理"
        }, {
          index: "/user",
          title: "个人中心"
        }]
      }];

    const route = useRoute();
    const onRoutes = computed(() => {
      return route.path;
    });

    const sidebar = useSidebarStore();
    onMounted(() => {
      let user = JSON.parse(sessionStorage.getItem("loginUser"));
      let role = user.authorities[0].authority;
      if ("school" === role) {
        items.value = items_school;
      }else if ("teacher" === role){
        items.value=items_teacher;
      }
    })
    return {
      items,
      onRoutes,
      sidebar,
    };
  },
};
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}

.sidebar > ul {
  height: 100%;
}
</style>
