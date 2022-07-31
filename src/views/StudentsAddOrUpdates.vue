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
      </div>
            <el-table :data="tableData" border>
              <el-table-column label="序号" width="50" align="center" type="index"></el-table-column>
              <el-table-column label="学号" prop="id"></el-table-column>
              <el-table-column label="姓名" prop="personName"></el-table-column>
              <el-table-column label="性别" prop="sex"></el-table-column>
              <el-table-column label="年级" prop="grade"></el-table-column>
              <el-table-column label="学院" prop="department.name"></el-table-column>
              <el-table-column label="专业" prop="major.name"></el-table-column>
              <el-table-column label="班级" prop="myClass"></el-table-column>
            </el-table>
    </div>
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
    });
    onMounted(() => {
      service.get("api/department/all").then(res => {
        let departmentsList = res.obj;
        departmentsList.map(item => {
          state.departments[item.name] = item.id;
        })
        console.log(state.departments);
      });
    })
    const changeExcel = e => {
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
        dealExcel(ws);// ...对数据进行自己需要的操作
        // console.log('ws:', ws) // 转换成json的数据
        state.tableData = ws;
      }
      fileReader.readAsBinaryString(files[0])
    }
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
        sourceStudent.major.id = sourceStudent["专业号"];
        sourceStudent.major.name = sourceStudent["专业名称"];
        sourceStudent.department = {id: "", name: ""};
        sourceStudent.department.id = state.departments[sourceStudent["学院"]];
        sourceStudent.department.name = sourceStudent["学院"];
        // 删除无用数据
        Object.keys(sourceStudent).forEach(key => {
          if (key !== "id" && key !== "username" && key !== "personName" && key!=="sex" && key !== "grade" && key !== "myClass"
              && key !== "major" && key !== "department") {
            delete sourceStudent[key];
          }
        })
      })
    }
    return {
      ...toRefs(state),
      changeExcel
    }
  },
}
</script>

<style scoped>

</style>
