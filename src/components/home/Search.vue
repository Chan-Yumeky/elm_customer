<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const isFixed = ref(false);
const router = useRouter();

const handleScroll = () => {
  const scroll = window.scrollY;
  const width = document.documentElement.clientWidth;
  isFixed.value = scroll > width * 0.12;
};

const goToSearch = () => {
  router.push({ name: 'search', query: { reset: 1 } });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="w-full h-[13vw]">
    <div class="w-full h-[13vw] bg-[#0097FF] flex justify-center items-center"
        :class="{'fixed top-0 left-0 z-10': isFixed}"
        id="fixed-box"
    >
      <div class="w-[90%] h-[9vw] bg-white rounded-[2px] flex justify-center items-center
                  text-[3.5vw] text-[#AEAEAE] font-[宋体] user-select-none"
           @click="goToSearch"
           style="cursor:pointer;"
      >
        <i-ph-magnifying-glass-bold class="mr-[1vw]"/>
        <span>搜索饿了么商家、商品名称</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
