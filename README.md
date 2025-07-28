<img width="581" height="918" alt="image" src="https://github.com/user-attachments/assets/c595f1ca-3c41-4224-a069-e3fec34c2f02" />

<img width="1910" height="900" alt="image" src="https://github.com/user-attachments/assets/ed99ede6-a34a-41ed-b2b6-fce9d2ceada3" />


# synallage_exchange

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


降级OpenZeppelin版本：
从 @openzeppelin/contracts@^5.4.0 降级到 @openzeppelin/contracts@^4.9.0
这样可以继续使用 _transfer 函数重写，而不需要重写 _update 函数


NODE_OPTIONS=--openssl-legacy-provider
适配VUE版本低
