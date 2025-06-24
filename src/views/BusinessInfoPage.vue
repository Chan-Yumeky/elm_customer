<script setup lang="ts">
import BusinessInfoHeader from "@/components/businessInfo/BusinessInfoHeader.vue";
import {useRoute, useRouter } from "vue-router";
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type {BusinessVO} from "@/type/businessVO.ts";
import Cart from "@/components/businessInfo/Cart.vue";
import FoodList from "@/components/businessInfo/FoodList.vue";

const route = useRoute()
const router = useRouter()

const businessId = ref<number>(Number(route.query.businessId))

const business = ref<BusinessVO | null>(null)

const loading = ref<boolean>(true)
const error = ref<string>('')

const fetchBusinessInfo = async () => {
  try {
    const tokenData = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
    if (!tokenData) {
      throw new Error('未找到访问令牌！');
    }
    const parsedToken = JSON.parse(tokenData);
    const token = parsedToken.token;

    if (!token) {
      throw new Error('token 不存在！');
    }

    const response = await axios.get('/api/business/get-business-by-businessId', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        businessId: businessId.value
      }
    });

    // RestBean 格式：{ code: 200, message: "...", data: {...} }
    if (response.data && response.data.code === 200) {
      business.value = response.data.data;
    } else {
      error.value = response.data?.message || '无法加载商家信息，请稍后重试。';
    }
  } catch (err) {
    console.error('获取商家信息失败:', err);
    error.value = '无法加载商家信息，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (businessId.value) {
    fetchBusinessInfo()
  } else {
    error.value = '缺少 businessId 参数。'
    loading.value = false
  }
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <div class="w-[full] h-[12vw]">
      <BusinessInfoHeader/>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div class="w-full h-[60vw] mt-[0.5vw] flex flex-col items-center">
        <div v-if="loading" class="text-center text-lg mt-4">加载中...</div>
        <div v-else-if="error" class="text-center text-red-500 mt-4">{{ error }}</div>
        <div v-else-if="business" class="business-info w-full h-[20vw] flex flex-col justify-center items-center">
          <img :src="business.businessImg || '/img/sj01.png'" :alt="business.businessName"
               class="w-[40vw] h-[30vw] object-cover mt-[40vw]"/>
          <h1 class="text-[5.5vw] text-gray-700 mt-[3vw] font-bold">{{ business.businessName }}</h1>
          <span class="text-[3.5vw] text-gray-600 mt-[1vw]">
        &#165;{{ business.startPrice }}起送 &#165;{{ business.deliveryPrice }}配送
      </span>
          <span class="text-[3.5vw] text-gray-600 mt-[1vw]">{{ business.businessExplain }}</span>
        </div>
      </div>
      <FoodList :businessId="businessId" />
    </div>
    <div class="w-full h-[14vw]">
      <Cart :businessId="businessId" />
    </div>
  </div>
</template>

<style scoped>

</style>