<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showNavRoutes = ['home', 'businessList', 'mine', 'payment', 'orderList']

const showNav = computed(() => {
  return showNavRoutes.includes(route.name as string)
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" v-if="$route.name === 'search'" />
    </keep-alive>
    <component :is="Component" v-if="$route.name !== 'search'" />
  </router-view>

  <div v-if="showNav"
      class="w-full h-[14vw] border-t border-[#DDD]
              fixed left-0 bottom-0 flex justify-around items-center bg-white"
  >
    <div class="text-center" @click="navigateTo('/home')">
      <i-material-symbols-house-rounded class="text-[#888] text-[6vw] ml-[0.5vw]"/>
      <span class="text-[#888] text-[4vw] font-medium">首页</span>
    </div>
    <div class="text-center">
      <i-tdesign-compass class="text-[#888] text-[6vw] ml-[0.5vw]"/>
      <span class="text-[#888] text-[4vw] font-medium">发现</span>
    </div>
    <div class="text-center" @click="navigateTo('/orderList')">
      <i-material-symbols-text-snippet-outline-sharp class="text-[#888] text-[6vw] ml-[0.5vw]"/>
      <span class="text-[#888] text-[4vw] font-medium">订单</span>
    </div>
    <div class="text-center" @click="navigateTo('/mine')">
      <i-ic-round-person class="text-[#888] text-[6vw] ml-[0.5vw]"/>
      <span class="text-[#888] text-[4vw] font-medium">我的</span>
    </div>
  </div>
</template>

<style scoped>

</style>