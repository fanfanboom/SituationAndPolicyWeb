<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><i class="iconfont el-icon-lxconditions"></i>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="教师用户" name="teacher">
          <el-input v-model="teacherLike" placeholder="请输入教师号/教师姓名，支持模糊查询" style="width: 300px;margin-right: 10px"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="handleTeacherSearch" :disabled="!teacherSearchAble">搜索</el-button>
          <el-divider></el-divider>
          <el-table :data="teachers" border>
            <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
            <el-table-column prop="id" label="教师号"></el-table-column>
            <el-table-column prop="personName" label="姓名"></el-table-column>
            <el-table-column prop="sex" label="性别"></el-table-column>
            <el-table-column prop="department.name" label="归属学院"></el-table-column>
            <el-table-column label="快捷操作">
              <template #default="scope">
                {{scope.row.id}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="学生用户" name="student">
          <el-input v-model="studentLike" placeholder="请输入学号/学生姓名，支持模糊查询" style="width: 300px;margin-right: 10px"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="handleStudentSearch" :disabled="!studentSearchAble">搜索</el-button>
          <el-divider></el-divider>
          <el-table :data="students" border>
            <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
            <el-table-column prop="id" label="学号" width="110"></el-table-column>
            <el-table-column prop="personName" label="姓名"></el-table-column>
            <el-table-column prop="sex" label="性别" width="50" align="center"></el-table-column>
            <el-table-column prop="grade" label="年级" width="100"></el-table-column>
            <el-table-column prop="department.name" label="归属学院"></el-table-column>
            <el-table-column prop="major.name" label="专业"></el-table-column>
            <el-table-column prop="myClass" label="班级"></el-table-column>
            <el-table-column label="快捷操作">
              <template #default="scope">
                {{scope.row.id}}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import {computed, reactive, toRefs} from "vue";
import service from "../utils/request";

export default {
  name: "UserManage",
  setup() {
    const state = reactive({
      activeTab:"teacher",
      teacherLike:"",
      studentLike:"",
      teachers:[],
      students:[]
    });
    const teacherSearchAble=computed(()=>{
      return ""!==state.teacherLike;
    })
    const studentSearchAble=computed(()=>{
      return ""!==state.studentLike;
    })
    const handleTeacherSearch = () => {
      service.get(`/api/teacher/findByIdOrPersonName/${state.teacherLike}`).then(res=>{
        state.teachers=res.obj;
      })
    };
    const handleStudentSearch = () => {
      service.get(`/api/student/findByIdOrPersonName/${state.studentLike}`).then(res=>{
        state.students=res.obj;
      })
    };
    return {
      ...toRefs(state),
      teacherSearchAble,studentSearchAble,
      handleTeacherSearch,handleStudentSearch
    }
  },
}
</script>

<style scoped>

</style>
