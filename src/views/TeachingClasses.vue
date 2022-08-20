<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="iconfont el-icon-lxcustomization"></i> 教学班
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
        <br>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" icon="el-icon-search" @click="handleNoTeacherSearch">查询无主管教师教学班</el-button>
        <el-button type="primary" icon="el-icon-link" v-if="searchType==='noteacher'"
                   @click="handleOpenAllocateTeacher">批量指派主管教师
        </el-button>
        <el-button type="warning" icon="el-icon-plus" @click="handleImport">批量导入教学班&选课</el-button>
        <el-button type="primary" icon="el-icon-unlock" @click="openCommitDialogVisible=true">开放学年学期成绩提交</el-button>
      </div>

      <el-table :data="pagedData.content" border @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" v-if="searchType==='noteacher'"></el-table-column>
        <el-table-column label="序号" width="50" align="center" v-if="searchType==='normal'">
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
        <el-table-column label="成绩组成">
          <template #default="scope">
            <span
                v-if="scope.row.classType === '正考'">平时：{{ scope.row.usualPercentage }};
              期末：{{ scope.row.examPercentage }}</span>
          </template>
        </el-table-column>
        <el-table-column label="教学班类型" prop="classType" width="100" align="center"></el-table-column>
        <el-table-column label="教学班状态" prop="classState"></el-table-column>
        <el-table-column label="主管单位">
          <template #default="scope">
            <span v-if="scope.row.teacher !== null">
              {{ scope.row.teacher.department.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="主管教师">
          <template #default="scope">
            <span v-if="scope.row.teacher !== null">
              {{ scope.row.teacher.personName }}（{{ scope.row.teacher.id }}）
            </span>
          </template>
        </el-table-column>
        <el-table-column label="快捷操作">
          <template #default="scope">
            <el-button type="success" size="small"
                       @click="handleViewStudentsInTeachingClass(scope.row)">学生名单
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
    <el-dialog title="指派主管教师" v-model="allocateTeacherDialogVisible">
      教学班：
      <el-tag type="primary" v-for="(item,index) in selectedClasses" :key="index"
              style="margin-right: 5px;margin-bottom: 5px">{{ item.name }}
      </el-tag>
      <el-divider></el-divider>
      指派给：
      <el-select v-model="allocateToTeacherId" placeholder="请选择教师">
        <el-option v-for="(item,index) in teachers" :value="item.id"
                   :label="item.personName+'('+item.department.name+')'" :key="index"></el-option>
      </el-select>
      <template #footer>
        <span>
            <el-button type="primary" @click="handleAllocate">确定指派</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="开启学年学期成绩提交" v-model="openCommitDialogVisible">
      <el-form v-model="openCommit">
        <el-form-item label="学年">
          <el-select v-model="openCommit.xnm" placeholder="请选择学年">
            <el-option v-for="(item,index) in xnms" :label="item" :value="item" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="openCommit.xqm" placeholder="请选择学期">
            <el-option label="1" value="1"></el-option>
            <el-option label="2" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
            <el-button type="primary" @click="handleOpenCommit">开放提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {onMounted, reactive, toRefs} from "vue";
import service from "../utils/request";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";

export default {
  name: "TeachingClasses",
  setup() {
    const state = reactive({
      xnms: [],
      courses: [],
      teachers: [],
      allocateToTeacherId: "",
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
      allocateTeacherDialogVisible: false,
      viewedTeachingClass: {
        name: ""
      },
      students: [],
      searchType: "normal",//noteacher代表查询的是无教师的班级
      selectedClasses: [],
      openCommitDialogVisible: false,
      openCommit: {
        xnm: "",
        xqm: ""
      }
    });
    const getData = () => {
      if ("normal" === state.searchType) {
        service.post(`/api/teachingClass/query/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}
      /ASC/name`, state.queryObject).then(res => {
          state.pagedData = res.obj;
        })
      } else {
        service.get(`/api/teachingClass/findNoTeacherClasses/${state.pagedData.pageable.pageNumber}/${state.pagedData.pageable.pageSize}
        /ASC/name`).then(res => {
          state.pagedData = res.obj;
        });
        if (state.teachers.length === 0) {
          // 尚未加载教师，需要加载
          service.get("/api/teacher/findAllTeachers").then(res => {
            state.teachers = res.obj;
          })
        }
      }
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
      state.searchType = "normal";
      state.pagedData.pageable.pageNumber = 1;
      getData();
    };
    const handleNoTeacherSearch = () => {
      //设置回到第一页，以免页数错误导致查询失败
      state.searchType = "noteacher";
      state.pagedData.pageable.pageNumber = 1;
      getData();
    };
    const handleSelectionChange = (val) => {
      state.selectedClasses = val;
    }
    const handleOpenAllocateTeacher = () => {
      if (state.selectedClasses.length === 0) {
        ElMessage.error("未选择教学班");
      } else {
        state.allocateTeacherDialogVisible = true;
      }
    }
    const router = useRouter();
    const handleImport = () => {
      router.push("/selectedCourseImport");
    };
    const handleViewStudentsInTeachingClass = (teachingClass) => {
      state.viewedTeachingClass = teachingClass;
      state.dialogVisible = true;
      state.scores = [];
      service.get(`/api/score/findStudentsInTeachingClass/${state.viewedTeachingClass.id}`).then(res => {
        state.students = res.obj;
      })
    }
    const handleAllocate = () => {
      if (state.allocateToTeacherId === "") {
        ElMessage.error("尚未选择指派教师");
      } else {
        let selectedClassIds = state.selectedClasses.map(item => {
          return item.id;
        });
        service.post(`/api/teachingClass/allocate/${state.allocateToTeacherId}`, {stringList: selectedClassIds}).then(() => {
          state.allocateTeacherDialogVisible = false;
          handleNoTeacherSearch();
          state.allocateToTeacherId = "";
        })
      }
    };
    const handleOpenCommit = () => {
      if (state.openCommit.xnm === "") {
        ElMessage.error("请选择学年");
      } else {
        if (state.openCommit.xqm === "") {
          ElMessage.error("请选择学期");
        } else {
          service.post(`/api/teachingClass/updateTeachingClassesToOpen/${state.openCommit.xnm}/${state.openCommit.xqm}`).then(() => {
            state.openCommitDialogVisible = false;
            state.pagedData.pageable.pageNumber = 1;
            getData();
          })
        }
      }
    }
    return {
      ...toRefs(state),
      handlePageChange,
      handleSearch,
      handleViewStudentsInTeachingClass,
      handleImport,
      handleNoTeacherSearch,
      handleSelectionChange,
      handleOpenAllocateTeacher,
      handleAllocate,
      handleOpenCommit
    }
  },
}
</script>

<style scoped>

</style>
