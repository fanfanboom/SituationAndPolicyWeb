<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><i class="iconfont el-icon-lxconditions"></i>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="教师用户" name="teacher" v-if="isSchoolRole">
          <el-input v-model="teacherLike" placeholder="请输入教师号/教师姓名，支持模糊查询"
                    style="width: 300px;margin-right: 10px"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="handleTeacherSearch" :disabled="!teacherSearchAble">
            搜索
          </el-button>
          <el-button type="primary" icon="el-icon-plus" @click="handleOpenAdd">新增</el-button>
          <el-divider></el-divider>
          <el-table :data="teachers" border>
            <el-table-column type="index" label="序号" align="center" width="50"></el-table-column>
            <el-table-column prop="id" label="教师号"></el-table-column>
            <el-table-column prop="personName" label="姓名"></el-table-column>
            <el-table-column prop="sex" label="性别"></el-table-column>
            <el-table-column prop="department.name" label="归属学院"></el-table-column>
            <el-table-column label="快捷操作">
              <template #default="scope">
                <el-button type="warning" icon="iconfont el-icon-lxnamecard" size="small" @click="initPass(scope.row)">
                  重置密码
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="学生用户" name="student">
          <el-input v-model="studentLike" placeholder="请输入学号/学生姓名，支持模糊查询"
                    style="width: 300px;margin-right: 10px"></el-input>
          <el-button type="primary" icon="el-icon-search" @click="handleStudentSearch" :disabled="!studentSearchAble">
            搜索
          </el-button>
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
                <el-button type="warning" icon="iconfont el-icon-lxnamecard" size="small" @click="initPass(scope.row)">
                  重置密码
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="新增教师" v-model="dialogVisible" width="40%">
      <el-form :model="newTeacher" label-width="120px" ref="addTeacher" :rules="rules">
        <el-form-item label="教师id/用户名" prop="id">
          <el-input placeholder="请输入教师id/用户名" v-model="newTeacher.id"></el-input>
        </el-form-item>
        <el-form-item label="教师姓名" prop="personName">
          <el-input placeholder="请输入教师姓名" v-model="newTeacher.personName"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select placeholder="请选择教师性别" v-model="newTeacher.sex">
            <el-option label="男" value="男"></el-option>
            <el-option label="女" value="女"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="归属学院" prop="department.id">
          <el-select placeholder="请选择教师归属学院" v-model="newTeacher.department.id">
            <el-option v-for="(item,index) in departments" :label="item.name" :value="item.id" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
                <span>
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleAdd">确 定</el-button>
                </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref, toRefs} from "vue";
import service from "../utils/request";
import {ElMessageBox} from "element-plus";

export default {
  name: "UserManage",
  setup() {
    const state = reactive({
      activeTab: "teacher",
      teacherLike: "",
      studentLike: "",
      teachers: [],
      students: [],
      dialogVisible: false,
      newTeacher: {id: "", personName: "", sex: "", department: {id: ""}},
      departments: [],
      isSchoolRole:true
    });
    onMounted(()=>{
      let user=JSON.parse(sessionStorage.getItem("loginUser"));
      if ("teacher" === user.authorities[0].authority){
        state.activeTab="student";
        state.isSchoolRole=false;
      }
    });
    const rules = {
      id: [{
        required: true,
        message: "请输入教师id/用户名",
        trigger: "blur",
      }],
      personName: [{
        required: true,
        message: "请输入教师姓名",
        trigger: "blur",
      }],
      sex: [{
        required: true,
        message: "请选择教师性别",
        trigger: "change",
      }],
      department: {
        id: [{
          required: true,
          message: "请选择教师归属学院",
          trigger: "change",
        }]
      }
    }
    const teacherSearchAble = computed(() => {
      return "" !== state.teacherLike;
    })
    const studentSearchAble = computed(() => {
      return "" !== state.studentLike;
    })
    const handleTeacherSearch = () => {
      service.get(`/api/teacher/findByIdOrPersonName/${state.teacherLike}`).then(res => {
        state.teachers = res.obj;
      })
    };
    const handleStudentSearch = () => {
      service.get(`/api/student/findByIdOrPersonName/${state.studentLike}`).then(res => {
        state.students = res.obj;
      })
    };
    const initPass = (user) => {
      service.post(`/api/user/initpass/${user.id}`).then(() => {
        ElMessageBox.alert(`\"${user.id}-${user.personName}\"密码已重置为\"sdau${user.id}\"`, "提示");
      })
    };
    const handleOpenAdd = () => {
      state.dialogVisible = true;
      if (state.departments.length === 0) {
        service.get("/api/department/all").then(res => {
          state.departments = res.obj;
        })
      }
    };
    const addTeacher = ref(null);
    const handleAdd = () => {
      addTeacher.value.validate(isValid => {
        if (isValid) {
          service.post("/api/teacher/add",state.newTeacher).then(()=>{
            state.dialogVisible=false;
          });
        }
      })
    };
    return {
      ...toRefs(state), rules, addTeacher,
      teacherSearchAble, studentSearchAble,
      handleTeacherSearch, handleStudentSearch, initPass, handleOpenAdd, handleAdd
    }
  },
}
</script>

<style scoped>

</style>
