<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import type { FoodVO } from '@/type/foodVO.ts';
import type { CartVO } from "@/type/cartVO.ts";
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();

const props = defineProps<{
  businessId: number;
}>();

const foodList = ref<FoodVO[]>([]);
const foodListForView = ref<(FoodVO & { quantity: number })[]>([]);
const loading = ref<boolean>(true);
const error = ref<string>('');

function getTokenAndId() {
  const str = localStorage.getItem("access_token") || sessionStorage.getItem('access_token');
  if (!str) throw new Error('未找到访问令牌！');
  const parsed = JSON.parse(str);
  if (!parsed.token) throw new Error('未找到 token！');
  if (!parsed.id) throw new Error('未找到用户ID！');
  return { token: parsed.token as string, id: parsed.id as string | number };
}

// 获取食物数据
const fetchFoodList = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { token } = getTokenAndId();
    const response = await axios.get('/api/food/list-food-by-BusinessId', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { businessId: props.businessId }
    });
    if (response.data && response.data.code === 200) {
      foodList.value = response.data.data;
      await fetchCartList(); // 先拿到 foodList，再拉购物车，保证 setCartList 能合并 foodPrice
    } else {
      error.value = response.data?.message || '无法加载食物列表，请稍后重试。';
    }
  } catch (err) {
    console.error('获取食物列表失败:', err);
    error.value = '无法加载食物列表，请稍后重试。';
  } finally {
    loading.value = false;
  }
};

// 获取购物车数据
const fetchCartList = async () => {
  try {
    const { token, id } = getTokenAndId();
    const response = await axios.post('/api/cart/list-cart', {
      userId: id,
      businessId: props.businessId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.data && response.data.code === 200) {
      cartStore.setCartList(response.data.data, foodList.value);
      mergeFoodAndCart();
    } else {
      error.value = response.data?.message || '无法加载购物车，请稍后重试。';
    }
  } catch (err) {
    console.error('获取购物车失败:', err);
    error.value = '无法加载购物车，请稍后重试。';
  }
};

// 合并食物和购物车数据
const mergeFoodAndCart = () => {
  foodListForView.value = foodList.value.map(food => {
    const cartItem = cartStore.cartList.find(cart => cart.foodId === food.foodId);
    return {
      ...food,
      quantity: cartItem ? cartItem.quantity : 0
    };
  });
};

// 更新购物车数量
const updateCartQuantity = async (foodId: number, currentQuantity: number, foodPrice: number) => {
  const newQuantity = currentQuantity + 1;
  try {
    const { token, id } = getTokenAndId();
    const cartItem = cartStore.cartList.find(cart => cart.foodId === foodId);
    let response;
    if (!cartItem) {
      response = await axios.post('/api/cart/save-cart', {
        userId: id,
        businessId: props.businessId,
        foodId: foodId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      response = await axios.post('/api/cart/update-cart', {
        userId: id,
        businessId: props.businessId,
        foodId: foodId,
        quantity: newQuantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    if (response.data && response.data.code === 200) {
      await fetchCartList();
    } else {
      error.value = response.data?.message || '操作失败，请稍后重试。';
    }
  } catch (err) {
    console.error('更新购物车失败:', err);
    error.value = '操作失败，请稍后重试。';
  }
};

// 移除购物车中的食物
const removeCartItem = async (foodId: number, currentQuantity: number, foodPrice: number) => {
  if (currentQuantity > 0) {
    const newQuantity = currentQuantity - 1;
    try {
      const { token, id } = getTokenAndId();
      let response;
      if (newQuantity > 0) {
        response = await axios.post('/api/cart/update-cart', {
          userId: id,
          businessId: props.businessId,
          foodId: foodId,
          quantity: newQuantity
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        response = await axios.post('/api/cart/remove-cart', {
          userId: id,
          businessId: props.businessId,
          foodId: foodId
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      if (response.data && response.data.code === 200) {
        await fetchCartList();
      } else {
        error.value = response.data?.message || '操作失败，请稍后重试。';
      }
    } catch (err) {
      console.error('更新购物车失败:', err);
      error.value = '操作失败，请稍后重试。';
    }
  }
};

onMounted(() => {
  if (props.businessId) {
    fetchFoodList();
  } else {
    error.value = '缺少 businessId 参数。';
    loading.value = false;
  }
});

watch(() => props.businessId, (newId) => {
  if (newId) {
    fetchFoodList();
  }
});
</script>

<template>
  <div class="w-full flex flex-col px-[2vw]">
    <div v-if="loading" class="text-center text-lg mt-4">加载中...</div>
    <div v-else-if="error" class="text-center text-red-500 mt-4">{{ error }}</div>
    <div v-else>
      <div class="w-full">
        <div
            v-for="food in foodListForView"
            :key="food.foodId"
            class="w-full h-[25vw] flex justify-between items-center  border-b border-gray-300"
        >
          <!-- 左侧信息 -->
          <div class="flex items-center">
            <img
                :src="food.foodImg || '/img/sp01.png'"
                :alt="food.foodName"
                class="w-[20vw] h-[20vw] object-cover"
            />
            <div class="ml-[3vw] flex flex-col">
              <h3 class="text-[4.5vw] text-gray-700 font-bold">{{ food.foodName }}</h3>
              <span class="text-[3.5vw] text-gray-600 mt-[2vw]">{{ food.foodExplain }}</span>
              <span class="text-[3.5vw] text-gray-600 mt-[2vw]">&#165;{{ food.foodPrice }}</span>
            </div>
          </div>
          <!-- 右侧操作 -->
          <div class="w-[16vw] flex justify-between items-center mr-[1vw]">
            <i-material-symbols-add-circle-rounded
                class="text-[5.5vw] text-blue-500 cursor-pointer"
                @click="updateCartQuantity(food.foodId, food.quantity, food.foodPrice)"
            />
            <p class="text-[3.6vw] text-gray-800 mx-[1vw]">{{ food.quantity }}</p>
            <i-material-symbols-do-not-disturb-on
                class="text-[5.5vw] text-gray-500 cursor-pointer"
                @click="removeCartItem(food.foodId, food.quantity, food.foodPrice)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>