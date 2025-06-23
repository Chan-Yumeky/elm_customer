<script setup lang="ts">
import { EditPen, Lock, Message, User } from "@element-plus/icons-vue";
import router from "@/router";
import { get, post } from "@/net/index.ts";
import { ElMessage } from "element-plus";
import { ref, reactive, computed } from 'vue';

// 冷却时间
const coldTime = ref<number>(0);  // 明确冷却时间的类型为 number

const formRef = ref<any>();  // formRef 使用 any 类型

const form = reactive({
  username: '',
  password: '',
  password_repeat: '',
  email: '',
  code: ''
});

const validateUsername = (rule: any, value: string, callback: (error?: Error) => void): void => {  // 为参数添加类型
  if (value === '') {
    callback(new Error('请输入用户名'));
  } else if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
    callback(new Error('用户名不能包含特殊字符，只能是中文/英文'));
  } else {
    callback();
  }
};

const validatePassword = (rule: any, value: string, callback: (error?: Error) => void): void => {  // 为参数添加类型
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== form.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rule = {
  username: [
    { validator: validateUsername, trigger: ['blur', 'change'] },
    { min: 1, max: 30, message: '用户名的长度必须在1-30个字符之间', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码的长度必须在6-20个字符之间', trigger: ['blur', 'change'] }
  ],
  password_repeat: [
    { validator: validatePassword, trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮件地址', trigger: 'blur' },
    { type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入获取的验证码', trigger: 'blur' },
  ]
};

const askCode = () => {
  if (isEmailValid.value) {  // `isEmailValid` 应该是一个 computed 的响应式值
    coldTime.value = 60;
    get(`/auth/ask-code?email=${form.email}&type=register`, () => {
      ElMessage.success(`验证码已发送到邮箱: ${form.email}，请注意查收`);
      const handle = setInterval(() => {
        coldTime.value--;
        if (coldTime.value === 0) {
          clearInterval(handle);
        }
      }, 1000);
    }, (message: string) => {
      ElMessage.warning(message);
      coldTime.value = 0;
    });
  } else {
    ElMessage.warning("请输入正确的电子邮件！");
  }
};

const isEmailValid = computed(() => /^[\w.-]+@[\w.-]+\.\w+$/.test(form.email));  // 用 computed 来验证邮箱格式

const register = () => {
  formRef.value.validate((isValid: boolean) => {  // 给 isValid 添加类型
    if (isValid) {
      post('/auth/register', { ...form }, () => {
        ElMessage.success('注册成功~');
        router.push('/login');
      });
    } else {
      ElMessage.warning('请完整填写注册表单内容');
    }
  });
};
</script>

<template>
  <div class="w-full h-full">
    <div class="flex justify-center items-center mt-[30%]">
      <img src="@/assets/elm.svg" class="w-[70%]" alt="">
    </div>
    <div class="mt-[10vw] flex justify-center items-center text-3xl font-semibold">注册</div>
    <div class="mt-[4vw] ml-[6vw] mr-[6vw]">
      <el-form :model="form" :rules="rule" ref="formRef">
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
        <el-form-item prop="password_repeat">
          <el-input v-model="form.password_repeat" maxlength="20" type="password" placeholder="重复密码" class="mt-[5px]">
            <template #prefix>
              <el-icon>
                <Lock/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" type="email" placeholder="电子邮件地址">
            <template #prefix>
              <el-icon>
                <Message/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-row :gutter="10" class="w-full">
            <el-col :span="16">
              <el-input v-model="form.code" :maxlength="6" type="text" placeholder="请输入验证码">
                <template #prefix>
                  <el-icon>
                    <EditPen/>
                  </el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-button @click="askCode" :disabled="!isEmailValid || coldTime" type="success">
                {{ coldTime > 0 ? `请稍后 ${coldTime} 秒` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <div class="flex justify-center items-center flex-col">
        <div class="mt-[1vw]">
          <el-button @click="register" type="warning" plain class="w-[80vw]">立即注册</el-button>
        </div>
        <div class="my-[3vw] mx-0">
          <span class="text-[1em] leading-[15px] text-gray-500">已有账号?&nbsp;&nbsp;&nbsp;</span>
          <el-link @click="router.push('/login')" type="primary" class="translate-x-0 translate-y-[-2px]">立即登录</el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>