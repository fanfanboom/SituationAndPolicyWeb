<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcustomization"></i> 批量导入教学班&选课
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div style="margin-bottom: 10px">
        <input type="file" accept=".xls,.xlsx" class="upload-file" @change="changeExcel($event)">
        <el-button type="warning" icon="el-icon-top"
                   style="margin-right: 10px" :disabled="!canSubmit">提交导入
        </el-button>
        <el-tag type="danger" size="large" style="margin-right: 5px">Tips:导入教学班前，请确保已完成“基础信息”-“学生信息”的批量更新。</el-tag>
        <el-tag type="primary" size="large">Tips:已经导入过的教学班，请勿重复导入。</el-tag>
      </div>
      <el-table :data="tableData" border>
        <el-table-column label="序号" width="70" align="center" type="index"></el-table-column>
        <el-table-column label="学年" prop="teachingClass.xnm" width="100" align="center"></el-table-column>
        <el-table-column label="学期" prop="teachingClass.xqm" width="50" align="center"></el-table-column>
        <el-table-column label="课程号" prop="teachingClass.course.id" align="center"></el-table-column>
        <el-table-column label="教学班" prop="teachingClass.name"></el-table-column>
        <el-table-column label="学号" prop="student.id"></el-table-column>
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
import {ElMessage} from "element-plus";
import * as XLSX from "xlsx";
import service from "../utils/request";

export default {
  name: "SelectedCoursesImport",
  setup() {
    const state = reactive({
      canSubmit: false,
      courses: [],
      existedTeachingClassNames: [],
      tableData: [],
      info: "",
      dialogVisible: false
    });
    onMounted(() => {
      //读取课程列表
      service.get("/api/course/all").then(res => {
        state.courses = res.obj;
      });
      //读取近3年教学班名称列表
      service.get("/api/teachingClass/findRecentYearsTeachingClasses/3").then(res => {
        state.existedTeachingClassNames = res.obj;
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
        console.log('ws:', ws) // 转换成json的数据
        state.tableData = ws;
        valueCheck();
      }
      fileReader.readAsBinaryString(files[0])
    };
    const dealExcel = ws => {
      ws.forEach(score => {
        // 字段建立
        score.teachingClass = {xnm: score["学年"], xqm: score["学期"], name: score["教学班"], course: {id: score["课程代码"]}};
        score.student = {id: score["学号"]};
        // 删除无用数据
        Object.keys(score).forEach(key => {
          if (key !== "teachingClass" && key !== "student") {
            delete score[key];
          }
        });
      });
      ws.sort((a,b)=>{
        return a.teachingClass.name>b.teachingClass.name;
      });
    };
    const valueCheck = () => {
      let info1 = "";
      let info2 = "";
      //检查课程是否存在
      let courseIds = state.courses.map(course => {
        return course.id;
      });
      let unExistCourseScores = state.tableData.filter(score => {
        return courseIds.indexOf(score.teachingClass.course.id) === -1;
      });
      let unExistCourses = [];
      unExistCourseScores.map(score => {
        if (unExistCourses.indexOf(score.teachingClass.course.id) === -1) {
          unExistCourses.push(score.teachingClass.course.id);
        }
      });
      if (unExistCourses.length > 0) {
        info1 = `课程${unExistCourses.toString()}尚未添加。`
      }
      //检查教学班是否重复
      let existedTeachingClassScores = state.tableData.filter(score => {
        return state.existedTeachingClassNames.indexOf(score.teachingClass.name) > -1;
      })
      let existedTeachings = [];
      existedTeachingClassScores.map(score => {
        if (existedTeachings.indexOf(score.teachingClass.name) === -1) {
          existedTeachings.push(score.teachingClass.name);
        }
      });
      if (existedTeachings.length > 0) {
        info2 = `教学班${existedTeachings}已经存在，不允许重复导入，请删除后重新尝试导入。`;
      }
      state.info = info1 + info2;
      if (state.info === "") {
        state.dialogVisible = false;
        ElMessage.success("数据校验通过，允许执行导入");
        state.canSubmit = true;
      }
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
