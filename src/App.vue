<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("App Launch");
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style lang="scss">
// @import './uni.scss';
page {
  background: $uni-bg-color-grey;
  /* // 或
  background: linear-gradient(to bottom, #4BB8FF, #6149F6);  // 渐变背景
  // 或
  background-image: url('/static/bg.png');  // 图片背景
  background-size: cover;
  background-repeat: no-repeat;
  min-height: 100vh; */
}
</style>
