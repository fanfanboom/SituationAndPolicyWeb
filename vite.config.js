import vue from '@vitejs/plugin-vue'

export default {
    base: './',
    plugins: [vue()],
    optimizeDeps: {
        include: ['schart.js']
    },
    publicPath: '/',
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8307/',
                changeOrigin: true,
                ws: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            }
        }
    }
}
