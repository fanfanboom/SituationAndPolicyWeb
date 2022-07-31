<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcostoms-alearance"></i> 批量新增/更新学生信息
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div style="margin-bottom: 10px">
        <input type="file" accept=".xls,.xlsx" class="upload-file" @change="changeExcel($event)">
        <el-button type="warning" icon="el-icon-top" :disabled="!canSubmit" @click="handleSubmit"
                   style="margin-right: 10px">提交更新
        </el-button>
        <el-tag type="primary" size="large">Tips:单次导入条数与机器性能相关，建议单次导入不超过1W条。</el-tag>
      </div>
      <el-table :data="tableData" border>
        <el-table-column label="序号" width="70" align="center" type="index"></el-table-column>
        <el-table-column label="学号" prop="id"></el-table-column>
        <el-table-column label="姓名" prop="personName"></el-table-column>
        <el-table-column label="性别" prop="sex"></el-table-column>
        <el-table-column label="年级" prop="grade"></el-table-column>
        <el-table-column label="学院" prop="department.name"></el-table-column>
        <el-table-column label="专业" prop="major.name"></el-table-column>
        <el-table-column label="班级" prop="myClass"></el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" width="40%">
      <el-result icon="info" title="数据解析中，请您耐心等待..." v-if="info===''"></el-result>
      <el-result icon="error" title="数据校验失败,无法执行导入" :sub-title="info" v-if="info!==''"></el-result>
    </el-dialog>

    <el-dialog v-model="needSecondsVisible" width="40%">
      <el-result icon="success" :title="needSecondsMessage"></el-result>
    </el-dialog>

  </div>
</template>

<script>
import {computed, onMounted, reactive, toRefs} from "vue";
import * as XLSX from "xlsx";
import {ElMessage} from "element-plus";
import service from "../utils/request";

export default {
  name: "StudentsAddOrUpdates",
  setup() {
    const state = reactive({
      tableData: [],
      departments: [],
      majors: [],
      dialogVisible: false,
      info: "",
      canSubmit: false,
      needSeconds: 0,
    });
    const needSecondsMessage = computed(() => {
      return `提交中，预计还需要${state.needSeconds}秒...`
    });
    const needSecondsVisible = computed(() => {
      return state.needSeconds > 0;
    })
    onMounted(() => {
      service.get("api/department/all").then(res => {
        let departmentsList = res.obj;
        departmentsList.map(item => {
          state.departments[item.name] = item.id;
        })
      });
      service.get("/api/major/all").then(res => {
        let majorList = res.obj;
        majorList.map(item => {
          state.majors[item.name] = item.id;
        })
      })
    });
    const changeExcel = e => {
      state.info = "";
      state.canSubmit = false;
      state.dialogVisible = true;
      const files = e.target.files
      if (files.length <= 0) {
        return false
      } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
        ElMessage.error("上传格式不正确，请上传xls或者xlsx格式文件");
        return false
      }
      // 读取表格
      const fileReader = new FileReader()
      fileReader.onload = ev => {
        const workbook = XLSX.read(ev.target.result, {
          type: "binary"
        })
        const wsName = workbook.SheetNames[0]
        const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsName])
        dealExcel(ws);// ...数据转换
        // console.log('ws:', ws) // 转换成json的数据
        state.tableData = ws;
        valueCheck();
      }
      fileReader.readAsBinaryString(files[0])
    };
    const dealExcel = ws => {
      ws.forEach(sourceStudent => {
        // 字段建立
        sourceStudent.id = sourceStudent["学号"];
        sourceStudent.username = sourceStudent["学号"];
        sourceStudent.personName = sourceStudent["姓名"];
        sourceStudent.sex = sourceStudent["性别"];
        sourceStudent.grade = sourceStudent["年级"];
        sourceStudent.myClass = sourceStudent["班级简称"];
        sourceStudent.major = {id: "", name: ""};
        sourceStudent.major.id = state.majors[sourceStudent["专业名称"]];
        sourceStudent.major.name = sourceStudent["专业名称"];
        sourceStudent.department = {id: "", name: ""};
        sourceStudent.department.id = state.departments[sourceStudent["学院"]];
        sourceStudent.department.name = sourceStudent["学院"];
        // 删除无用数据
        Object.keys(sourceStudent).forEach(key => {
          if (key !== "id" && key !== "username" && key !== "personName" && key !== "sex" && key !== "grade" && key !== "myClass"
              && key !== "major" && key !== "department") {
            delete sourceStudent[key];
          }
        })
      });
    };
    const valueCheck = () => {
      // 检查是否有尚未建立的学院
      let unSavedDepartmentItems = state.tableData.filter(item => {
        return item.department.id === "" || item.department.id === undefined;
      })
      let unSavedDepartments = [];
      unSavedDepartmentItems.map(item => {
        if (unSavedDepartments.indexOf(item.department.name) === -1) {
          unSavedDepartments.push(item.department.name);
        }
      });
      let info1 = "";
      if (unSavedDepartments.length !== 0) {
        info1 = `“${unSavedDepartments.toString()}”学院尚未建立，请先增设学院。`;
      }
      // 检测是否有尚未建立的专业
      let unSavedMajorItems = state.tableData.filter(item => {
        return item.major.id === "" || item.major.id === undefined;
      })
      let unSavedMajors = [];
      unSavedMajorItems.map(item => {
        if (unSavedMajors.indexOf(item.major.name) === -1) {
          unSavedMajors.push(item.major.name);
        }
      });
      let info2 = "";
      if (unSavedMajors.length !== 0) {
        info2 = `“${unSavedMajors.toString()}”专业尚未建立，请先增设专业。`
      }
      state.info = info1 + info2;
      if (state.info === "") {
        state.dialogVisible = false;
        ElMessage.success("数据校验通过，允许执行导入");
        state.canSubmit = true;
      }
    };
    const handleSubmit = () => {
      state.canSubmit = false;
      // 导入操作通常耗时很长，需要线程同步，并在页面展示提示信息,但是如果中间返回成功了，那么终止计时！
      const rps = 30;
      state.needSeconds = Math.round(state.tableData.length / rps);
      let timeCount = setInterval(() => {
        state.needSeconds--;
      }, 1000);
      let timeDone = setTimeout(()=>{
        clearInterval(timeCount);
        state.needSeconds=0;
        state.tableData = [];
        ElMessage.success("新增/更新学生信息成功");
      },Math.round(state.tableData.length / rps)*1000)
      service.post("/api/student/addOrUpdates", state.tableData)
          .then(() => {
            // 如果快速返回了，提前终止计时器、更新器
            clearInterval(timeCount);
            clearTimeout(timeDone);
            state.needSeconds = 0;
            state.tableData = [];
          });
    }
    return {
      ...toRefs(state),needSecondsMessage,needSecondsVisible,
      changeExcel, handleSubmit
    }
  },
}
</script>

<style scoped>

</style>
