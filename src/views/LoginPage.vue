<script setup lang="ts">
import { Lock, User } from "@element-plus/icons-vue";
import router from "@/router";
import { login } from "@/net/index.ts";
import { ref, reactive } from 'vue';

// formRef 类型声明
const formRef = ref<any>();

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const rules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' }
  ]
}

// 这里明确 isValid 的类型为 boolean
const userLogin = () => {
  formRef.value.validate((isValid: boolean) => {
    if (isValid) {
      login(form.username, form.password, form.remember,
          () => router.push('/home'))
    }
  });
}
</script>

<template>
  <div class="w-full h-full">
    <div class="flex justify-center items-center mt-[30%]">
      <img src="@/assets/elm.svg" class="w-[70%]" alt="">
    </div>
    <div class="mt-[10vw] flex justify-center items-center text-3xl font-semibold">登录</div>
    <div class="mt-[4vw] ml-[6vw] mr-[6vw]">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" maxlength="30" type="text" placeholder="用户名/邮箱" class="mt-[5px]">
            <template #prefix>
              <el-icon>
                <User/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" maxlength="20" type="password" placeholder="密码" class="mt-[5px]">
            <template #prefix>
              <el-icon>
                <Lock/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-row class="mt-[5px]">
          <el-col :span="12" class="text-left">
            <el-form-item prop="remember">
              <el-checkbox v-model="form.remember" label="记住我"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" class="text-right">
            <el-link @click="router.push('/reset')">忘记密码？</el-link>
          </el-col>
        </el-row>
      </el-form>
      <div class="flex justify-center items-center flex-col">
        <div class="mt-[1vw]">
          <el-button @click="userLogin" type="success" plain class="w-[80vw]">立即登录</el-button>
        </div>
        <el-divider>
          <span class="text-gray text-[0.9em]">没有账号</span>
        </el-divider>
        <div class="mt-[1vw]">
          <el-button @click="router.push('/register')" type="warning" plain class="w-[80vw]">注册账号</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>