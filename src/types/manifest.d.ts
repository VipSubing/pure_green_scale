declare module "@/manifest.json" {
  export interface Manifest {
    name: string;
    appid: string;
    description: string;
    versionName: string;
    versionCode: string;
    env: {
      USER_ENV: string;
    };
  }

  const manifest: Manifest;
  export default manifest;
}
