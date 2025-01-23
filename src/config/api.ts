// API 基础路径
// 根据环境判断使用哪个baseURL
export const ISDEV = process.env.NODE_ENV === "development";

export const API_BASE_URL = ISDEV
  ? "http://127.0.0.1:8080/scale"
  : "https://subing.site/scale";

// API 路径配置
export const API_URLS = {
  // 测试相关
  PRO_TEST: `${API_BASE_URL}/api/pro-test`,
  ALL_TEST: `${API_BASE_URL}/api/all-test`,
  TEST_INFO: `${API_BASE_URL}/api/testInfo`,
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  COMPUTE: `${API_BASE_URL}/api/compute`,
};
