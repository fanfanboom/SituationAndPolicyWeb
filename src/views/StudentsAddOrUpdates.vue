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
        <el-button type="warning" icon="el-icon-plus" :disabled="!canSubmit">提交更新</el-button>
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

  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue";
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
      canSubmit: false
    });
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
      state.info="";
      state.canSubmit=false;
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
      if (state.info===""){
        state.dialogVisible=false;
        ElMessage.success("数据校验通过，允许执行导入");
        state.canSubmit=true;
      }
    };
    return {
      ...toRefs(state),
      changeExcel
    }
  },
}
</script>

<style scoped>

</style>
