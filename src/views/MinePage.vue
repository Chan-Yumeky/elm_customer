<script setup lang="ts">
import MineHeader from "@/components/mine/MineHeader.vue";
import { onMounted, ref } from "vue";
import type { AccountVO } from "@/type/accountVO.ts";
import axios from "axios";
import router from "@/router/index.ts";
import {logout} from "@/net";

const account = ref<AccountVO | null>(null);
const loading = ref<boolean>(true);
const error = ref<string>("");

const fetchAccountInfo = async () => {
  try {
    const tokenData = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
    if (!tokenData) {
      throw new Error('未找到访问令牌！');
    }
    const parsedToken = JSON.parse(tokenData);
    const id = parsedToken.id;
    const token = parsedToken.token;

    if (!id || !token) {
      throw new Error('用户ID或token不存在！');
    }

    const response = await axios.get('/api/account/get-account-by-userId', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        userId: id
      }
    });

    // RestBean 格式：{ code: 200, message: "...", data: {...} }
    if (response.data && response.data.code === 200) {
      account.value = response.data.data;
    } else {
      error.value = response.data?.message || '无法加载个人信息，请稍后重试。';
    }
  } catch (err) {
    console.error('获取个人信息失败:', err);
    error.value = '无法加载个人信息，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

const userLogout = () => {
  logout(() => router.push('/'))
}

onMounted(() => {
  fetchAccountInfo();
});
</script>

<template>
  <MineHeader/>

  <div class="w-full max-w-md mt-6 p-4 bg-white shadow-md rounded-lg">
    <div v-if="loading" class="text-center text-lg text-gray-700">
      加载中...
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      {{ error }}
    </div>
    <div v-else-if="account" class="flex flex-col items-center">
      <img
          :src="account.userImg || '/img/userImg/yhtx01.png'"
          :alt="`${account.userName} 的头像`"
          class="w-24 h-24 rounded-full object-cover mt-[10vw]"
      />
      <h2 class="mt-4 text-2xl font-semibold text-gray-800">
        {{ account.userName }}
      </h2>
      <p class="mt-2 text-gray-600">
        性别：{{ account.userSex === 1 ? '男' : account.userSex === 2 ? '女' : '其他' }}
      </p>
      <p class="mt-1 text-gray-600">
        邮箱：{{ account.email }}
      </p>
    </div>
    <div v-else class="text-center text-gray-700">
      未找到个人信息。
    </div>
  </div>
  <div class="flex justify-center items-center mt-[5vw]">
    <el-button @click="userLogout" type="danger" plain class="w-[80vw]">退出登录</el-button>
  </div>

</template>

<style scoped>

</style>
