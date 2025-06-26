<script setup lang="ts">
import { ref, nextTick, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { get } from '@/net/index'
import type { BusinessVO } from '@/type/businessVO'

const keyword = ref('')
const businesses = ref<BusinessVO[]>([])
const loading = ref(false)
const error = ref('')
const router = useRouter()
const route = useRoute()
const inputRef = ref<HTMLInputElement | null>(null)

const search = () => {
  if (!keyword.value.trim()) {
    error.value = '请输入商家名';
    businesses.value = [];
    return;
  }
  loading.value = true
  error.value = ''
  get(`/api/business/search?keyword=${encodeURIComponent(keyword.value)}`,
    (data: BusinessVO[]) => {
      businesses.value = data || []
      if (businesses.value.length === 0) {
        error.value = '' // 没有结果时不显示错误
      }
      loading.value = false
    },
    (msg: string) => {
      error.value = msg || '搜索失败'
      businesses.value = []
      loading.value = false
    }
  )
}

const onKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    search()
  }
}

const goToBusiness = (businessId: number) => {
  router.push({ name: 'businessInfo', query: { businessId } })
}

onActivated(() => {
  // 判断是否需要重置
  if (route.query.reset) {
    keyword.value = ''
    businesses.value = []
    error.value = ''
    // 清除reset参数，防止后续返回时又被重置
    router.replace({ name: 'search', query: {} })
  }
  // 自动聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<template>
  <div class="w-full min-h-screen bg-white pb-[14vw]">
    <div class="flex items-center px-4 py-2 border-b border-gray-200 bg-[#0097FF]">
      <input
        v-model="keyword"
        type="text"
        placeholder="请输入商家名"
        class="flex-1 border rounded px-3 py-2 text-lg"
        @keyup="onKeyup"
        ref="inputRef"
      />
      <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded" @click="search">搜索</button>
    </div>
    <div v-if="loading" class="text-center mt-8 text-lg">加载中...</div>
    <div v-if="error && !loading" class="text-center mt-8 text-red-500">{{ error }}</div>
    <div v-if="!loading && businesses.length === 0 && !error" class="text-center mt-8 text-gray-400">暂无搜索结果</div>
    <div v-else-if="businesses.length > 0">
      <div
        v-for="business in businesses"
        :key="business.businessId"
        class="w-full border-b border-gray-300 p-[2.5vw] flex items-center cursor-pointer user-select-none hover:bg-gray-50"
        @click="goToBusiness(business.businessId)"
      >
        <!-- 商家图片 -->
        <div class="relative">
          <img
            :src="business.businessImg || '/assets/img/sj01.png'"
            :alt="business.businessName"
            class="w-[20vw] h-[20vw] object-cover"
          />
        </div>
        <!-- 商家信息 -->
        <div class="ml-[3vw] flex flex-col">
          <h3 class="text-[4vw] text-gray-700 m-0 font-bold">{{ business.businessName }}</h3>
          <span class="text-[3.5vw] text-gray-600 mt-[2vw]">
            &#165;{{ business.startPrice }}起送 | &#165;{{ business.deliveryPrice }}配送
          </span>
          <span class="text-[3.5vw] text-gray-600 mt-[2vw]">{{ business.businessExplain }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style> 