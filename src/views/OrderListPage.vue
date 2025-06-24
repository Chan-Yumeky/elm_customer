<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import OrderListHeader from "@/components/orderList/orderListHeader.vue";
import type { AllOrderListVO } from "@/type/allOrderListVO.ts";

interface RestBean<T> {
  code: number;
  data: T;
  message: string;
}

// 状态变量
const allOrderList = ref<AllOrderListVO>({
  paidList: [],
  unpaidList: []
});

// 用于控制每个订单详情的显示状态
const orderDetailVisibility = ref<Record<string, boolean>>({});

// 获取订单信息的函数
const fetchAllOrders = async () => {
  try {
    const tokenData = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
    if (!tokenData) throw new Error('未找到访问令牌！');

    const { token, id } = JSON.parse(tokenData);

    // 明确告诉 axios，我们期望获得 RestBean<AllOrderListVO> 类型的数据
    const response = await axios.get<RestBean<AllOrderListVO>>('/api/orders/get-all-order-info', {
      params: {
        userId: id
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data && response.data.code === 200) {
      allOrderList.value = response.data.data;

      // 初始化每个订单的详情显示状态为 false
      const visibility: Record<string, boolean> = {};
      if (response.data.data.paidList) {
        response.data.data.paidList.forEach((_: any, index: number) => {
          visibility[`paid-${index}`] = false;
        });
      }
      if (response.data.data.unpaidList) {
        response.data.data.unpaidList.forEach((_: any, index: number) => {
          visibility[`unpaid-${index}`] = false;
        });
      }
      orderDetailVisibility.value = visibility;
    } else {
      console.error('获取订单信息失败:', response.data?.message || '未知错误');
      allOrderList.value = { paidList: [], unpaidList: [] };
    }
  } catch (error) {
    console.error('获取订单信息失败:', error);
    allOrderList.value = { paidList: [], unpaidList: [] };
  }
};

// 切换订单详情显示状态的函数
const toggleOrderDetail = (key: string) => {
  orderDetailVisibility.value[key] = !orderDetailVisibility.value[key];
};

onMounted(() => {
  fetchAllOrders();
});
</script>

<template>
  <OrderListHeader />

  <h3 class="mt-[12vw] mb-0 p-[4vw] text-[4vw] font-light text-[#777]">
    已支付订单信息：
  </h3>
  <div class="w-full">
    <div v-if="allOrderList.paidList.length > 0">
      <div
          v-for="(order, index) in allOrderList.paidList"
          :key="`paid-${index}`"
          class="w-full mb-[4vw]"
      >
        <div class="flex justify-between items-center p-[2vw] text-[#666] text-[4.5vw]">
          <span class="flex items-center">
            {{ order.businessName }}
            <i-octicon-triangle-down-24
                v-if="!orderDetailVisibility[`paid-${index}`]"
                class="ml-[1vw] mt-[0.5vw] cursor-pointer"
                @click="toggleOrderDetail(`paid-${index}`)"
            />
            <i-octicon-triangle-up-24
                v-else
                class="ml-[1vw] mt-[0.5vw] cursor-pointer"
                @click="toggleOrderDetail(`paid-${index}`)"
            />
          </span>
          <div class="flex">
            <span class="text-[orangered]">¥ {{ order.totalPrice }}</span>
          </div>
        </div>
        <div v-show="orderDetailVisibility[`paid-${index}`]" class="w-full">
          <div
              v-for="(pair, foodId) in order.foodList"
              :key="foodId"
              class="flex justify-between items-center px-[4vw] py-[1vw] text-[#666] text-[3.5vw]"
          >
            <span>{{ pair.first }} x {{ pair.second.first }}</span>
            <span>¥ {{ pair.second.second }}</span>
          </div>
          <div class="flex justify-between items-center px-[4vw] py-[1vw] text-[#666] text-[3.5vw]">
            <span>配送费</span>
            <span>¥ {{ order.deliveryPrice }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-[#999] p-[4vw]">
      暂无信息
    </div>
  </div>

  <h3 class="mt-[12vw] mb-0 p-[4vw] text-[4vw] font-light text-[#777]">
    未支付订单信息：
  </h3>
  <div class="w-full">
    <div v-if="allOrderList.unpaidList.length > 0">
      <div
          v-for="(order, index) in allOrderList.unpaidList"
          :key="`unpaid-${index}`"
          class="w-full mb-[4vw]"
      >
        <div class="flex justify-between items-center p-[2vw] text-[#666] text-[4.5vw]">
          <span class="flex items-center">
            {{ order.businessName }}
            <i-octicon-triangle-down-24
                v-if="!orderDetailVisibility[`unpaid-${index}`]"
                class="ml-[1vw] mt-[0.5vw] cursor-pointer"
                @click="toggleOrderDetail(`unpaid-${index}`)"
            />
            <i-octicon-triangle-up-24
                v-else
                class="ml-[1vw] mt-[0.5vw] cursor-pointer"
                @click="toggleOrderDetail(`unpaid-${index}`)"
            />
          </span>
          <div class="flex">
            <span class="text-[orangered]">¥ {{ order.totalPrice }}</span>
          </div>
        </div>
        <div v-show="orderDetailVisibility[`unpaid-${index}`]" class="w-full">
          <div
              v-for="(pair, foodId) in order.foodList"
              :key="foodId"
              class="flex justify-between items-center px-[4vw] py-[1vw] text-[#666] text-[3.5vw]"
          >
            <span>{{ pair.first }} x {{ pair.second.first }}</span>
            <span>¥ {{ pair.second.second }}</span>
          </div>
          <div class="flex justify-between items-center px-[4vw] py-[1vw] text-[#666] text-[3.5vw]">
            <span>配送费</span>
            <span>¥ {{ order.deliveryPrice }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-[#999] p-[4vw]">
      暂无信息
    </div>
  </div>
</template>

<style scoped>

</style>