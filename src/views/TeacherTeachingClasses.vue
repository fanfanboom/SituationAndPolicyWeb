<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcustomization"></i> 我的教学班
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div style="margin-bottom: 10px">
        <el-select v-model="queryObject.xnm" placeholder="学年" style="margin-right: 10px;margin-bottom: 5px">
          <el-option v-for="(item,index) in xnms" :label="item" :value="item" :key="index"></el-option>
        </el-select>
        <el-select v-model="queryObject.xqm" placeholder="学期" style="margin-right: 10px;margin-bottom: 5px">
          <el-option label="1" value="1"></el-option>
          <el-option label="2" value="2"></el-option>
        </el-select>
        <el-select v-model="queryObject.course.id" placeholder="课程" style="margin-right: 10px;margin-bottom: 5px">
          <el-option v-for="(item,index) in courses" :value="item.id" :key="index" style="margin-right: 10px">
            <template #default>
              {{ item.id }}-{{ item.kcm }}
            </template>
          </el-option>
        </el-select>
        <el-select v-model="queryObject.classType" placeholder="教学班类型" style="margin-right: 10px;margin-bottom: 5px">
          <el-option value="正考" label="正考"></el-option>
          <el-option value="补缓考" label="补缓考"></el-option>
        </el-select>
        <el-select v-model="queryObject.classState" placeholder="教学班状态" style="margin-right: 10px;margin-bottom: 5px">
          <el-option value="锁定" label="锁定"></el-option>
          <el-option value="录入" label="录入"></el-option>
          <el-option value="保存" label="保存"></el-option>
          <el-option value="部分提交" label="部分提交"></el-option>
          <el-option value="提交" label="提交"></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="pagedData.content" border>
        <el-table-column label="序号" width="50" align="center">
          <template #default="scope">
            {{ pagedData.pageable.pageNumber * pagedData.pageable.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="学年" prop="xnm" width="90" align="center"></el-table-column>
        <el-table-column label="学期" prop="xqm" width="50" align="center"></el-table-column>
        <el-table-column label="课程" width="100" align="center">
          <template #default="scope">
            {{ scope.row.course.id }}<br>{{ scope.row.course.kcm }}
          </template>
        </el-table-column>
        <el-table-column label="教学班名" prop="name" width="240"></el-table-column>
        <el-table-column label="成绩组成" width="270">
          <template #default="scope">
            <span v-if="scope.row.classType === '正考'">
              平时：{{ scope.row.usualPercentage }};期末：{{ scope.row.examPercentage }}
            <span v-if="scope.row.classState==='录入' || scope.row.classState==='保存'">
              <el-button icon="el-icon-connection" type="primary" size="small"
                         @click="handleViewProportionSet(scope.row)">调整分项比例</el-button>
            </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="教学班类型" prop="classType" width="100" align="center"></el-table-column>
        <el-table-column label="教学班状态" prop="classState" width="100" align="center"></el-table-column>
        <el-table-column label="快捷操作">
          <template #default="scope">
            <el-button type="success" size="small" icon="el-icon-search"
                       @click="handleViewStudentsInTeachingClass(scope.row)">学生名单
            </el-button>
            <el-button type="primary" size="small" icon="el-icon-edit"
                       @click="handleOpenScoreCommitDialog(scope.row)">成绩提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination background layout="total, prev, pager, next" :current-page="pagedData.pageable.pageNumber+1"
                       :page-size="pagedData.pageable.pageSize" :total="pagedData.totalElements"
                       @current-change="handlePageChange"></el-pagination>
      </div>
    </div>

    <el-dialog :title="`教学班：${viewedTeachingClass.name}的学生名单`" v-model="dialogVisible">
      <el-table :data="students" border>
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="id" label="学号"></el-table-column>
        <el-table-column prop="personName" label="姓名"></el-table-column>
        <el-table-column prop="myClass" label="班级"></el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :title="`教学班${viewedTeachingClass.name}的分项比例设置`" v-model="proportionSetVisible" width="35%">
      <el-tag type="danger" size="large" style="margin-bottom: 10px">
        Tips:正考教学班仅在录入/保存状态下允许调整成绩分项比例。部分提交/提交状态不允许调整。
      </el-tag>
      <el-form>
        <el-form-item label="平时成绩">
          <el-input v-model="usualPercentage" style="width: 110px">
            <template #append> %</template>
          </el-input>
        </el-form-item>
        <el-form-item label="期末成绩">
          <el-input v-model="examPercentage" style="width: 110px">
            <template #append> %</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleUpdateProportionSet">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="`教学班${viewedTeachingClass.name}成绩提交`" v-model="scoreCommitDialogVisible" width="90%">
      <div style="margin-bottom: 10px;text-align: right">
        <el-button type="primary" size="small" icon="el-icon-document" @click="handleScoresOutput">导出成绩提交模板</el-button>
      </div>
      <el-table :data="scores" border>
        <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
        <el-table-column prop="student.id" label="学号"></el-table-column>
        <el-table-column prop="student.personName" label="姓名"></el-table-column>
        <el-table-column prop="student.myClass" label="班级"></el-table-column>
        <el-table-column :label="`平时成绩（${viewedTeachingClass.usualPercentage}%）`"
                         v-if="viewedTeachingClass.usualPercentage !== null">
          <template #default="scope">
            <el-input v-model="scope.row.usualScore"></el-input>
          </template>
        </el-table-column>
        <el-table-column :label="`期末成绩（${viewedTeachingClass.examPercentage}%）`"
                         v-if="viewedTeachingClass.examPercentage !== null">
          <template #default="scope">
            <el-input v-model="scope.row.examScore"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="finalScore" label="最终成绩"></el-table-column>
        <el-table-column label="成绩备注">
          <template #default="scope">
            <el-select v-model="scope.row.callout">
              <el-option label="" value=""></el-option>
              <el-option label="违纪" value="违纪"></el-option>
              <el-option label="作弊" value="作弊"></el-option>
              <el-option label="旷考" value="旷考"></el-option>
              <el-option label="申请缓考" value="申请缓考"></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue";
import service from "../utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import ExcelExport from "../utils/ExcelExport";

export default {
  name: "TeachingClasses",
  setup() {
    const state = reactive({
      xnms: [],
      courses: [],
      queryObject: {
        xnm: "",
        xqm: "",
        course: {
          id: ""
        },
        classType: "",
        classState: "",
      },
      pagedData: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageable: {
          pageNumber: 1,
          pageSize: 10,
        }
      },
      dialogVisible: false,
      viewedTeachingClass: {
        name: ""
      },
      students: [],
      proportionSetVisible: false,
      usualPercentage: 30,
      examPercentage: 70,
      scoreCommitDialogVisible: false,
      scores: []
    });
    const getData = () => {
      service.post(`/api/teachingClass/query/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}
      /ASC/name`, state.queryObject).then(res => {
        state.pagedData = res.obj;
      })
    };
    onMounted(() => {
      getData();
      service.get("/api/teachingClass/allXnms").then(res => {
        state.xnms = res.obj;
      });
      service.get("/api/course/all").then(res => {
        state.courses = res.obj;
      })
    });
    const handlePageChange = (pageIndex) => {
      state.pagedData.pageable.pageNumber = pageIndex;
      getData();
    };
    const handleSearch = () => {
      //设置回到第一页，以免页数错误导致查询失败
      state.pagedData.pageable.pageNumber = 1;
      getData();
    };
    const handleViewStudentsInTeachingClass = (teachingClass) => {
      state.viewedTeachingClass = teachingClass;
      state.dialogVisible = true;
      state.scores = [];
      service.get(`/api/score/findStudentsInTeachingClass/${state.viewedTeachingClass.id}`).then(res => {
        state.students = res.obj;
      })
    };
    const handleViewProportionSet = (teachingClass) => {
      state.viewedTeachingClass = teachingClass;
      state.proportionSetVisible = true;
      state.usualPercentage = teachingClass.usualPercentage;
      state.examPercentage = teachingClass.examPercentage;
    };
    const handleUpdateProportionSet = () => {
      if ((parseInt(state.usualPercentage) + parseInt(state.examPercentage)) !== 100) {
        ElMessage.error("请正确设置成绩分项比例，两项之和应为100");
      } else {
        service.post(`/api/teachingClass/updateProportionSet/${state.viewedTeachingClass.id}/${state.usualPercentage}/${state.examPercentage}`).then(() => {
          state.proportionSetVisible = false;
          handleSearch();
        })
      }
    };
    const handleOpenScoreCommitDialog = (teachingClass) => {
      state.viewedTeachingClass = teachingClass;
      state.scoreCommitDialogVisible = true;
      service.get(`/api/score/findScoresInTeachingClass/${state.viewedTeachingClass.id}`).then(res => {
        state.scores = res.obj;
      })
    };
    const handleScoresOutput = () => {
      ElMessageBox.alert("1.下载表格后，请按'Ctrl+A'全选，然后点击‘格式-自动调整列宽’进行宽度调整，以便更好录入。" +
          "<br>2.违纪/作弊/旷考/申请缓考等成绩备注请导入系统以后，在页面中进行标注。", "提示",{
        confirmButtonText:"我已知悉，开始导出",
        dangerouslyUseHTMLString:true
      }).then(()=>{
        let outputScores = state.scores.map(item => {
          return {学号: item.student.id,姓名:item.student.personName,班级:item.student.myClass,平时成绩:item.usualScore,期末成绩:item.examScore}
        });
        ExcelExport(outputScores,state.viewedTeachingClass.name);
      })
    }
    return {
      ...toRefs(state),
      handlePageChange,
      handleSearch,
      handleViewStudentsInTeachingClass,
      handleViewProportionSet,
      handleUpdateProportionSet,
      handleOpenScoreCommitDialog,
      handleScoresOutput
    }
  },
}
</script>

<style scoped>

</style>
