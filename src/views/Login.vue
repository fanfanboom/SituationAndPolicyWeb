<template>
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-title">《形势与政策》课程成绩管理系统</div>
      <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
        <el-form-item prop="username">
          <el-input v-model="param.username" placeholder="username">
            <template #prepend>
              <el-button icon="el-icon-user"></el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="password" v-model="param.password"
                    @keyup.enter="submitForm()">
            <template #prepend>
              <el-button icon="el-icon-lock"></el-button>
            </template>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm()">登录</el-button>
        </div>
        <p class="login-tips">Tips : 默认密码为sdau+学号</p>
      </el-form>
    </div>
  </div>
</template>

<script>
import {ref, reactive} from "vue";
import {useTagsStore} from '../store/tags'
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import service from "../utils/request";

export default {
  setup() {
    const router = useRouter();
    const param = reactive({
      username: "jwc",
      password: "jwc",
    });

    const rules = {
      username: [
        {
          required: true,
          message: "请输入用户名",
          trigger: "blur",
        },
      ],
      password: [
        {required: true, message: "请输入密码", trigger: "blur"},
      ],
    };
    const login = ref(null);
    const submitForm = () => {
      login.value.validate((valid) => {
        if (valid) {
          service.post('/api/login', param).then((data) => {
            console.log(data.msg)
            if (data.msg === '登录成功!') {
              sessionStorage.setItem("loginUser", JSON.stringify(data.obj))
              router.push("/");
            }
          })
        } else {
          ElMessage.error("请补全信息后再次登录");
          return false;
        }
      });
    };

    const tags = useTagsStore();
    tags.clearTags();

    return {
      param,
      rules,
      login,
      submitForm,
    };
  },
};
</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(../assets/img/sdau-bg.jpg);
  background-size: 100%;
}

.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  color: darkgreen;
  border-bottom: 1px solid #ddd;
}

.ms-login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 350px;
  margin: -190px 0 0 -175px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.ms-content {
  padding: 30px 30px;
}

.login-btn {
  text-align: center;
}

.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}

.login-tips {
  font-size: 16px;
  line-height: 30px;
  color: darkgreen;
  text-align: center;
}
</style>
