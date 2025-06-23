<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from "axios";
import router from "@/router/index.ts";

interface Category {
  id: number;
  name: string;
}

const categories = ref<Category[]>([]);

const categoryImages: Record<number, string> = {
  1: '/img/dcfl01.png',
  2: '/img/dcfl02.png',
  3: '/img/dcfl03.png',
  4: '/img/dcfl04.png',
  5: '/img/dcfl05.png',
  6: '/img/dcfl06.png',
  7: '/img/dcfl07.png',
  8: '/img/dcfl08.png',
  9: '/img/dcfl09.png',
  10: '/img/dcfl10.png'
};

// 获取分类图像
const getCategoryImage = (id: number): string => {
  return categoryImages[id];
}

// 请求获取分类数据
const fetchCategories = async () => {
  try {
    // 1. 获取 token
    const str = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!str) {
      console.error("未找到 token");
      return;
    }
    const authObj = JSON.parse(str);
    const token = authObj.token;
    if (!token) {
      console.error("token 不存在");
      return;
    }

    const response = await axios.get("/api/business/get-all-categories", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 3. 解析后端返回的数据
    // 后端返回格式：{ code: 200, message: "...", data: { id: name, ... } }
    if (response.data && response.data.code === 200) {
      const categoryMap = response.data.data; // { id: name }
      categories.value = Object.entries(categoryMap).map(([id, name]) => ({
        id: Number(id),
        name: name as string
      }));
    } else {
      console.warn("获取分类数据失败:", response.data?.message);
    }
  } catch (error) {
    console.error("获取分类数据失败:", error);
  }
};

// 跳转到商家列表页面
const changeToBusinessList = (orderTypeId: number) => {
  router.push({ name: 'businessList', query: { orderTypeId: orderTypeId } });
};

// 初始化时获取分类数据
onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="w-full h-[43vw] flex flex-wrap justify-around items-center mt-[4vw]">
    <div
        v-for="category in categories"
        :key="category.id"
        class="w-[18vw] h-[20vw] flex flex-col justify-center items-center user-select-none cursor-pointer"
        @click="changeToBusinessList(category.id)"
    >
      <img :src="getCategoryImage(category.id)" :alt="category.name"
           class="w-[16vw] h-[16vw] object-cover"/>
      <span class="text-[3.55vw] text-gray-600 mt-2">{{ category.name }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>