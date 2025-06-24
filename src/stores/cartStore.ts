import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartVO } from '@/type/cartVO.ts';

// 扩展类型，仅在 store 内部用
type CartVOExt = CartVO & { foodPrice?: number };

export const useCartStore = defineStore('cart', () => {
  // 存储购物车列表
  const cartList = ref<CartVOExt[]>([]);

  // 计算总数量
  const totalQuantity = computed(() => {
    return cartList.value.reduce((total, item) => total + item.quantity, 0);
  });

  // 计算总价格（数量 × 单价，单价没有时按0处理）
  const totalPrice = computed(() => {
    return cartList.value.reduce((total, item) => {
      const price = typeof item.foodPrice === 'number' && !isNaN(item.foodPrice) ? item.foodPrice : 0;
      return total + (item.quantity * price);
    }, 0);
  });

  // 只更新已有项的数量和价格，不本地新增
  const updateCart = (foodId: number, quantity: number, foodPrice: number) => {
    const item = cartList.value.find(cart => cart.foodId === foodId);
    if (item) {
      item.quantity = quantity;
      item.foodPrice = foodPrice;
    }
    // 不 push 新项，新增项交给后端
  };

  // 移除购物车中的商品
  const removeCart = (foodId: number) => {
    cartList.value = cartList.value.filter(cart => cart.foodId !== foodId);
  };

  // 用于页面刷新购物车数据（合并 foodPrice）
  const setCartList = (newList: CartVO[], foodList: { foodId: number; foodPrice: number }[]) => {
    // 合并 foodPrice
    cartList.value = newList.map(cart => {
      const food = foodList.find(f => f.foodId === cart.foodId);
      return {
        ...cart,
        foodPrice: food ? food.foodPrice : 0
      };
    });
  };

  return {
    cartList,
    totalQuantity,
    totalPrice,
    updateCart,
    removeCart,
    setCartList,
  };
});
