declare module '@/manifest.json' {
    export interface Manifest {
        name: string
        appid: string
        description: string
        versionName: string
        versionCode: string
    }

    const manifest: Manifest
    export default manifest
} 