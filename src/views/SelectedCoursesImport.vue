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
        <input type="file" accept=".xls,.xlsx" class="upload-file">
        <el-button type="warning" icon="el-icon-top"
                   style="margin-right: 10px">提交更新
        </el-button>
        <el-tag type="primary" size="large">Tips:已经导入过的教学班，请勿重复导入。</el-tag>
      </div>
    </div>
  </div>
</template>

<script>
import {reactive, toRefs} from "vue";

export default {
  name: "SelectedCoursesImport",
  setup() {
    const state = reactive({});
    return {
      ...toRefs(state)
    }
  },
}
</script>

<style scoped>

</style>
